import Link from "next/link";
import { ArticleForm } from "../_form";
import { getCategories } from "@/lib/cms";

export default async function NewArticlePage() {
  const categories = await getCategories("article");
  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-gold">
        ← Back to articles
      </Link>
      <h1 className="display mb-8 mt-4 text-4xl">Add article</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
