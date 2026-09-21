"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { upsertArticleAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { GalleryField, type GalleryItem } from "@/components/admin/gallery-field";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { pushAdminToast, reportAdminForm } from "@/components/admin/admin-toast";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { localized, toDateInput } from "@/lib/utils";
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

function articleGallerySource(article?: Article) {
  if (article?.images?.length) return article.images;
  if (article?.featuredImageUrl) {
    return [
      {
        url: article.featuredImageUrl,
        caption: { en: "", ar: "" },
        alt: { en: "", ar: "" },
        isFeatured: true,
        displayOrder: 1,
      },
    ];
  }
  return [];
}

export function ArticleForm({
  article,
  categories,
}: {
  article?: Article;
  categories: Category[];
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    articleGallerySource(article).map((image) => ({
      ...image,
      preview: image.url,
    })),
  );
  const [publishedAt, setPublishedAt] = useState(() =>
    toDateInput(article?.publishedAt || article?.createdAt),
  );
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (
      !reportAdminForm(form, {
        fieldRequired: (name) => t("fieldRequired", { name }),
        requiredFields: t("requiredFields"),
      })
    ) {
      return;
    }

    const data = new FormData(form);
    const dateInput = form.elements.namedItem("publishedAt");
    const publishedValue =
      dateInput instanceof HTMLInputElement ? dateInput.value : publishedAt;
    data.set("publishedAt", publishedValue);
    if (!gallery.length) {
      pushAdminToast(t("addAtLeastOneImage"), "error");
      return;
    }

    setSaving(true);
    try {
      const images = [];
      for (const item of gallery) {
        const url = item.file ? await uploadImage(item.file) : item.url;
        if (!url) throw new Error(t("imageMissing"));
        images.push({
          url,
          caption: item.caption,
          alt: item.alt,
          isFeatured: item.isFeatured,
          displayOrder: item.displayOrder,
        });
      }
      if (!images.some((item) => item.isFeatured)) images[0].isFeatured = true;
      data.set("images", JSON.stringify(images));
      data.set("featuredImageUrl", images.find((item) => item.isFeatured)?.url || images[0].url);
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
      pushAdminToast(err instanceof Error ? err.message : t("couldNotSaveArticle"), "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <TitleSlugFields defaultTitle={article?.title.en} defaultSlug={article?.slug} />
        <Field label={t("titleAr")} name="title_ar" defaultValue={article?.title.ar} dir="rtl" required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            {t("category")}
            <span className="text-gold"> *</span>
          </span>
          <select
            name="categoryId"
            defaultValue={article?.categoryId || ""}
            required
            className="rounded-full border border-border px-4 py-3"
          >
            <option value="" disabled>
              {t("selectCategory")}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {localized(category.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <Field label={t("authorEn")} name="author_en" defaultValue={article?.author.en} dir="ltr" required />
        <Field label={t("authorAr")} name="author_ar" defaultValue={article?.author.ar} dir="rtl" required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            {t("publicationDate")}
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
      <Field label={t("excerptEn")} name="excerpt_en" defaultValue={article?.excerpt.en} textarea dir="ltr" required />
      <Field label={t("excerptAr")} name="excerpt_ar" defaultValue={article?.excerpt.ar} textarea dir="rtl" required />
      <Field label={t("bodyEn")} name="content_en" defaultValue={article?.content.en} textarea dir="ltr" required />
      <Field label={t("bodyAr")} name="content_ar" defaultValue={article?.content.ar} textarea dir="rtl" required />
      <GalleryField
        required
        deferUpload
        onChange={setGallery}
        defaultImages={articleGallerySource(article)}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("seoEn")} name="seo_title_en" defaultValue={article?.seoTitle.en} dir="ltr" required />
        <Field label={t("seoAr")} name="seo_title_ar" defaultValue={article?.seoTitle.ar} dir="rtl" required />
        <Field label={t("seoDescEn")} name="seo_description_en" defaultValue={article?.seoDescription.en} textarea dir="ltr" required />
        <Field label={t("seoDescAr")} name="seo_description_ar" defaultValue={article?.seoDescription.ar} textarea dir="rtl" required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={article?.isPublished} /> {t("published")}
      </label>
      <button type="submit" disabled={saving} className={buttonClass("dark", goldHoverClass)}>
        {saving ? (gallery.some((item) => item.file) ? t("savingUploading") : t("saving")) : t("saveArticle")}
      </button>
    </form>
  );
}
