import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const role = session.admin.role ?? "SUPER_ADMIN";
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const admins = await prisma.admin.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(admins);
  } catch (error: any) {
    console.error("[GET /api/admin/akun]", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const sessionRole = session.admin.role ?? "SUPER_ADMIN";
    if (sessionRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan password wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const admin = await prisma.admin.create({
      data: { name, email, passwordHash, role: role || "SUPER_ADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(admin);
  } catch (error: any) {
    console.error("[POST /api/admin/akun]", error);
    return NextResponse.json({ error: error.message || "Gagal membuat akun." }, { status: 500 });
  }
}
