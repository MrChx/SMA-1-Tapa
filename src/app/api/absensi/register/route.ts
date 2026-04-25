import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, kelas, embeddings } = await req.json();
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedKelas = typeof kelas === "string" ? kelas.trim() : "";

    if (!normalizedName || !normalizedKelas || !embeddings || !Array.isArray(embeddings) || embeddings.length !== 5) {
      return NextResponse.json({ error: "Nama, kelas, dan 5 embedding wajah diperlukan." }, { status: 400 });
    }

    // Validate each embedding is a 128-dim array
    for (const emb of embeddings) {
      if (!Array.isArray(emb) || emb.length !== 128) {
        return NextResponse.json({ error: "Setiap embedding harus berupa array 128 dimensi." }, { status: 400 });
      }
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingStudent) {
      return NextResponse.json({ error: "Siswa sudah terdaftar." }, { status: 409 });
    }

    const student = await prisma.student.create({
      data: { name: normalizedName, kelas: normalizedKelas, embeddings },
    });

    return NextResponse.json({ success: true, id: student.id, name: student.name });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Gagal mendaftarkan siswa." }, { status: 500 });
  }
}
