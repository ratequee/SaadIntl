import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentFilters } from "@/components/documents/document-filters";
import { ProjectsPagination } from "@/components/projects/projects-pagination";
import { getCategories, getDocuments } from "@/lib/cms";
import { formatDate, localized, documentAttachments } from "@/lib/utils";

const PAGE_SIZE = 9;

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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("documents");
  const query = filters.q?.trim() || "";
  const [allDocuments, categories] = await Promise.all([
    getDocuments({ query, category: filters.category, locale }),
    getCategories("document"),
  ]);

  const totalPages = Math.max(1, Math.ceil(allDocuments.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(filters.page) || 1), totalPages);
  const documents = allDocuments.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hasFilters = Boolean(query || (filters.category && filters.category !== "all"));

  return (
    <div className="container-site py-16 md:py-24">
      <h1 className="display text-5xl md:text-7xl">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("pageLead")}</p>
      <div className="mt-10">
        <DocumentFilters categories={categories} locale={locale} />
      </div>
      {allDocuments.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={hasFilters ? t("emptySearch") : t("empty")} />
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted">{t("results", { count: allDocuments.length })}</p>
          <ul className="mt-6 divide-y divide-border rounded-[2rem] bg-cream px-4 dark:bg-surface">
            {documents.map((doc) => {
              const category = categories.find((item) => item.id === doc.categoryId);
              const files = documentAttachments(doc);
              return (
                <li key={doc.id}>
                  <Link
                    href={`/documents/${doc.slug}`}
                    className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">
                        {category ? localized(category.name, locale) : t("pdf")} · {formatDate(doc.publishedAt, locale)}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight group-hover:text-gold">
                        {localized(doc.title, locale)}
                      </h2>
                      <p className="mt-1 text-sm text-muted">{localized(doc.description, locale)}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 self-start rounded-full bg-ink px-5 py-2.5 text-sm text-cream hover:bg-gold hover:text-espresso dark:bg-cream dark:text-ink dark:hover:bg-gold dark:hover:text-espresso sm:self-center">
                      {t("view")}
                      <span className="text-xs opacity-70">{files.length}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ProjectsPagination
            current={current}
            totalPages={totalPages}
            query={{ category: filters.category, q: query }}
            basePath="/documents"
            namespace="documents"
          />
        </>
      )}
    </div>
  );
}
