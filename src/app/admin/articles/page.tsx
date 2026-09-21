import Link from "next/link";
import { deleteArticleAction } from "@/app/admin/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { getArticles } from "@/lib/cms";
import { MediaImage } from "@/components/ui/media-image";

const PAGE_SIZE = 8;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const all = await getArticles({ includeDrafts: true, query: q });
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const articles = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Articles</h1>
          <p className="mt-2 text-muted">Write and publish bilingual notes from site.</p>
        </div>
        <Link href="/admin/articles/new" className={buttonClass("dark", goldHoverClass)}>
          Add article
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" action="/admin/articles">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title or excerpt"
          className="min-w-64 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm"
        />
        <button type="submit" className={buttonClass("dark", goldHoverClass)}>
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-[1.6rem] bg-background">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 text-start font-medium">Image</th>
              <th className="px-4 py-3 text-start font-medium">Title</th>
              <th className="px-4 py-3 text-start font-medium">Visibility</th>
              <th className="px-4 py-3 text-start font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-start text-muted">
                  No articles match this search.
                </td>
              </tr>
            ) : (
              articles.map((article) => (
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
                    <p className="font-medium">{article.title.en}</p>
                    <p className="text-muted" dir="rtl">{article.title.ar}</p>
                  </td>
                  <td className="px-4 py-4 text-start align-top whitespace-nowrap">
                    {article.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-4 text-start align-top">
                    <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
                      <Link href={`/admin/articles/${article.id}`} className="text-gold">
                        Edit
                      </Link>
                      <Link href={`/en/articles/${article.slug}`} className="text-muted" target="_blank">
                        Preview
                      </Link>
                      <ConfirmDelete
                        action={deleteArticleAction}
                        id={article.id}
                        name={article.title.en}
                        kind="article"
                      />
                    </div>
                  </td>
                </tr>
              ))
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
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {current} of {totalPages}
          </span>
          {current < totalPages ? (
            <Link
              href={`/admin/articles?q=${encodeURIComponent(q)}&page=${current + 1}`}
              className="text-gold"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
