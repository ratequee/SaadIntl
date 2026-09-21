"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { noticePath } from "@/lib/admin-notice";
import { getAdminSession } from "@/lib/auth/session";
import {
  deleteArticle,
  deleteDocument,
  deleteProject,
  saveArticle,
  saveDocument,
  saveProject,
  updateSettings,
} from "@/lib/cms";
import { fromDateInput, featuredImageUrlFrom, normalizeGalleryImages, readingTime, slugify } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { MAX_GALLERY_IMAGES } from "@/lib/validations";
import type { ArticleInput, DocumentInput, ProjectInput, SiteSettings } from "@/lib/types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
}

async function fail(key: "allProjectFields" | "addAtLeastOneImage" | "filesRequired" | "expiryRequired" | "requiredFields") {
  const t = await getTranslations("admin");
  throw new Error(t(key));
}

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function bool(form: FormData, key: string) {
  return form.get(key) === "on" || form.get(key) === "true";
}

export async function upsertProjectAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id") || undefined;
  const images = normalizeGalleryImages(
    JSON.parse(text(formData, "images") || "[]") as ProjectInput["images"],
  );
  const featuredImageUrl = featuredImageUrlFrom(images);
  const required = [
    "title_en",
    "title_ar",
    "categoryId",
    "location_en",
    "location_ar",
    "client",
    "status",
    "startDate",
    "completionDate",
    "progress",
    "displayOrder",
    "services",
    "contractValue",
    "excerpt_en",
    "excerpt_ar",
    "description_en",
    "description_ar",
    "seo_title_en",
    "seo_title_ar",
    "seo_description_en",
    "seo_description_ar",
  ];
  if (required.some((key) => !text(formData, key)) || !featuredImageUrl || !images.length || images.length > MAX_GALLERY_IMAGES) {
    await fail("allProjectFields");
  }
  const payload: ProjectInput = {
    slug: text(formData, "slug") || slugify(text(formData, "title_en")),
    title: { en: text(formData, "title_en"), ar: text(formData, "title_ar") },
    excerpt: { en: text(formData, "excerpt_en"), ar: text(formData, "excerpt_ar") },
    description: {
      en: sanitizeHtml(text(formData, "description_en")),
      ar: sanitizeHtml(text(formData, "description_ar")),
    },
    categoryId: text(formData, "categoryId"),
    location: { en: text(formData, "location_en"), ar: text(formData, "location_ar") },
    client: text(formData, "client"),
    status: (text(formData, "status") || "planning") as ProjectInput["status"],
    startDate: text(formData, "startDate") || null,
    completionDate: text(formData, "completionDate") || null,
    contractValue: text(formData, "contractValue"),
    services: text(formData, "services")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    featuredImageUrl,
    progress: text(formData, "progress") ? Number(text(formData, "progress")) : null,
    isPublished: bool(formData, "isPublished"),
    isFeatured: bool(formData, "isFeatured"),
    displayOrder: Number(text(formData, "displayOrder") || 99),
    seoTitle: { en: text(formData, "seo_title_en"), ar: text(formData, "seo_title_ar") },
    seoDescription: { en: text(formData, "seo_description_en"), ar: text(formData, "seo_description_ar") },
    publishedAt: bool(formData, "isPublished") ? new Date().toISOString() : null,
    images,
  };
  await saveProject(payload, id);
  redirect(noticePath("/admin/projects", id ? "project-updated" : "project-saved"));
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  await deleteProject(text(formData, "id"));
  redirect(noticePath("/admin/projects", "project-deleted"));
}

export async function upsertArticleAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id") || undefined;
  const content = {
    en: sanitizeHtml(text(formData, "content_en")),
    ar: sanitizeHtml(text(formData, "content_ar")),
  };
  const images = normalizeGalleryImages(JSON.parse(text(formData, "images") || "[]"));
  const featuredImageUrl = featuredImageUrlFrom(images);
  if (!featuredImageUrl) await fail("addAtLeastOneImage");
  const payload: ArticleInput = {
    slug: text(formData, "slug") || slugify(text(formData, "title_en")),
    title: { en: text(formData, "title_en"), ar: text(formData, "title_ar") },
    excerpt: { en: text(formData, "excerpt_en"), ar: text(formData, "excerpt_ar") },
    content,
    categoryId: text(formData, "categoryId"),
    featuredImageUrl,
    images,
    author: { en: text(formData, "author_en"), ar: text(formData, "author_ar") },
    readingTimeMinutes: readingTime(`${content.en} ${content.ar}`),
    isPublished: bool(formData, "isPublished"),
    publishedAt: (() => {
      const date = fromDateInput(text(formData, "publishedAt"));
      if (date) return date.toISOString();
      return bool(formData, "isPublished") ? new Date().toISOString() : null;
    })(),
    seoTitle: { en: text(formData, "seo_title_en"), ar: text(formData, "seo_title_ar") },
    seoDescription: { en: text(formData, "seo_description_en"), ar: text(formData, "seo_description_ar") },
  };
  await saveArticle(payload, id);
  redirect(noticePath("/admin/articles", id ? "article-updated" : "article-saved"));
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  await deleteArticle(text(formData, "id"));
  redirect(noticePath("/admin/articles", "article-deleted"));
}

export async function upsertDocumentAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id") || undefined;
  const files = JSON.parse(text(formData, "files") || "[]") as DocumentInput["files"];
  const hasExpiry = bool(formData, "hasExpiry");
  const expires = fromDateInput(text(formData, "expiresAt"));
  if (!files.length) await fail("filesRequired");
  if (hasExpiry && !expires) await fail("expiryRequired");
  const first = files[0];
  const payload: DocumentInput = {
    slug: text(formData, "slug") || slugify(text(formData, "title_en")),
    title: { en: text(formData, "title_en"), ar: text(formData, "title_ar") },
    description: { en: text(formData, "description_en"), ar: text(formData, "description_ar") },
    categoryId: text(formData, "categoryId"),
    fileUrl: first.url,
    fileName: first.fileName,
    fileType: first.fileType,
    fileSize: Number(first.fileSize || 0),
    thumbnailUrl: text(formData, "thumbnailUrl"),
    files,
    hasExpiry,
    expiresAt: hasExpiry && expires ? expires.toISOString() : null,
    isPublished: bool(formData, "isPublished"),
    displayOrder: Number(text(formData, "displayOrder") || 99),
    publishedAt: bool(formData, "isPublished") ? new Date().toISOString() : null,
  };
  await saveDocument(payload, id);
  redirect(noticePath("/admin/documents", id ? "document-updated" : "document-saved"));
}

export async function deleteDocumentAction(formData: FormData) {
  await requireAdmin();
  await deleteDocument(text(formData, "id"));
  redirect(noticePath("/admin/documents", "document-deleted"));
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const settings: SiteSettings = {
    companyName: { en: text(formData, "company_en"), ar: text(formData, "company_ar") },
    tagline: { en: text(formData, "tagline_en"), ar: text(formData, "tagline_ar") },
    about: { en: text(formData, "about_en"), ar: text(formData, "about_ar") },
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    hours: { en: text(formData, "hours_en"), ar: text(formData, "hours_ar") },
    address: { en: text(formData, "address_en"), ar: text(formData, "address_ar") },
    mapEmbedUrl: text(formData, "mapEmbedUrl"),
  };
  if (
    !settings.companyName.en ||
    !settings.companyName.ar ||
    !settings.email ||
    !settings.phone
  ) {
    await fail("requiredFields");
  }
  await updateSettings(settings);
}
