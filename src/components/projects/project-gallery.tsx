"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { MediaImage } from "@/components/ui/media-image";
import { localized } from "@/lib/utils";
import type { GalleryImage } from "@/lib/types";

function imageKey(image: GalleryImage) {
  return `${image.url}-${image.displayOrder}`;
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProjectGallery({
  images,
  locale,
}: {
  images: GalleryImage[];
  locale: string;
}) {
  const t = useTranslations("projects");
  const ordered = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const featured = ordered.find((item) => item.isFeatured) || ordered[0];
  const [active, setActive] = useState(featured);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, ordered]);

  if (!active) return null;

  function openLightbox(image: GalleryImage) {
    const index = ordered.findIndex((item) => imageKey(item) === imageKey(image));
    setActive(image);
    setLightboxIndex(index === -1 ? 0 : index);
  }

  function step(delta: number) {
    if (!ordered.length) return;
    setLightboxIndex((current) => {
      const from = current ?? 0;
      const next = (from + delta + ordered.length) % ordered.length;
      setActive(ordered[next]);
      return next;
    });
  }

  const lightboxImage = lightboxIndex !== null ? ordered[lightboxIndex] : null;
  const expandButtonClass =
    "grid place-items-center rounded-full bg-white/92 text-ink shadow-sm transition hover:bg-gold hover:text-espresso";

  const lightbox =
    lightboxImage && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/92 p-3 sm:p-6">
            <button
              type="button"
              className="absolute inset-0 cursor-zoom-out"
              aria-label={t("closeFullscreen")}
              onClick={() => setLightboxIndex(null)}
            />
            <div className="relative z-10 flex max-h-full w-full max-w-6xl flex-col items-center">
              <div className="relative h-[min(82dvh,52rem)] w-full">
                <MediaImage
                  src={lightboxImage.url}
                  alt={localized(lightboxImage.alt, locale) || localized(lightboxImage.caption, locale)}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
              {localized(lightboxImage.caption, locale) ? (
                <p className="mt-3 max-w-3xl text-center text-sm text-cream/80">
                  {localized(lightboxImage.caption, locale)}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className={`${expandButtonClass} absolute end-4 top-4 z-20 size-11`}
              aria-label={t("closeFullscreen")}
              onClick={() => setLightboxIndex(null)}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            {ordered.length > 1 ? (
              <>
                <button
                  type="button"
                  className={`${expandButtonClass} absolute start-4 top-1/2 z-20 size-11 -translate-y-1/2`}
                  aria-label={t("previous")}
                  onClick={() => step(-1)}
                >
                  <svg viewBox="0 0 24 24" className="size-5 rtl:rotate-180" fill="none" aria-hidden>
                    <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${expandButtonClass} absolute end-4 top-1/2 z-20 size-11 -translate-y-1/2`}
                  aria-label={t("next")}
                  onClick={() => step(1)}
                >
                  <svg viewBox="0 0 24 24" className="size-5 rtl:rotate-180" fill="none" aria-hidden>
                    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <div>
      <div className="relative overflow-hidden rounded-[2rem]">
        <MediaImage
          src={active.url}
          alt={localized(active.alt, locale) || localized(active.caption, locale)}
          width={1400}
          height={800}
          sizes="(min-width: 1441px) 80vw, 100vw"
          className="h-[52vw] max-h-[620px] min-h-[280px] w-full object-cover"
          priority
        />
        <button
          type="button"
          className={`${expandButtonClass} absolute end-4 top-4 z-10 size-11`}
          aria-label={t("fullscreen")}
          onClick={() => openLightbox(active)}
        >
          <ExpandIcon className="size-5" />
        </button>
      </div>
      {localized(active.caption, locale) ? (
        <p className="mt-3 text-sm text-muted">{localized(active.caption, locale)}</p>
      ) : null}
      {ordered.length > 1 ? (
        <div className="mt-4 overflow-x-auto overflow-y-hidden">
          <div className="flex w-max flex-nowrap items-center gap-3 py-1">
            {ordered.map((image) => (
              <div key={imageKey(image)} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActive(image)}
                  className={`relative h-full w-full overflow-hidden rounded-2xl ${
                    imageKey(image) === imageKey(active) ? "ring-2 ring-gold ring-inset" : ""
                  }`}
                >
                  <MediaImage src={image.url} alt="" fill className="object-cover" sizes="112px" />
                </button>
                <button
                  type="button"
                  className={`${expandButtonClass} absolute end-1 top-1 z-10 size-7`}
                  aria-label={t("fullscreen")}
                  onClick={() => openLightbox(image)}
                >
                  <ExpandIcon className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {lightbox}
    </div>
  );
}
