"use server";

import { redirect } from "next/navigation";
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
import { fromDateInput, readingTime, slugify } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { MAX_GALLERY_IMAGES } from "@/lib/validations";
import type { ArticleInput, DocumentInput, ProjectInput, SiteSettings } from "@/lib/types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
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
  const images = (JSON.parse(text(formData, "images") || "[]") as ProjectInput["images"]) || [];
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
    "featuredImageUrl",
    "seo_title_en",
    "seo_title_ar",
    "seo_description_en",
    "seo_description_ar",
  ];
  if (required.some((key) => !text(formData, key)) || !images.length || images.length > MAX_GALLERY_IMAGES) {
    throw new Error("All project fields are required, with 1 to 10 gallery images.");
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
    featuredImageUrl: text(formData, "featuredImageUrl"),
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
  const payload: ArticleInput = {
    slug: text(formData, "slug") || slugify(text(formData, "title_en")),
    title: { en: text(formData, "title_en"), ar: text(formData, "title_ar") },
    excerpt: { en: text(formData, "excerpt_en"), ar: text(formData, "excerpt_ar") },
    content,
    categoryId: text(formData, "categoryId"),
    featuredImageUrl: text(formData, "featuredImageUrl"),
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
  const payload: DocumentInput = {
    slug: text(formData, "slug"),
    title: { en: text(formData, "title_en"), ar: text(formData, "title_ar") },
    description: { en: text(formData, "description_en"), ar: text(formData, "description_ar") },
    categoryId: text(formData, "categoryId"),
    fileUrl: text(formData, "fileUrl"),
    fileName: text(formData, "fileName"),
    fileType: text(formData, "fileType") || "application/pdf",
    fileSize: Number(text(formData, "fileSize") || 0),
    thumbnailUrl: text(formData, "thumbnailUrl"),
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
  await updateSettings(settings);
  redirect(noticePath("/admin/settings", "settings-saved"));
}
