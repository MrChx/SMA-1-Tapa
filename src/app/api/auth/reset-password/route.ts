import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }

    const valid = await verifyPassword(oldPassword, session.admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Password lama salah." }, { status: 403 });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: session.admin.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
