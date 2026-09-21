"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { IMAGE_ACCEPT, isAllowedImage, MAX_GALLERY_IMAGES, MAX_IMAGE_SIZE } from "@/lib/validations";

export type GalleryItem = {
  preview: string;
  url: string;
  file?: File;
  caption: { en: string; ar: string };
  alt: { en: string; ar: string };
  isFeatured: boolean;
  displayOrder: number;
};

export function GalleryField({
  defaultImages = [],
  required,
  deferUpload,
  onChange,
}: {
  defaultImages?: Omit<GalleryItem, "preview" | "file">[];
  required?: boolean;
  deferUpload?: boolean;
  onChange?: (images: GalleryItem[]) => void;
}) {
  const t = useTranslations("admin");
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryItem[]>(
    defaultImages.map((image) => ({ ...image, preview: image.url })),
  );
  const [error, setError] = useState("");

  function commit(next: GalleryItem[]) {
    const featuredIndex = next.findIndex((item) => item.isFeatured);
    const normalized = next.map((item, index) => ({
      ...item,
      isFeatured: (featuredIndex >= 0 ? featuredIndex : 0) === index,
      displayOrder: index + 1,
    }));
    setImages(normalized);
    onChange?.(normalized);
  }

  function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setError("");
    const remaining = MAX_GALLERY_IMAGES - images.length;
    if (remaining <= 0) {
      setError(t("galleryLimit", { max: MAX_GALLERY_IMAGES }));
      return;
    }

    const selected = files.slice(0, remaining);
    if (files.length > remaining) {
      setError(t("gallerySkipped", { max: MAX_GALLERY_IMAGES }));
    }

    const accepted: GalleryItem[] = [];
    for (const file of selected) {
      if (!file.type.startsWith("image/") || !isAllowedImage(file)) {
        setError(file.size > MAX_IMAGE_SIZE ? t("imageTooLarge") : t("galleryTypes"));
        continue;
      }
      accepted.push({
        preview: URL.createObjectURL(file),
        url: "",
        file: deferUpload ? file : undefined,
        caption: { en: "", ar: "" },
        alt: { en: file.name, ar: file.name },
        isFeatured: images.length + accepted.length === 0,
        displayOrder: images.length + accepted.length + 1,
      });
    }
    if (!accepted.length) return;

    if (!deferUpload) {
      void uploadNow(accepted);
      return;
    }
    commit([...images, ...accepted]);
  }

  async function uploadNow(pending: GalleryItem[]) {
    const uploaded: GalleryItem[] = [];
    for (const item of pending) {
      if (!item.file) continue;
      const body = new FormData();
      body.set("file", item.file);
      body.set("kind", "images");
      const response = await fetch("/api/upload", { method: "POST", body });
      if (!response.ok) {
        setError(t("uploadFailed"));
        continue;
      }
      const data = await response.json();
      uploaded.push({ ...item, url: data.url, preview: data.url, file: undefined });
    }
    commit([...images, ...uploaded]);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    commit(next.map((item, order) => ({ ...item, displayOrder: order + 1 })));
  }

  const serialized = images.map(({ url, caption, alt, isFeatured, displayOrder }) => ({
    url,
    caption,
    alt,
    isFeatured,
    displayOrder,
  }));

  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium">
        {t("images")}
        {required ? <span className="text-gold"> *</span> : null}
      </p>
      <p className="text-xs text-muted">{t("imagesHelp")}</p>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        onChange={addFiles}
        className="sr-only"
      />
      <input type="hidden" name="images" value={JSON.stringify(serialized)} />
      {required ? (
        <input
          tabIndex={-1}
          className="sr-only"
          value={images.length ? "ok" : ""}
          required
          onChange={() => undefined}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={images.length >= MAX_GALLERY_IMAGES}
          onClick={() => inputRef.current?.click()}
          className={buttonClass("dark", goldHoverClass)}
        >
          {t("addImages")}
        </button>
        <p className="text-xs text-muted">
          {t("imageCount", { count: images.length, max: MAX_GALLERY_IMAGES })}
          {deferUpload ? ` · ${t("uploadsOnSave")}` : ""}
        </p>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <ul className="grid gap-3">
        {images.map((image, index) => (
          <li key={`${image.preview}-${index}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.preview} alt="" className="h-16 w-20 rounded-lg object-cover" />
            <input
              className="min-w-40 flex-1 rounded-full border border-border px-3 py-2 text-sm"
              placeholder={t("captionEn")}
              value={image.caption.en}
              dir="ltr"
              onChange={(event) =>
                commit(
                  images.map((item, i) =>
                    i === index ? { ...item, caption: { ...item.caption, en: event.target.value } } : item,
                  ),
                )
              }
            />
            <input
              className="min-w-40 flex-1 rounded-full border border-border px-3 py-2 text-sm"
              placeholder={t("captionAr")}
              value={image.caption.ar}
              dir="rtl"
              onChange={(event) =>
                commit(
                  images.map((item, i) =>
                    i === index ? { ...item, caption: { ...item.caption, ar: event.target.value } } : item,
                  ),
                )
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="featured-image"
                checked={image.isFeatured}
                onChange={() =>
                  commit(images.map((item, i) => ({ ...item, isFeatured: i === index })))
                }
              />
              {t("featured")}
            </label>
            <button type="button" className="text-sm" onClick={() => move(index, -1)}>
              {t("up")}
            </button>
            <button type="button" className="text-sm" onClick={() => move(index, 1)}>
              {t("down")}
            </button>
            <button
              type="button"
              className="text-sm text-red-700"
              onClick={() => commit(images.filter((_, i) => i !== index))}
            >
              {t("delete")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
