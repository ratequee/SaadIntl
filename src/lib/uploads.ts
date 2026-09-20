import { promises as fs } from "fs";
import path from "path";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "-").slice(0, 80);
}

export async function deleteUpload(url: string) {
  if (!url) return;

  const publicMarker = "/storage/v1/object/public/media/";
  const publicIndex = url.indexOf(publicMarker);
  if (publicIndex !== -1) {
    const key = decodeURIComponent(url.slice(publicIndex + publicMarker.length).split("?")[0]);
    const supabase = getSupabaseServer();
    if (supabase && key) {
      await supabase.storage.from("media").remove([key]);
    }
    return;
  }

  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url);
    await fs.unlink(filePath).catch(() => undefined);
  }
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
