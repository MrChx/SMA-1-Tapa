import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(messages);
}

// Public: user sends a contact message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = await prisma.contactMessage.create({
      data: { name: body.name, email: body.email, subject: body.subject, message: body.message },
    });
    return NextResponse.json(msg, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 500 });
  }
}
