import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await prisma.galleryItem.create({
      data: {
        category: body.category,
        title: body.title,
        summary: body.summary,
        content: body.content,
        thumbnailUrl: body.thumbnailUrl || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menambahkan kegiatan." }, { status: 500 });
  }
}
