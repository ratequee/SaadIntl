"use client";

import { useState } from "react";

export function FileField({
  name,
  label,
  kind,
  defaultUrl,
  extra,
}: {
  name: string;
  label: string;
  kind: "images" | "documents";
  defaultUrl?: string;
  extra?: Record<string, string>;
}) {
  const [url, setUrl] = useState(defaultUrl || "");
  const [meta, setMeta] = useState(extra || {});
  const [error, setError] = useState("");

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);
    const response = await fetch("/api/upload", { method: "POST", body });
    if (!response.ok) {
      setError("Upload failed. Check file type and size.");
      return;
    }
    const data = await response.json();
    setUrl(data.url);
    setMeta({
      fileName: data.name,
      fileType: data.type,
      fileSize: String(data.size),
    });
    event.target.value = "";
  }

  function remove() {
    setUrl("");
    setMeta({});
    setError("");
  }

  return (
    <div className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input type="file" onChange={onChange} />
      <input type="hidden" name={name} value={url} />
      {kind === "documents" ? (
        <>
          <input type="hidden" name="fileName" value={meta.fileName || ""} />
          <input type="hidden" name="fileType" value={meta.fileType || ""} />
          <input type="hidden" name="fileSize" value={meta.fileSize || "0"} />
        </>
      ) : null}
      {url && kind === "images" ? (
        <div className="mt-1 max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-44 w-full rounded-xl object-cover" />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="truncate text-xs text-muted">{url}</p>
            <button
              type="button"
              onClick={remove}
              className="shrink-0 text-xs font-medium text-red-700 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}
      {url && kind === "documents" ? (
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs text-muted">{url}</p>
          <button
            type="button"
            onClick={remove}
            className="shrink-0 text-xs font-medium text-red-700 hover:underline"
          >
            Remove
          </button>
        </div>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
