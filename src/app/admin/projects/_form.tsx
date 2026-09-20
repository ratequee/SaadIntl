"use client";

import { useState } from "react";
import { upsertProjectAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { FileField } from "@/components/admin/file-field";
import { GalleryField, type GalleryItem } from "@/components/admin/gallery-field";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
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
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>(
    (project?.images || []).map((image) => ({
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
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!featuredFile && !project?.featuredImageUrl) {
      setError("Add a featured image.");
      return;
    }
    if (!gallery.length) {
      setError("Add at least one gallery image.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const featuredImageUrl = featuredFile
        ? await uploadImage(featuredFile)
        : project?.featuredImageUrl || "";
      const images = [];
      for (const item of gallery) {
        const url = item.file ? await uploadImage(item.file) : item.url;
        if (!url) throw new Error("A gallery image is missing.");
        images.push({
          url,
          caption: item.caption,
          alt: item.alt,
          isFeatured: item.isFeatured,
          displayOrder: item.displayOrder,
        });
      }

      const data = new FormData(form);
      data.set("featuredImageUrl", featuredImageUrl);
      data.set("images", JSON.stringify(images));
      await upsertProjectAction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the project.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <TitleSlugFields defaultTitle={project?.title.en} defaultSlug={project?.slug} />
        <Field label="Title (Arabic)" name="title_ar" defaultValue={project?.title.ar} dir="rtl" required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            Category
            <span className="text-gold"> *</span>
          </span>
          <select
            name="categoryId"
            defaultValue={project?.categoryId}
            required
            className="rounded-full border border-border px-4 py-3"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.en}
              </option>
            ))}
          </select>
        </label>
        <Field label="Location (English)" name="location_en" defaultValue={project?.location.en} required />
        <Field label="Location (Arabic)" name="location_ar" defaultValue={project?.location.ar} dir="rtl" required />
        <Field label="Client" name="client" defaultValue={project?.client} required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            Status
            <span className="text-gold"> *</span>
          </span>
          <select
            name="status"
            defaultValue={project?.status || "planning"}
            required
            className="rounded-full border border-border px-4 py-3"
          >
            <option value="planning">Planning</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <Field label="Start date" name="startDate" type="date" defaultValue={project?.startDate || ""} required />
        <Field label="Completion date" name="completionDate" type="date" defaultValue={project?.completionDate || ""} required />
        <Field label="Progress (%)" name="progress" type="number" defaultValue={project?.progress ?? ""} required min={0} max={100} />
        <Field label="Display order" name="displayOrder" type="number" defaultValue={project?.displayOrder ?? 99} required />
        <Field label="Services (comma separated)" name="services" defaultValue={project?.services.join(", ")} required />
        <Field label="Contract value (QAR)" name="contractValue" defaultValue={project?.contractValue} required />
      </div>
      <Field label="Short description (English)" name="excerpt_en" defaultValue={project?.excerpt.en} textarea required />
      <Field label="Short description (Arabic)" name="excerpt_ar" defaultValue={project?.excerpt.ar} textarea dir="rtl" required />
      <Field label="Description (English)" name="description_en" defaultValue={project?.description.en} textarea required />
      <Field label="Description (Arabic)" name="description_ar" defaultValue={project?.description.ar} textarea dir="rtl" required />
      <FileField
        name="featuredImageUrl"
        label="Featured image"
        kind="images"
        defaultUrl={project?.featuredImageUrl}
        required
        deferUpload
        onPendingFile={setFeaturedFile}
      />
      <GalleryField
        required
        deferUpload
        onChange={setGallery}
        defaultImages={project?.images.map((image) => ({
          url: image.url,
          caption: image.caption,
          alt: image.alt,
          isFeatured: image.isFeatured,
          displayOrder: image.displayOrder,
        }))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title (English)" name="seo_title_en" defaultValue={project?.seoTitle.en} required />
        <Field label="SEO title (Arabic)" name="seo_title_ar" defaultValue={project?.seoTitle.ar} dir="rtl" required />
        <Field label="SEO description (English)" name="seo_description_en" defaultValue={project?.seoDescription.en} textarea required />
        <Field label="SEO description (Arabic)" name="seo_description_ar" defaultValue={project?.seoDescription.ar} textarea dir="rtl" required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={project?.isPublished} /> Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={project?.isFeatured} /> Featured
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={saving} className={buttonClass("dark", goldHoverClass)}>
        {saving ? "Saving and uploading…" : "Save project"}
      </button>
    </form>
  );
}
