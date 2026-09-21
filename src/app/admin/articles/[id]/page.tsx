import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm } from "../_form";
import { getArticleById, getCategories } from "@/lib/cms";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories] = await Promise.all([getArticleById(id), getCategories("article")]);
  if (!article) notFound();
  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-gold">
        ← Back to articles
      </Link>
      <h1 className="display mb-8 mt-4 text-4xl">Edit article</h1>
      <ArticleForm article={article} categories={categories} />
    </div>
  );
}
