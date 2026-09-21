"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { upsertProjectAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { GalleryField, type GalleryItem } from "@/components/admin/gallery-field";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { pushAdminToast, reportAdminForm } from "@/components/admin/admin-toast";
import { localized } from "@/lib/utils";
import type { Category, Project } from "@/lib/types";

async function uploadImage(file: File) {
  const body = new FormData();
  body.set("file", file);
  body.set("kind", "images");
  const response = await fetch("/api/upload", { method: "POST", body });
  if (!response.ok) throw new Error("Image upload failed.");
  const data = await response.json();
  return String(data.url);
}

export function ProjectForm({
  project,
  categories,
}: {
  project?: Project;
  categories: Category[];
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [gallery, setGallery] = useState<GalleryItem[]>(
    (project?.images?.length
      ? project.images
      : project?.featuredImageUrl
        ? [
            {
              url: project.featuredImageUrl,
              caption: { en: "", ar: "" },
              alt: { en: "", ar: "" },
              isFeatured: true,
              displayOrder: 1,
            },
          ]
        : []
    ).map((image) => ({
      preview: image.url,
      url: image.url,
      caption: image.caption,
      alt: image.alt,
      isFeatured: image.isFeatured,
      displayOrder: image.displayOrder,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    if (!gallery.length) {
      pushAdminToast(t("addAtLeastOneImage"), "error");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const images = [];
      for (const item of gallery) {
        const url = item.file ? await uploadImage(item.file) : item.url;
        if (!url) throw new Error(t("galleryImageMissing"));
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
      await upsertProjectAction(data);
    } catch (err) {
      if (
        typeof err === "object" &&
        err &&
        "digest" in err &&
        String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      const message = err instanceof Error ? err.message : t("couldNotSaveProject");
      setError(message);
      pushAdminToast(message, "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <TitleSlugFields defaultTitle={project?.title.en} defaultSlug={project?.slug} />
        <Field label={t("titleAr")} name="title_ar" defaultValue={project?.title.ar} dir="rtl" required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            {t("category")}
            <span className="text-gold"> *</span>
          </span>
          <select
            name="categoryId"
            defaultValue={project?.categoryId}
            required
            className="rounded-full border border-border px-4 py-3"
          >
            <option value="">{t("selectCategory")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {localized(category.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <Field label={t("locationEn")} name="location_en" defaultValue={project?.location.en} dir="ltr" required />
        <Field label={t("locationAr")} name="location_ar" defaultValue={project?.location.ar} dir="rtl" required />
        <Field label={t("client")} name="client" defaultValue={project?.client} required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            {t("status")}
            <span className="text-gold"> *</span>
          </span>
          <select
            name="status"
            defaultValue={project?.status || "planning"}
            required
            className="rounded-full border border-border px-4 py-3"
          >
            <option value="planning">{t("planning")}</option>
            <option value="in_progress">{t("inProgress")}</option>
            <option value="completed">{t("completed")}</option>
          </select>
        </label>
        <Field label={t("startDate")} name="startDate" type="date" defaultValue={project?.startDate || ""} required />
        <Field label={t("completionDate")} name="completionDate" type="date" defaultValue={project?.completionDate || ""} required />
        <Field label={t("progress")} name="progress" type="number" defaultValue={project?.progress ?? ""} required min={0} max={100} />
        <Field label={t("displayOrder")} name="displayOrder" type="number" defaultValue={project?.displayOrder ?? 99} required />
        <Field label={t("services")} name="services" defaultValue={project?.services.join(", ")} required />
        <Field label={t("contractValue")} name="contractValue" defaultValue={project?.contractValue} required />
      </div>
      <Field label={t("excerptEn")} name="excerpt_en" defaultValue={project?.excerpt.en} textarea dir="ltr" required />
      <Field label={t("excerptAr")} name="excerpt_ar" defaultValue={project?.excerpt.ar} textarea dir="rtl" required />
      <Field label={t("bodyEn")} name="description_en" defaultValue={project?.description.en} textarea dir="ltr" required />
      <Field label={t("bodyAr")} name="description_ar" defaultValue={project?.description.ar} textarea dir="rtl" required />
      <GalleryField
        required
        deferUpload
        onChange={setGallery}
        defaultImages={(project?.images?.length
          ? project.images
          : project?.featuredImageUrl
            ? [
                {
                  url: project.featuredImageUrl,
                  caption: { en: "", ar: "" },
                  alt: { en: "", ar: "" },
                  isFeatured: true,
                  displayOrder: 1,
                },
              ]
            : []
        ).map((image) => ({
          url: image.url,
          caption: image.caption,
          alt: image.alt,
          isFeatured: image.isFeatured,
          displayOrder: image.displayOrder,
        }))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("seoEn")} name="seo_title_en" defaultValue={project?.seoTitle.en} dir="ltr" required />
        <Field label={t("seoAr")} name="seo_title_ar" defaultValue={project?.seoTitle.ar} dir="rtl" required />
        <Field label={t("seoDescEn")} name="seo_description_en" defaultValue={project?.seoDescription.en} textarea dir="ltr" required />
        <Field label={t("seoDescAr")} name="seo_description_ar" defaultValue={project?.seoDescription.ar} textarea dir="rtl" required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={project?.isPublished} /> {t("published")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={project?.isFeatured} /> {t("featured")}
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={saving} className={buttonClass("dark", goldHoverClass)}>
        {saving ? (gallery.some((item) => item.file) ? t("savingUploading") : t("saving")) : t("saveProject")}
      </button>
    </form>
  );
}
