"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";
import type { DocumentFile } from "@/lib/types";

export type DocumentFileItem = DocumentFile & {
  preview: string;
  file?: File;
};

export function DocumentFilesField({
  defaultFiles = [],
  required,
  onChange,
}: {
  defaultFiles?: DocumentFile[];
  required?: boolean;
  onChange?: (files: DocumentFileItem[]) => void;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<DocumentFileItem[]>(
    defaultFiles.map((item) => ({
      ...item,
      preview: item.fileType.startsWith("image/") ? item.url : "",
    })),
  );

  function commit(next: DocumentFileItem[]) {
    setFiles(next);
    onChange?.(next);
  }

  function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selected.length) return;
    commit([
      ...files,
      ...selected.map((file) => ({
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        url: "",
        file,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      })),
    ]);
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium">
        {t("files")}
        {required ? <span className="text-gold"> *</span> : null}
      </p>
      <input ref={inputRef} type="file" multiple className="sr-only" onChange={addFiles} />
      {required ? (
        <input
          tabIndex={-1}
          className="sr-only"
          value={files.length ? "ok" : ""}
          required
          onChange={() => undefined}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={buttonClass("dark", goldHoverClass)}
        >
          {t("addFiles")}
        </button>
        <p className="text-xs text-muted">{t("filesHelp")}</p>
      </div>
      {files.length ? (
        <ul className="grid gap-3">
          {files.map((item, index) => (
            <li
              key={`${item.url || item.fileName}-${index}`}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-3"
            >
              {item.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.preview} alt="" className="h-16 w-20 rounded-lg object-cover" />
              ) : (
                <span className="grid h-16 w-20 place-items-center rounded-lg bg-surface text-[0.65rem] font-semibold uppercase text-muted">
                  {t("file")}
                </span>
              )}
              <div className="min-w-40 flex-1">
                <p className="truncate text-sm font-medium" dir="ltr">
                  {item.fileName}
                </p>
                <p className="text-xs text-muted">
                  {item.file ? t("selectedUploadsOnSave") : t("alreadyUploaded")}
                  {item.fileSize ? ` · ${formatFileSize(item.fileSize, locale)}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-red-700"
                onClick={() => commit(files.filter((_, i) => i !== index))}
              >
                {t("remove")}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
