import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { saveUpload } from "@/lib/uploads";
import { isAllowedImage } from "@/lib/validations";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "images");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  if (kind === "documents") {
    const url = await saveUpload(file, "documents");
    return NextResponse.json({
      url,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  if (!isAllowedImage(file)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const url = await saveUpload(file, "images");
  return NextResponse.json({ url, name: file.name, type: file.type, size: file.size });
}
