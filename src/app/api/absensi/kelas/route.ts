import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all kelas (public)
export async function GET() {
  const kelasList = await prisma.kelas.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(kelasList);
}

// POST: Create a new kelas (admin)
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama kelas diperlukan." }, { status: 400 });
    }
    const kelas = await prisma.kelas.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(kelas);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Kelas dengan nama ini sudah ada." }, { status: 409 });
    }
    console.error("Create kelas error:", e);
    return NextResponse.json({ error: "Gagal membuat kelas." }, { status: 500 });
  }
}
