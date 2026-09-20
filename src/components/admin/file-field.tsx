"use client";

import { useRef, useState } from "react";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { IMAGE_ACCEPT, isAllowedImage, MAX_IMAGE_SIZE } from "@/lib/validations";

export function FileField({
  name,
  label,
  kind,
  defaultUrl,
  extra,
  required,
  deferUpload,
  onPendingFile,
}: {
  name: string;
  label: string;
  kind: "images" | "documents";
  defaultUrl?: string;
  extra?: Record<string, string>;
  required?: boolean;
  deferUpload?: boolean;
  onPendingFile?: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl || "");
  const [preview, setPreview] = useState(defaultUrl || "");
  const [meta, setMeta] = useState(extra || {});
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");

    if (kind === "images") {
      if (!file.type.startsWith("image/") || !isAllowedImage(file)) {
        setError(
          file.size > MAX_IMAGE_SIZE
            ? "Image must be 10 MB or smaller."
            : "Use a JPG, PNG, WEBP or AVIF image.",
        );
        event.target.value = "";
        return;
      }
      setPreview(URL.createObjectURL(file));
    }

    if (deferUpload) {
      onPendingFile?.(file);
      setUrl(url || "pending");
      event.target.value = "";
      return;
    }

    setUploading(true);
    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);
    const response = await fetch("/api/upload", { method: "POST", body });
    setUploading(false);
    if (!response.ok) {
      setError("Upload failed. Check file type and size (max 10 MB).");
      if (kind === "images" && !defaultUrl) setPreview("");
      return;
    }
    const data = await response.json();
    setUrl(data.url);
    setPreview(data.url);
    setMeta({
      fileName: data.name,
      fileType: data.type,
      fileSize: String(data.size),
    });
    event.target.value = "";
  }

  function remove() {
    setUrl("");
    setPreview("");
    setMeta({});
    setError("");
    onPendingFile?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="grid gap-3 text-sm">
      <span className="font-medium">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={kind === "images" ? IMAGE_ACCEPT : undefined}
        onChange={onChange}
        className="sr-only"
      />
      <input
        type="text"
        name={name}
        value={url === "pending" ? "" : url}
        required={required && !preview}
        readOnly
        tabIndex={-1}
        className="sr-only"
        aria-hidden
      />
      {kind === "documents" ? (
        <>
          <input type="hidden" name="fileName" value={meta.fileName || ""} />
          <input type="hidden" name="fileType" value={meta.fileType || ""} />
          <input type="hidden" name="fileSize" value={meta.fileSize || "0"} />
        </>
      ) : null}

      {kind === "images" && preview ? (
        <div className="max-w-sm overflow-hidden rounded-2xl border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="h-48 w-full object-cover" />
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="truncate text-xs text-muted">
              {uploading ? "Uploading…" : deferUpload ? "Selected · uploads on save" : "Featured image ready"}
            </p>
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={buttonClass("dark", goldHoverClass)}
        >
          {uploading ? "Uploading…" : preview ? "Replace image" : "Choose image"}
        </button>
        <p className="text-xs text-muted">JPG, PNG, WEBP or AVIF · max 10 MB</p>
      </div>

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
