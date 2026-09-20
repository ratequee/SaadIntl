import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { MediaImage } from "@/components/ui/media-image";
import { getArticles, getCategories } from "@/lib/cms";
import { formatDate, localized } from "@/lib/utils";

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
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("articles");
  const [articles, categories] = await Promise.all([
    getArticles({ query: filters.q, category: filters.category }),
    getCategories("article"),
  ]);

  return (
    <div className="container-site py-16 md:py-24">
      <h1 className="display text-5xl md:text-7xl">{t("pageTitle")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("pageLead")}</p>
      <form className="mt-8">
        <label className="sr-only" htmlFor="article-search">{t("search")}</label>
        <input
          id="article-search"
          name="q"
          defaultValue={filters.q}
          placeholder={t("search")}
          className="w-full max-w-md rounded-full border border-border bg-background px-5 py-3"
        />
      </form>
      {articles.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={t("empty")} />
        </div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
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
      )}
    </div>
  );
}
