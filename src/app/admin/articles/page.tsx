import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { deleteArticleAction } from "@/app/admin/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { getArticles } from "@/lib/cms";
import { MediaImage } from "@/components/ui/media-image";
import { localized } from "@/lib/utils";

const PAGE_SIZE = 8;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const { q = "", page = "1" } = await searchParams;
  const all = await getArticles({ includeDrafts: true, query: q, locale });
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const articles = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl">{t("articles")}</h1>
          <p className="mt-2 text-muted">{t("articlesLead")}</p>
        </div>
        <Link href="/admin/articles/new" className={buttonClass("dark", goldHoverClass)}>
          {t("addArticle")}
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" action="/admin/articles">
        <input
          name="q"
          defaultValue={q}
          placeholder={t("searchArticles")}
          className="min-w-64 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm"
        />
        <button type="submit" className={buttonClass("dark", goldHoverClass)}>
          {t("search")}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-[1.6rem] bg-background">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 text-start font-medium">{t("image")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("title")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("visibility")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-start text-muted">
                  {t("noArticlesSearch")}
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const title = localized(article.title, locale);
                return (
                  <tr key={article.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 text-start align-top">
                      {article.featuredImageUrl ? (
                        <MediaImage
                          src={article.featuredImageUrl}
                          alt=""
                          width={80}
                          height={56}
                          sizes="80px"
                          className="h-14 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="grid h-14 w-20 place-items-center rounded-lg bg-surface text-xs text-muted">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-start align-top">
                      <p className="font-medium">{title}</p>
                    </td>
                    <td className="px-4 py-4 text-start align-top whitespace-nowrap">
                      {article.isPublished ? t("published") : t("draft")}
                    </td>
                    <td className="px-4 py-4 text-start align-top">
                      <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
                        <Link href={`/admin/articles/${article.id}`} className="text-gold">
                          {t("edit")}
                        </Link>
                        <Link href={`/${locale}/articles/${article.slug}`} className="text-muted" target="_blank">
                          {t("preview")}
                        </Link>
                        <ConfirmDelete
                          action={deleteArticleAction}
                          id={article.id}
                          name={title}
                          kind="article"
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
              href={`/admin/articles?q=${encodeURIComponent(q)}&page=${current - 1}`}
              className="text-gold"
            >
              {t("previous")}
            </Link>
          ) : null}
          <span className="text-muted">{t("pageOf", { current, total: totalPages })}</span>
          {current < totalPages ? (
            <Link
              href={`/admin/articles?q=${encodeURIComponent(q)}&page=${current + 1}`}
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
