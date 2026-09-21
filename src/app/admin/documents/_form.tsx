"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { upsertDocumentAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { DocumentFilesField, type DocumentFileItem } from "@/components/admin/document-files-field";
import { pushAdminToast, reportAdminForm } from "@/components/admin/admin-toast";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { documentAttachments, localized, toDateInput } from "@/lib/utils";
import type { Category, DocumentItem } from "@/lib/types";

async function uploadFile(file: File) {
  const body = new FormData();
  body.set("file", file);
  body.set("kind", "documents");
  const response = await fetch("/api/upload", { method: "POST", body });
  if (!response.ok) throw new Error("File upload failed.");
  const data = await response.json();
  return {
    url: String(data.url),
    fileName: String(data.name || file.name),
    fileType: String(data.type || file.type || "application/octet-stream"),
    fileSize: Number(data.size || file.size || 0),
  };
}

export function DocumentForm({
  document,
  categories,
}: {
  document?: DocumentItem;
  categories: Category[];
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const existingFiles = document ? documentAttachments(document) : [];
  const [files, setFiles] = useState<DocumentFileItem[]>(
    existingFiles.map((item) => ({
      ...item,
      preview: item.fileType.startsWith("image/") ? item.url : "",
    })),
  );
  const [hasExpiry, setHasExpiry] = useState(Boolean(document?.hasExpiry));
  const [expiresAt, setExpiresAt] = useState(() => toDateInput(document?.expiresAt));
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (
      !reportAdminForm(form, {
        fieldRequired: (name) => t("fieldRequired", { name }),
        requiredFields: t("requiredFields"),
      })
    ) {
      return;
    }
    if (!files.length) {
      pushAdminToast(t("filesRequired"), "error");
      return;
    }
    if (hasExpiry && !expiresAt) {
      pushAdminToast(t("expiryRequired"), "error");
      return;
    }

    setSaving(true);
    try {
      const uploaded = [];
      for (const item of files) {
        const file = item.file ? await uploadFile(item.file) : item;
        if (!file.url) throw new Error(t("fileMissing"));
        uploaded.push({
          url: file.url,
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
        });
      }
      const data = new FormData(form);
      data.set("files", JSON.stringify(uploaded));
      data.set("hasExpiry", hasExpiry ? "on" : "");
      data.set("expiresAt", hasExpiry ? expiresAt : "");
      await upsertDocumentAction(data);
    } catch (err) {
      if (
        typeof err === "object" &&
        err &&
        "digest" in err &&
        String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      pushAdminToast(err instanceof Error ? err.message : t("couldNotSaveDocument"), "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {document ? <input type="hidden" name="id" value={document.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <TitleSlugFields defaultTitle={document?.title.en} defaultSlug={document?.slug} />
        <Field label={t("titleAr")} name="title_ar" defaultValue={document?.title.ar} dir="rtl" required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">
            {t("category")}
            <span className="text-gold"> *</span>
          </span>
          <select
            name="categoryId"
            defaultValue={document?.categoryId || ""}
            required
            className="rounded-full border border-border px-4 py-3"
          >
            <option value="" disabled>
              {t("selectCategory")}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {localized(category.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <Field
          label={t("displayOrder")}
          name="displayOrder"
          type="number"
          defaultValue={document?.displayOrder ?? 99}
          required
        />
      </div>
      <Field
        label={t("descriptionEn")}
        name="description_en"
        defaultValue={document?.description.en}
        textarea
        dir="ltr"
        required
      />
      <Field
        label={t("descriptionAr")}
        name="description_ar"
        defaultValue={document?.description.ar}
        textarea
        dir="rtl"
        required
      />
      <DocumentFilesField defaultFiles={existingFiles} required onChange={setFiles} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="hasExpiry"
          checked={hasExpiry}
          onChange={(event) => setHasExpiry(event.target.checked)}
        />
        {t("hasExpiry")}
      </label>
      {hasExpiry ? (
        <label className="grid max-w-sm gap-2 text-sm">
          <span className="font-medium">
            {t("expiryDate")}
            <span className="text-gold"> *</span>
          </span>
          <input
            type="date"
            name="expiresAt"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            required
            className="w-full rounded-[1.2rem] border border-border bg-background px-4 py-3 text-sm"
          />
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={document?.isPublished} /> {t("published")}
      </label>
      <button type="submit" disabled={saving} className={buttonClass("dark", goldHoverClass)}>
        {saving
          ? files.some((item) => item.file)
            ? t("savingUploading")
            : t("saving")
          : t("saveDocument")}
      </button>
    </form>
  );
}
