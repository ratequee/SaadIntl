"use client";

import { useState } from "react";
import { slugify } from "@/lib/utils";

export function TitleSlugFields({
  defaultTitle,
  defaultSlug,
}: {
  defaultTitle?: string;
  defaultSlug?: string;
}) {
  const [title, setTitle] = useState(defaultTitle || "");
  const slug = slugify(title) || defaultSlug || "";

  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">Title (English)</span>
      <input
        name="title_en"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm"
      />
      <input type="hidden" name="slug" value={slug} />
      <span className="text-xs text-muted">Slug: {slug || "generated from the English title"}</span>
    </label>
  );
}
