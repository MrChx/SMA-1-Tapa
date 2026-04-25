import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const org = req.nextUrl.searchParams.get("organization");
  const where = org ? { organization: org } : {};
  const members = await prisma.organizationMember.findMany({ where, orderBy: { createdAt: "asc" } });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const member = await prisma.organizationMember.create({
      data: {
        organization: body.organization,
        name: body.name,
        role: body.role,
        photoUrl: body.photoUrl || null,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menambahkan anggota." }, { status: 500 });
  }
}
