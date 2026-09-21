import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IconDownload } from "@/components/ui/icons";
import { getAdminSession } from "@/lib/auth/session";
import { getCategories, getDocumentBySlug } from "@/lib/cms";
import { documentAttachments, formatDate, formatFileSize, localized } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const document = await getDocumentBySlug(slug, true);
  if (!document) return {};
  return {
    title: localized(document.title, locale),
    description: localized(document.description, locale),
    alternates: { canonical: `/${locale}/documents/${slug}` },
  };
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const session = await getAdminSession();
  const document = await getDocumentBySlug(slug, Boolean(session));
  if (!document) notFound();
  const t = await getTranslations("documents");
  const categories = await getCategories("document");
  const category = categories.find((item) => item.id === document.categoryId);
  const files = documentAttachments(document);

  return (
    <div className="container-site py-12 md:py-20">
      <p className="text-sm text-muted">
        <Link href="/documents">{t("title")}</Link>
        {category ? ` · ${localized(category.name, locale)}` : ""}
      </p>
      <h1 className="display mt-3 max-w-4xl text-4xl md:text-6xl">
        {localized(document.title, locale)}
      </h1>
      <p className="mt-4 text-muted">
        {formatDate(document.publishedAt, locale)}
        {category ? ` · ${localized(category.name, locale)}` : ""}
      </p>
      <p className="mt-6 max-w-2xl text-lg text-muted">{localized(document.description, locale)}</p>
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">{t("files")}</h2>
        <ul className="mt-4 grid gap-3">
          {files.map((file) => (
            <li key={file.url}>
              <a
                href={file.url}
                download
                className="inline-flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl bg-cream px-5 py-4 text-sm dark:bg-surface"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{file.fileName || t("pdf")}</span>
                  <span className="mt-1 block text-xs text-muted">{formatFileSize(file.fileSize, locale)}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2 text-cream hover:bg-gold hover:text-espresso dark:bg-cream dark:text-ink dark:hover:bg-gold dark:hover:text-espresso">
                  {t("download")}
                  <IconDownload />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
