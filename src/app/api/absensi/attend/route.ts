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

// ─── IMPROVED MATCHING CONSTANTS ─────────────────────────────────
// Hard threshold: reject any match above this distance
const MATCH_THRESHOLD = 0.45;
// Minimum gap between best match and second-best to ensure confidence
const MIN_MARGIN = 0.08;

/**
 * Score a student against an array of live embeddings.
 * For each live embedding, compute the AVERAGE distance to all 5 stored embeddings
 * (instead of just the minimum). Then return the MEDIAN of those averages.
 * This dramatically reduces the chance of a false positive from a single noisy frame.
 */
function scoreStudent(
  liveEmbeddings: number[][],
  storedEmbeddings: number[][]
): number {
  const avgDistances: number[] = [];

  for (const live of liveEmbeddings) {
    let total = 0;
    for (const stored of storedEmbeddings) {
      total += euclideanDistance(live, stored);
    }
    avgDistances.push(total / storedEmbeddings.length);
  }

  // Return median for robustness
  avgDistances.sort((a, b) => a - b);
  const mid = Math.floor(avgDistances.length / 2);
  return avgDistances.length % 2 === 0
    ? (avgDistances[mid - 1] + avgDistances[mid]) / 2
    : avgDistances[mid];
}

export async function POST(req: NextRequest) {
  try {
    const { embeddings: rawEmbeddings, embedding, lat, lng } = await req.json();

    // Support both single embedding (legacy) and multi-embedding (new)
    let liveEmbeddings: number[][];
    if (rawEmbeddings && Array.isArray(rawEmbeddings) && rawEmbeddings.length > 0) {
      liveEmbeddings = rawEmbeddings;
    } else if (embedding && Array.isArray(embedding) && embedding.length === 128) {
      liveEmbeddings = [embedding];
    } else {
      return NextResponse.json({ error: "Embedding wajah tidak valid." }, { status: 400 });
    }

    // Validate all embeddings are 128-dim
    for (const emb of liveEmbeddings) {
      if (!Array.isArray(emb) || emb.length !== 128) {
        return NextResponse.json({ error: "Embedding wajah tidak valid." }, { status: 400 });
      }
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

    // ─── IMPROVED FACE MATCHING ─────────────────────────────────
    const students = await prisma.student.findMany({
      select: { id: true, name: true, kelas: true, embeddings: true },
    });

    // Score every student
    const scored: { id: string; name: string; kelas: string; score: number }[] = [];
    for (const student of students) {
      const storedEmbeddings = student.embeddings as number[][];
      if (!storedEmbeddings || storedEmbeddings.length === 0) continue;
      const score = scoreStudent(liveEmbeddings, storedEmbeddings);
      scored.push({ id: student.id, name: student.name, kelas: student.kelas, score });
    }

    // Sort by score ascending (lower = more similar)
    scored.sort((a, b) => a.score - b.score);

    const best = scored[0];
    const secondBest = scored[1];

    // Reject if best score is above threshold
    if (!best || best.score > MATCH_THRESHOLD) {
      return NextResponse.json({
        error: "Wajah tidak dikenali. Pastikan Anda sudah terdaftar dan wajah terlihat jelas.",
      }, { status: 404 });
    }

    // Reject if margin between best and second-best is too small (ambiguous match)
    if (secondBest && (secondBest.score - best.score) < MIN_MARGIN) {
      return NextResponse.json({
        error: "Pencocokan wajah tidak cukup yakin. Coba posisikan wajah lebih jelas dengan pencahayaan yang baik.",
      }, { status: 404 });
    }

    const bestMatch = best;

    // Record attendance
    const now = new Date();
    const witaOffset = 8 * 60;
    const witaTime = new Date(now.getTime() + (witaOffset + now.getTimezoneOffset()) * 60000);
    const dateStr = witaTime.toISOString().split("T")[0];
    const hours = witaTime.getHours();
    const minutes = witaTime.getMinutes();
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(witaTime.getSeconds()).padStart(2, "0")}`;

    const totalMinutes = hours * 60 + minutes;
    const OPEN_TIME = 6 * 60;
    const ONTIME_END = 7 * 60 + 30;
    const CLOSE_TIME = 20 * 60;

    if (totalMinutes < OPEN_TIME || totalMinutes >= CLOSE_TIME) {
      return NextResponse.json({
        error: "Jam sekolah sudah selesai. Absensi hanya tersedia pukul 06:00 - 20:00 WITA.",
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
      confidence: Math.round((1 - bestMatch.score / MATCH_THRESHOLD) * 100),
      message: isLate
        ? `Anda absen di waktu yang terlambat (${timeStr} WITA). Batas absen tepat waktu: 07:30 WITA.`
        : `Absensi berhasil! Selamat datang, ${bestMatch.name}.`,
    });
  } catch (error) {
    console.error("Attend error:", error);
    return NextResponse.json({ error: "Gagal memproses absensi." }, { status: 500 });
  }
}
