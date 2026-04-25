import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

export async function GET() {
  const rows = await prisma.siteConfig.findMany();
  const config: Record<string, string> = {};
  for (const r of rows) config[r.key] = r.value;
  return NextResponse.json(config, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body: Record<string, string> = await req.json();
    const entries = Object.entries(body);

    const existingRows = await prisma.siteConfig.findMany({
      where: { key: { in: entries.map(([k]) => k) } },
    });
    const existingMap = new Map(existingRows.map((r) => [r.key, r.value]));

    const ops = entries.map(([key, value]) => {
      const oldValue = existingMap.get(key);

      if (oldValue && oldValue !== value && isStorageUrl(oldValue)) {
        deleteFile(oldValue).catch(() => { });
      }

      return prisma.siteConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    await prisma.$transaction(ops);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Config PUT error:", e);
    return NextResponse.json({ error: "Gagal menyimpan konfigurasi." }, { status: 500 });
  }
}

function isStorageUrl(v: string): boolean {
  return v.includes("supabase") && v.includes("/storage/");
}
