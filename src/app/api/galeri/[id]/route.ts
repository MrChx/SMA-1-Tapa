import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.thumbnailUrl && existing.thumbnailUrl && body.thumbnailUrl !== existing.thumbnailUrl) {
      await deleteFile(existing.thumbnailUrl);
    }

    const item = await prisma.galleryItem.update({
      where: { id },
      data: {
        category: body.category,
        title: body.title,
        summary: body.summary,
        content: body.content,
        thumbnailUrl: body.thumbnailUrl ?? existing.thumbnailUrl,
      },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.thumbnailUrl) await deleteFile(existing.thumbnailUrl);
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus." }, { status: 500 });
  }
}
