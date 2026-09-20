import { upsertArticleAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { FileField } from "@/components/admin/file-field";
import { buttonClass } from "@/components/ui/button";
import type { Article, Category } from "@/lib/types";

export function ArticleForm({
  article,
  categories,
}: {
  article?: Article;
  categories: Category[];
}) {
  return (
    <form action={upsertArticleAction} className="grid gap-5">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title (English)" name="title_en" defaultValue={article?.title.en} required />
        <Field label="Title (Arabic)" name="title_ar" defaultValue={article?.title.ar} dir="rtl" required />
        <Field label="Slug" name="slug" defaultValue={article?.slug} required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Category</span>
          <select name="categoryId" defaultValue={article?.categoryId} className="rounded-full border border-border px-4 py-3">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.en}
              </option>
            ))}
          </select>
        </label>
        <Field label="Author (English)" name="author_en" defaultValue={article?.author.en} />
        <Field label="Author (Arabic)" name="author_ar" defaultValue={article?.author.ar} dir="rtl" />
        <Field
          label="Publication date"
          name="publishedAt"
          type="datetime-local"
          defaultValue={article?.publishedAt?.slice(0, 16) || ""}
        />
      </div>
      <Field label="Excerpt (English)" name="excerpt_en" defaultValue={article?.excerpt.en} textarea />
      <Field label="Excerpt (Arabic)" name="excerpt_ar" defaultValue={article?.excerpt.ar} textarea dir="rtl" />
      <Field label="Content (English)" name="content_en" defaultValue={article?.content.en} textarea />
      <Field label="Content (Arabic)" name="content_ar" defaultValue={article?.content.ar} textarea dir="rtl" />
      <FileField name="featuredImageUrl" label="Featured image" kind="images" defaultUrl={article?.featuredImageUrl} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title (English)" name="seo_title_en" defaultValue={article?.seoTitle.en} />
        <Field label="SEO title (Arabic)" name="seo_title_ar" defaultValue={article?.seoTitle.ar} dir="rtl" />
        <Field label="SEO description (English)" name="seo_description_en" defaultValue={article?.seoDescription.en} textarea />
        <Field label="SEO description (Arabic)" name="seo_description_ar" defaultValue={article?.seoDescription.ar} textarea dir="rtl" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={article?.isPublished} /> Published
      </label>
      <button type="submit" className={buttonClass("dark")}>Save article</button>
    </form>
  );
}
