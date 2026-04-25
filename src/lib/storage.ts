import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "uploads";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  _supabase = createClient(url, key);
  return _supabase;
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const supabase = getSupabase();
  const ext = file.name.split(".").pop() || "jpg";
  const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(uniqueName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(uniqueName);
  return data.publicUrl;
}


export async function deleteFile(publicUrl: string): Promise<void> {
  const supabase = getSupabase();
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const filePath = publicUrl.substring(idx + marker.length);

  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) console.error("Delete file error:", error.message);
}
