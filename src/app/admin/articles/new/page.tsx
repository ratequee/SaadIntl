import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArticleForm } from "../_form";
import { getCategories } from "@/lib/cms";

export default async function NewArticlePage() {
  const t = await getTranslations("admin");
  const categories = await getCategories("article");
  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-gold">
        {t("backToArticles")}
      </Link>
      <h1 className="display mb-8 mt-4 text-4xl">{t("addArticle")}</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
