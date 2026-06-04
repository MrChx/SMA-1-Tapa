import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const sessionRole = session?.admin.role || "SUPER_ADMIN";
  if (!session || sessionRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.admin.id) {
    return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri." }, { status: 400 });
  }

  try {
    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus akun." }, { status: 500 });
  }
}
