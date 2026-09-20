"use client";

import Image from "next/image";
import { useState } from "react";
import { localized } from "@/lib/utils";
import type { ProjectImage } from "@/lib/types";

export function ProjectGallery({
  images,
  locale,
}: {
  images: ProjectImage[];
  locale: string;
}) {
  const ordered = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const [active, setActive] = useState(ordered[0]);
  if (!active) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-[2rem]">
        <Image
          src={active.url}
          alt={localized(active.alt, locale) || localized(active.caption, locale)}
          width={1400}
          height={800}
          className="h-[52vw] max-h-[620px] min-h-[280px] w-full object-cover"
          priority
        />
      </div>
      {localized(active.caption, locale) ? (
        <p className="mt-3 text-sm text-muted">{localized(active.caption, locale)}</p>
      ) : null}
      {ordered.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {ordered.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(image)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl ${
                image.id === active.id ? "ring-2 ring-gold" : ""
              }`}
            >
              <Image src={image.url} alt="" fill className="object-cover" sizes="112px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
