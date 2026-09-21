"use client";

import { useState } from "react";
import { upsertArticleAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { FileField } from "@/components/admin/file-field";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { pushAdminToast, reportAdminForm } from "@/components/admin/admin-toast";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { toDateInput } from "@/lib/utils";
import type { Article, Category } from "@/lib/types";

async function uploadImage(file: File) {
  const body = new FormData();
  body.set("file", file);
  body.set("kind", "images");
  const response = await fetch("/api/upload", { method: "POST", body });
  if (!response.ok) throw new Error("Image upload failed.");
  const data = await response.json();
  return String(data.url);
}

export function ArticleForm({
  article,
  categories,
}: {
  article?: Article;
  categories: Category[];
}) {
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [publishedAt, setPublishedAt] = useState(() =>
    toDateInput(article?.publishedAt || article?.createdAt),
  );
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!reportAdminForm(form)) return;

    const data = new FormData(form);
    const dateInput = form.elements.namedItem("publishedAt");
    const publishedValue =
      dateInput instanceof HTMLInputElement ? dateInput.value : publishedAt;
    data.set("publishedAt", publishedValue);
    const existingImage = String(data.get("featuredImageUrl") || "");
    if (!featuredFile && !existingImage) {
      pushAdminToast("Featured image is required.", "error");
      return;
    }

    setSaving(true);
    try {
      if (featuredFile) {
        data.set("featuredImageUrl", await uploadImage(featuredFile));
      }
      await upsertArticleAction(data);
    } catch (err) {
      if (
        typeof err === "object" &&
        err &&
        "digest" in err &&
        String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      pushAdminToast(err instanceof Error ? err.message : "Could not save the article.", "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <TitleSlugFields defaultTitle={article?.title.en} defaultSlug={article?.slug} />
        <Field label="Title (Arabic)" name="title_ar" defaultValue={article?.title.ar} dir="rtl" required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            Category
            <span className="text-gold"> *</span>
          </span>
          <select
            name="categoryId"
            defaultValue={article?.categoryId || ""}
            required
            className="rounded-full border border-border px-4 py-3"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.en}
              </option>
            ))}
          </select>
        </label>
        <Field label="Author (English)" name="author_en" defaultValue={article?.author.en} required />
        <Field label="Author (Arabic)" name="author_ar" defaultValue={article?.author.ar} dir="rtl" required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            Publication date
            <span className="text-gold"> *</span>
          </span>
          <input
            type="date"
            name="publishedAt"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            required
            className="w-full rounded-[1.2rem] border border-border bg-background px-4 py-3 text-sm"
          />
        </label>
      </div>
      <Field label="Excerpt (English)" name="excerpt_en" defaultValue={article?.excerpt.en} textarea required />
      <Field label="Excerpt (Arabic)" name="excerpt_ar" defaultValue={article?.excerpt.ar} textarea dir="rtl" required />
      <Field label="Content (English)" name="content_en" defaultValue={article?.content.en} textarea required />
      <Field label="Content (Arabic)" name="content_ar" defaultValue={article?.content.ar} textarea dir="rtl" required />
      <FileField
        name="featuredImageUrl"
        label="Featured image"
        kind="images"
        defaultUrl={article?.featuredImageUrl}
        deferUpload
        required
        onPendingFile={setFeaturedFile}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title (English)" name="seo_title_en" defaultValue={article?.seoTitle.en} required />
        <Field label="SEO title (Arabic)" name="seo_title_ar" defaultValue={article?.seoTitle.ar} dir="rtl" required />
        <Field label="SEO description (English)" name="seo_description_en" defaultValue={article?.seoDescription.en} textarea required />
        <Field label="SEO description (Arabic)" name="seo_description_ar" defaultValue={article?.seoDescription.ar} textarea dir="rtl" required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={article?.isPublished} /> Published
      </label>
      <button type="submit" disabled={saving} className={buttonClass("dark", goldHoverClass)}>
        {saving ? (featuredFile ? "Saving and uploading…" : "Saving…") : "Save article"}
      </button>
    </form>
  );
}
