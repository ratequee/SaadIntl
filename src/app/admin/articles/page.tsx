import Link from "next/link";
import { deleteArticleAction } from "@/app/admin/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { buttonClass } from "@/components/ui/button";
import { getArticles } from "@/lib/cms";

export default async function AdminArticlesPage() {
  const articles = await getArticles({ includeDrafts: true });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Articles</h1>
          <p className="mt-2 text-muted">Write and publish bilingual notes from site.</p>
        </div>
        <Link href="/admin/articles/new" className={buttonClass("dark")}>Add article</Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-[1.6rem] bg-background">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-border last:border-0">
                <td className="px-4 py-4">
                  <p className="font-medium">{article.title.en}</p>
                  <p className="text-muted" dir="rtl">{article.title.ar}</p>
                </td>
                <td className="px-4 py-4">{article.isPublished ? "Published" : "Draft"}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-3">
                    <Link href={`/admin/articles/${article.id}`} className="text-gold">Edit</Link>
                    <Link href={`/en/articles/${article.slug}`} className="text-muted" target="_blank">Preview</Link>
                    <ConfirmDelete action={deleteArticleAction} id={article.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
