import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: { id: true, name: true, kelas: true, photoUrl: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(students);
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
