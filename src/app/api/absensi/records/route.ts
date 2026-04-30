import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const kelas = searchParams.get("kelas");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (date) where.date = date;
  if (kelas) where.student = { kelas };

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: { student: { select: { name: true, kelas: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(records);
}
