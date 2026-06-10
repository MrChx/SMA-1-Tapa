import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus siswa." }, { status: 500 });
  }
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const student = await prisma.student.update({
      where: { id },
      data: { name: body.name?.toUpperCase(), kelas: body.kelas, photoUrl: body.photoUrl },
    });
    return NextResponse.json(student);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate siswa." }, { status: 500 });
  }
}
