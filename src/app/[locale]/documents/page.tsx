import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { IconDownload } from "@/components/ui/icons";
import { getCategories, getDocuments } from "@/lib/cms";
import { formatDate, formatFileSize, localized } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "documents" });
  return {
    title: t("title"),
    description: t("pageLead"),
    alternates: { canonical: `/${locale}/documents` },
  };
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("documents");
  const [documents, categories] = await Promise.all([
    getDocuments(),
    getCategories("document"),
  ]);

  return (
    <div className="container-site py-16 md:py-24">
      <h1 className="display text-5xl md:text-7xl">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("pageLead")}</p>
      {documents.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={t("empty")} />
        </div>
      ) : (
        <ul className="mt-12 divide-y divide-border rounded-[2rem] bg-cream px-4 dark:bg-surface">
          {documents.map((doc) => {
            const category = categories.find((item) => item.id === doc.categoryId);
            return (
              <li key={doc.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {category ? localized(category.name, locale) : t("pdf")} · {formatDate(doc.publishedAt, locale)}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    {localized(doc.title, locale)}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{localized(doc.description, locale)}</p>
                </div>
                <a
                  href={doc.fileUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-cream dark:bg-cream dark:text-ink"
                >
                  {t("download")}
                  <span className="text-xs opacity-70">{formatFileSize(doc.fileSize, locale)}</span>
                  <IconDownload />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
