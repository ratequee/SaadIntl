"use client";

import { useState } from "react";

type ImageItem = {
  url: string;
  caption: { en: string; ar: string };
  alt: { en: string; ar: string };
  isFeatured: boolean;
  displayOrder: number;
};

export function GalleryField({ defaultImages = [] }: { defaultImages?: ImageItem[] }) {
  const [images, setImages] = useState<ImageItem[]>(defaultImages);

  async function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", "images");
      const response = await fetch("/api/upload", { method: "POST", body });
      if (!response.ok) continue;
      const data = await response.json();
      setImages((current) => [
        ...current,
        {
          url: data.url,
          caption: { en: "", ar: "" },
          alt: { en: file.name, ar: file.name },
          isFeatured: current.length === 0,
          displayOrder: current.length + 1,
        },
      ]);
    }
  }

  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, order) => ({ ...item, displayOrder: order + 1 }));
    });
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium">Gallery</p>
      <input type="file" accept="image/*" multiple onChange={addFiles} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <ul className="grid gap-3">
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="h-16 w-20 rounded-lg object-cover" />
            <input
              className="min-w-40 flex-1 rounded-full border border-border px-3 py-2 text-sm"
              placeholder="Caption EN"
              value={image.caption.en}
              onChange={(event) =>
                setImages((current) =>
                  current.map((item, i) =>
                    i === index ? { ...item, caption: { ...item.caption, en: event.target.value } } : item,
                  ),
                )
              }
            />
            <input
              className="min-w-40 flex-1 rounded-full border border-border px-3 py-2 text-sm"
              placeholder="Caption AR"
              value={image.caption.ar}
              dir="rtl"
              onChange={(event) =>
                setImages((current) =>
                  current.map((item, i) =>
                    i === index ? { ...item, caption: { ...item.caption, ar: event.target.value } } : item,
                  ),
                )
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={image.isFeatured}
                onChange={() =>
                  setImages((current) =>
                    current.map((item, i) => ({ ...item, isFeatured: i === index })),
                  )
                }
              />
              Featured
            </label>
            <button type="button" className="text-sm" onClick={() => move(index, -1)}>
              Up
            </button>
            <button type="button" className="text-sm" onClick={() => move(index, 1)}>
              Down
            </button>
            <button
              type="button"
              className="text-sm text-red-700"
              onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
