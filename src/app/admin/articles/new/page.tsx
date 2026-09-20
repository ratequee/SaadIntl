import { ArticleForm } from "../_form";
import { getCategories } from "@/lib/cms";

export default async function NewArticlePage() {
  const categories = await getCategories("article");
  return (
    <div>
      <h1 className="display mb-8 text-4xl">Add article</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
