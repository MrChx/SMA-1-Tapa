import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const cat = req.nextUrl.searchParams.get("category");
  const where = cat ? { category: cat } : {};
  const members = await prisma.directoryMember.findMany({ where, orderBy: { createdAt: "asc" } });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const member = await prisma.directoryMember.create({
      data: { category: body.category, name: body.name, role: body.role, photoUrl: body.photoUrl || null },
    });
    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menambahkan." }, { status: 500 });
  }
}
