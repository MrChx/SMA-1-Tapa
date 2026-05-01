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
    // WITA = UTC+8
    const now = new Date();
    const witaOffset = 8 * 60; // WITA is UTC+8
    const witaTime = new Date(now.getTime() + (witaOffset + now.getTimezoneOffset()) * 60000);
    const dateStr = witaTime.toISOString().split("T")[0];
    const hours = witaTime.getHours();
    const minutes = witaTime.getMinutes();
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(witaTime.getSeconds()).padStart(2, "0")}`;

    // Late if after 07:30 WITA, blocked if outside 06:00-15:00
    const totalMinutes = hours * 60 + minutes;
    const OPEN_TIME = 6 * 60;       // 06:00
    const ONTIME_END = 7 * 60 + 30; // 07:30
    const CLOSE_TIME = 15 * 60;     // 15:00

    if (totalMinutes < OPEN_TIME || totalMinutes >= CLOSE_TIME) {
      return NextResponse.json({
        error: "Jam sekolah sudah selesai. Absensi hanya tersedia pukul 06:00 - 15:00 WITA.",
        closed: true,
      }, { status: 403 });
    }

    const isLate = totalMinutes > ONTIME_END;
    const status = isLate ? "Terlambat" : "Hadir";

    try {
      await prisma.attendanceRecord.create({
        data: { studentId: bestMatch.id, date: dateStr, time: timeStr, status },
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
      status,
      isLate,
      message: isLate
        ? `Anda absen di waktu yang terlambat (${timeStr} WITA). Batas absen tepat waktu: 07:30 WITA.`
        : `Absensi berhasil! Selamat datang, ${bestMatch.name}.`,
    });
  } catch (error) {
    console.error("Attend error:", error);
    return NextResponse.json({ error: "Gagal memproses absensi." }, { status: 500 });
  }
}
