import { routing, type AppLocale } from "@/i18n/routing";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function isLocale(value: string): value is AppLocale {
  return routing.locales.includes(value as AppLocale);
}

export function localized<T extends { en: string; ar: string }>(
  value: T,
  locale: string,
) {
  return locale === "ar" ? value.ar : value.en;
}

export function parseDate(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw
    .replace(" ", "T")
    .replace(/([+-]\d{2})$/, "$1:00");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateInput(value: string | Date | null | undefined) {
  const date = parseDate(value);
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateInput(value: string | null | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return parseDate(value);
  return new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00.000Z`);
}

export function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-QA" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatFileSize(bytes: number, locale: string) {
  if (!bytes) return "";
  const units = locale === "ar" ? ["بايت", "ك.ب", "م.ب", "ج.ب"] : ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

export function siteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export function mapsEmbedSrc(raw: string) {
  if (!raw) return "";
  const value = raw.trim().replace(/&amp;/g, "&");
  const iframeSrc = value.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  let candidate = (iframeSrc || value).trim();
  if (!/^https?:\/\//i.test(candidate) && /google\.|goo\.gl/i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();
    const allowed =
      host === "google.com" ||
      host.endsWith(".google.com") ||
      host === "maps.google.com" ||
      host === "maps.app.goo.gl" ||
      host === "goo.gl";
    if (!allowed) return "";
    if (host.endsWith(".google.com") && parsed.pathname.includes("/maps") && !parsed.pathname.includes("/embed")) {
      parsed.searchParams.set("output", "embed");
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

export const EXPIRY_SOON_DAYS = 30;

export function documentAttachments(doc: {
  files?: Array<{ url: string; fileName: string; fileType: string; fileSize: number }>;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  if (Array.isArray(doc.files) && doc.files.length) {
    return doc.files.filter((item) => item.url);
  }
  if (!doc.fileUrl) return [];
  return [
    {
      url: doc.fileUrl,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
    },
  ];
}

export function withSingleFeatured<T extends { isFeatured?: boolean }>(images: T[]): T[] {
  if (!images.length) return images;
  const featuredIndex = images.findIndex((item) => item.isFeatured);
  const index = featuredIndex >= 0 ? featuredIndex : 0;
  return images.map((item, i) => ({ ...item, isFeatured: i === index }));
}

export function featuredImageUrlFrom(
  images: Array<{ url: string; isFeatured?: boolean }> | undefined,
  fallback = "",
) {
  if (!images?.length) return fallback;
  return images.find((item) => item.isFeatured)?.url || images[0]?.url || fallback;
}

export function normalizeGalleryImages(
  images: Array<{
    url?: string;
    caption?: { en?: string; ar?: string };
    alt?: { en?: string; ar?: string };
    isFeatured?: boolean;
    displayOrder?: number;
  }> | undefined,
  featuredUrl = "",
) {
  const parsed = (images || [])
    .map((item, index) => ({
      url: String(item.url || "").trim(),
      caption: { en: item.caption?.en || "", ar: item.caption?.ar || "" },
      alt: { en: item.alt?.en || "", ar: item.alt?.ar || "" },
      isFeatured: Boolean(item.isFeatured),
      displayOrder: Number(item.displayOrder || index + 1),
    }))
    .filter((item) => item.url);
  if (!parsed.length && featuredUrl) {
    return [
      {
        url: featuredUrl,
        caption: { en: "", ar: "" },
        alt: { en: "", ar: "" },
        isFeatured: true,
        displayOrder: 1,
      },
    ];
  }
  return withSingleFeatured(parsed);
}

export function documentExpiry(hasExpiry: boolean, expiresAt: string | null | undefined) {
  if (!hasExpiry) return null;
  const day = toDateInput(expiresAt);
  if (!day) return null;
  const today = toDateInput(new Date());
  const days = Math.round(
    (Date.parse(`${day}T12:00:00.000Z`) - Date.parse(`${today}T12:00:00.000Z`)) / 86400000,
  );
  if (days < 0) return { status: "expired" as const, days };
  if (days <= EXPIRY_SOON_DAYS) return { status: "soon" as const, days };
  return { status: "ok" as const, days };
}
