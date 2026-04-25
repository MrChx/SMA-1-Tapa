import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    const publicUrl = await uploadFile(file, folder);
    return NextResponse.json({ url: publicUrl });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
