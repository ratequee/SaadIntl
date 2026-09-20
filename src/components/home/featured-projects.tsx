"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/button";
import { IconArrowUpRight } from "@/components/ui/icons";
import { localized } from "@/lib/utils";
import type { Category, Project } from "@/lib/types";

function categoryName(categories: Category[], id: string, locale: string) {
  const match = categories.find((item) => item.id === id);
  return match ? localized(match.name, locale) : "";
}

export function FeaturedProjects({
  title,
  projects,
  categories,
  locale,
}: {
  title: string;
  projects: Project[];
  categories: Category[];
  locale: string;
}) {
  const t = useTranslations("projects");
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const rtl = document.documentElement.dir === "rtl" ? -1 : 1;
    const amount = Math.min(track.clientWidth * 0.8, 420);
    track.scrollBy({ left: direction * rtl * amount, behavior: "smooth" });
  }

  return (
    <section className="container-site py-20 md:py-28">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap items-end gap-4">
          <h2 className="display max-w-xl text-4xl md:text-6xl">{title}</h2>
          <div className="mb-1 flex gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="grid size-11 place-items-center rounded-full border border-border bg-background text-ink hover:bg-cream dark:text-cream dark:hover:bg-cream dark:hover:text-ink"
              aria-label={locale === "ar" ? "السابق" : "Previous"}
            >
              <svg viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" aria-hidden>
                <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="grid size-11 place-items-center rounded-full border border-border bg-background text-ink hover:bg-cream dark:text-cream dark:hover:bg-cream dark:hover:text-ink"
              aria-label={locale === "ar" ? "التالي" : "Next"}
            >
              <svg viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/projects" className={buttonClass("dark")}>{t("all")}</Link>
          <Link href="/projects?category=villas" className={buttonClass("ghost", "border border-border")}>
            {locale === "ar" ? "فلل" : "Villas"}
          </Link>
          <Link href="/projects?category=commercial" className={buttonClass("ghost", "border border-border")}>
            {locale === "ar" ? "تجاري" : "Commercial"}
          </Link>
          <Link href="/projects?category=interiors" className={buttonClass("ghost", "border border-border")}>
            {locale === "ar" ? "تصميم داخلي" : "Interiors"}
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="w-[min(78vw,360px)] shrink-0 snap-start"
          >
            <article>
              <div className="relative overflow-hidden rounded-[1.8rem]">
                <Image
                  src={project.featuredImageUrl}
                  alt={localized(project.title, locale)}
                  width={720}
                  height={520}
                  className="h-64 w-full object-cover"
                />
                <span className="absolute end-4 top-4 grid size-10 place-items-center rounded-full bg-white text-ink">
                  <IconArrowUpRight className="size-4 rtl:-scale-x-100" />
                </span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {localized(project.title, locale)}
                  </h3>
                  <p className="text-sm text-muted">
                    {categoryName(categories, project.categoryId, locale)}
                  </p>
                </div>
                <p className="text-sm text-muted">{localized(project.location, locale)}</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
