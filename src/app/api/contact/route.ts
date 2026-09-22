import { NextResponse } from "next/server";
import { addContactMessage } from "@/lib/cms";
import { sendContactEmail } from "@/lib/email/send-contact";
import { contactSchema } from "@/lib/validations";

const windowMs = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < windowMs);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "rateLimit" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const payload = {
    ...parsed.data,
    locale: typeof body?.locale === "string" ? body.locale : "en",
  };

  try {
    await sendContactEmail(payload);
  } catch (error) {
    console.error("Contact email failed", error);
    return NextResponse.json({ error: "email" }, { status: 502 });
  }

  try {
    await addContactMessage(payload);
  } catch (error) {
    console.error("Contact message store failed", error);
  }

  return NextResponse.json({ ok: true });
}
