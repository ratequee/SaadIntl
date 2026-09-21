import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { deleteDocumentAction } from "@/app/admin/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { getDocuments } from "@/lib/cms";
import { documentAttachments, documentExpiry, formatDate, localized } from "@/lib/utils";
import type { DocumentFile } from "@/lib/types";

function isImageFile(file: DocumentFile) {
  if (file.fileType.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|avif|gif)$/i.test(file.fileName || file.url);
}

function fileLabel(file: DocumentFile) {
  const ext = file.fileName.split(".").pop()?.toUpperCase();
  if (ext && ext.length <= 4 && ext !== file.fileName.toUpperCase()) return ext;
  if (file.fileType.includes("pdf")) return "PDF";
  if (file.fileType.includes("word")) return "DOC";
  return "FILE";
}

const PAGE_SIZE = 8;

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const { q = "", page = "1" } = await searchParams;
  const all = await getDocuments({ includeDrafts: true, query: q, locale });
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const documents = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl">{t("documents")}</h1>
          <p className="mt-2 text-muted">{t("documentsLead")}</p>
        </div>
        <Link href="/admin/documents/new" className={buttonClass("dark", goldHoverClass)}>
          {t("addDocument")}
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" action="/admin/documents">
        <input
          name="q"
          defaultValue={q}
          placeholder={t("searchDocuments")}
          className="min-w-64 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm"
        />
        <button type="submit" className={buttonClass("dark", goldHoverClass)}>
          {t("search")}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-[1.6rem] bg-background">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 text-start font-medium">{t("title")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("files")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("expiry")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("visibility")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-start text-muted">
                  {t("noDocumentsSearch")}
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const expiry = documentExpiry(doc.hasExpiry, doc.expiresAt);
                const files = documentAttachments(doc);
                const title = localized(doc.title, locale);
                return (
                  <tr key={doc.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 text-start align-top">
                      <p className="font-medium">{title}</p>
                    </td>
                    <td className="px-4 py-4 text-start align-top">
                      {files.length ? (
                        <div className="flex flex-wrap gap-2">
                          {files.map((file) => (
                            <a
                              key={file.url}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              title={file.fileName}
                              className="block"
                            >
                              {isImageFile(file) ? (
                                <MediaImage
                                  src={file.url}
                                  alt={file.fileName}
                                  width={80}
                                  height={56}
                                  sizes="80px"
                                  className="h-14 w-20 rounded-lg object-cover"
                                />
                              ) : (
                                <span className="grid h-14 w-20 place-items-center rounded-lg bg-surface text-[0.65rem] font-semibold uppercase text-muted">
                                  {fileLabel(file)}
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-start align-top whitespace-nowrap">
                      {!expiry
                        ? t("none")
                        : expiry.status === "expired"
                          ? t("expired")
                          : expiry.status === "soon"
                            ? t("expiresOn", { date: formatDate(doc.expiresAt, locale) })
                            : formatDate(doc.expiresAt, locale)}
                    </td>
                    <td className="px-4 py-4 text-start align-top whitespace-nowrap">
                      {doc.isPublished ? t("published") : t("draft")}
                    </td>
                    <td className="px-4 py-4 text-start align-top">
                      <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
                        <Link href={`/admin/documents/${doc.id}`} className="text-gold">
                          {t("edit")}
                        </Link>
                        {doc.fileUrl ? (
                          <a href={doc.fileUrl} className="text-muted" target="_blank" rel="noreferrer">
                            {t("preview")}
                          </a>
                        ) : null}
                        <ConfirmDelete
                          action={deleteDocumentAction}
                          id={doc.id}
                          name={title}
                          kind="document"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          {current > 1 ? (
            <Link
              href={`/admin/documents?q=${encodeURIComponent(q)}&page=${current - 1}`}
              className="text-gold"
            >
              {t("previous")}
            </Link>
          ) : null}
          <span className="text-muted">{t("pageOf", { current, total: totalPages })}</span>
          {current < totalPages ? (
            <Link
              href={`/admin/documents?q=${encodeURIComponent(q)}&page=${current + 1}`}
              className="text-gold"
            >
              {t("next")}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
