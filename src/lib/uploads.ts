import { promises as fs } from "fs";
import path from "path";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "-").slice(0, 80);
}

export async function saveUpload(file: File, folder: "images" | "documents") {
  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeName(file.name)}`;

  const supabase = getSupabaseServer();
  if (isSupabaseConfigured() && supabase) {
    const key = `${folder}/${filename}`;
    const { error } = await supabase.storage.from("media").upload(key, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (!error) {
      const { data } = supabase.storage.from("media").getPublicUrl(key);
      return data.publicUrl;
    }
  }

  const destDir = path.join(LOCAL_DIR, folder);
  await fs.mkdir(destDir, { recursive: true });
  await fs.writeFile(path.join(destDir, filename), bytes);
  return `/uploads/${folder}/${filename}`;
}
