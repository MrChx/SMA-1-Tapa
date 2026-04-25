import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const faqs = await prisma.faq.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const faq = await prisma.faq.create({ data: { question: body.question, answer: body.answer } });
    return NextResponse.json(faq, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menambahkan FAQ." }, { status: 500 });
  }
}
