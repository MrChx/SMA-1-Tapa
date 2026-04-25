import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // optional filter

  const where = date ? { date } : {};

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: { student: { select: { name: true, kelas: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(records);
}
