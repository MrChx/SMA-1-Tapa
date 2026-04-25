import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.directoryMember.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.photoUrl && existing.photoUrl && body.photoUrl !== existing.photoUrl) {
      await deleteFile(existing.photoUrl);
    }

    const member = await prisma.directoryMember.update({
      where: { id },
      data: { name: body.name, role: body.role, photoUrl: body.photoUrl ?? existing.photoUrl },
    });
    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.directoryMember.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.photoUrl) await deleteFile(existing.photoUrl);
    await prisma.directoryMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus." }, { status: 500 });
  }
}
