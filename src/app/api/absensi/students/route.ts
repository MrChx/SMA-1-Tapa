import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const students = await prisma.student.findMany({
    select: { id: true, name: true, kelas: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(students);
}
