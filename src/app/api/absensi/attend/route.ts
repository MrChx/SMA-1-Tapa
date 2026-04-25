import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Euclidean distance between two 128-dim vectors
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Haversine formula: distance in meters between two GPS coordinates
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MATCH_THRESHOLD = 0.6;

export async function POST(req: NextRequest) {
  try {
    const { embedding, lat, lng } = await req.json();

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 128) {
      return NextResponse.json({ error: "Embedding wajah tidak valid." }, { status: 400 });
    }
    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Koordinat lokasi diperlukan." }, { status: 400 });
    }

    // Check location validity
    const configRows = await prisma.siteConfig.findMany({
      where: { key: { in: ["attendance_lat", "attendance_lng", "attendance_radius"] } },
    });
    const cfgMap: Record<string, string> = {};
    for (const r of configRows) cfgMap[r.key] = r.value;

    const schoolLat = parseFloat(cfgMap.attendance_lat || "0");
    const schoolLng = parseFloat(cfgMap.attendance_lng || "0");
    const radius = parseFloat(cfgMap.attendance_radius || "100");

    if (!schoolLat && !schoolLng) {
      return NextResponse.json({ error: "Lokasi absensi belum dikonfigurasi admin." }, { status: 400 });
    }

    const distance = haversineDistance(lat, lng, schoolLat, schoolLng);
    if (distance > radius) {
      return NextResponse.json({
        error: `Anda berada di luar jangkauan lokasi absensi (${Math.round(distance)}m dari sekolah, maks ${radius}m).`,
      }, { status: 403 });
    }

    // Find matching student
    const students = await prisma.student.findMany({ select: { id: true, name: true, kelas: true, embeddings: true } });

    let bestMatch: { id: string; name: string; kelas: string; dist: number } | null = null;

    for (const student of students) {
      const storedEmbeddings = student.embeddings as number[][];
      let minDist = Infinity;
      for (const stored of storedEmbeddings) {
        const dist = euclideanDistance(embedding, stored);
        if (dist < minDist) minDist = dist;
      }
      if (minDist < MATCH_THRESHOLD && (!bestMatch || minDist < bestMatch.dist)) {
        bestMatch = { id: student.id, name: student.name, kelas: student.kelas, dist: minDist };
      }
    }

    if (!bestMatch) {
      return NextResponse.json({ error: "Wajah tidak dikenali. Pastikan Anda sudah terdaftar." }, { status: 404 });
    }

    // Record attendance (prevent duplicate via unique constraint)
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0];

    try {
      await prisma.attendanceRecord.create({
        data: { studentId: bestMatch.id, date: dateStr, time: timeStr, status: "Hadir" },
      });
    } catch (e: any) {
      if (e?.code === "P2002") {
        return NextResponse.json({
          success: true,
          alreadyMarked: true,
          name: bestMatch.name,
          kelas: bestMatch.kelas,
          message: `${bestMatch.name} sudah melakukan absensi hari ini.`,
        });
      }
      throw e;
    }

    return NextResponse.json({
      success: true,
      name: bestMatch.name,
      kelas: bestMatch.kelas,
      time: timeStr,
      message: `Absensi berhasil! Selamat datang, ${bestMatch.name}.`,
    });
  } catch (error) {
    console.error("Attend error:", error);
    return NextResponse.json({ error: "Gagal memproses absensi." }, { status: 500 });
  }
}
