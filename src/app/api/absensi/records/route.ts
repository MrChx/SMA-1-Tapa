import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const month = searchParams.get("month"); // format: "2026-05"
  const kelas = searchParams.get("kelas");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (date) {
    where.date = date;
  } else if (month) {
    // Filter by month: date starts with "YYYY-MM"
    where.date = { startsWith: month };
  }

  if (kelas) where.student = { kelas };

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: { student: { select: { name: true, kelas: true } } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    take: 5000,
  });

  return NextResponse.json(records);
}
