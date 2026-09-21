import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { MediaImage } from "@/components/ui/media-image";
import { ArticleFilters } from "@/components/articles/article-filters";
import { ProjectsPagination } from "@/components/projects/projects-pagination";
import { getArticles, getCategories } from "@/lib/cms";
import { formatDate, localized } from "@/lib/utils";

const PAGE_SIZE = 9;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  return {
    title: t("pageTitle"),
    description: t("pageLead"),
    alternates: { canonical: `/${locale}/articles` },
  };
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("articles");
  const query = filters.q?.trim() || "";
  const [allArticles, categories] = await Promise.all([
    getArticles({ query, category: filters.category, locale }),
    getCategories("article"),
  ]);

  const totalPages = Math.max(1, Math.ceil(allArticles.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(filters.page) || 1), totalPages);
  const articles = allArticles.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hasFilters = Boolean(query || (filters.category && filters.category !== "all"));

  return (
    <div className="container-site py-16 md:py-24">
      <h1 className="display text-5xl md:text-7xl">{t("pageTitle")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("pageLead")}</p>
      <div className="mt-10">
        <ArticleFilters categories={categories} locale={locale} />
      </div>
      {allArticles.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={hasFilters ? t("emptySearch") : t("empty")} />
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted">{t("results", { count: allArticles.length })}</p>
          <div className="mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => {
              const category = categories.find((item) => item.id === article.categoryId);
              return (
                <Link key={article.id} href={`/articles/${article.slug}`} className="group">
                  <article>
                    <div className="overflow-hidden rounded-[1.8rem]">
                      <MediaImage
                        src={article.featuredImageUrl}
                        alt={localized(article.title, locale)}
                        width={720}
                        height={480}
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <p className="mt-4 text-sm text-muted">
                      {category ? localized(category.name, locale) : ""} · {formatDate(article.publishedAt, locale)}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">
                      {localized(article.title, locale)}
                    </h2>
                    <p className="mt-2 text-sm text-muted">{localized(article.excerpt, locale)}</p>
                  </article>
                </Link>
              );
            })}
          </div>
          <ProjectsPagination
            current={current}
            totalPages={totalPages}
            query={{ category: filters.category, q: query }}
            basePath="/articles"
            namespace="articles"
          />
        </>
      )}
    </div>
  );
}
