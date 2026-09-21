import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getArticleBySlug, getCategories, getRelatedArticles } from "@/lib/cms";
import { formatDate, localized, siteUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, true);
  if (!article) return {};
  return {
    title: localized(article.seoTitle, locale) || localized(article.title, locale),
    description: localized(article.seoDescription, locale) || localized(article.excerpt, locale),
    alternates: { canonical: `/${locale}/articles/${slug}` },
    openGraph: { images: [article.featuredImageUrl] },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const session = await getAdminSession();
  const article = await getArticleBySlug(slug, Boolean(session));
  if (!article) notFound();
  const t = await getTranslations("articles");
  const [categories, related] = await Promise.all([
    getCategories("article"),
    getRelatedArticles(article),
  ]);
  const category = categories.find((item) => item.id === article.categoryId);
  const shareUrl = siteUrl(`/${locale}/articles/${article.slug}`);

  return (
    <article className="container-site py-12 md:py-20">
      <p className="text-sm text-muted">
        <Link href="/articles">{t("pageTitle")}</Link>
        {category ? ` · ${localized(category.name, locale)}` : ""}
      </p>
      <h1 className="display mt-3 max-w-4xl text-4xl md:text-6xl">
        {localized(article.title, locale)}
      </h1>
      <p className="mt-4 text-muted">
        {formatDate(article.publishedAt, locale)} · {localized(article.author, locale)} ·{" "}
        {t("minRead", { minutes: article.readingTimeMinutes })}
      </p>
      <div className="mt-8">
        <ProjectGallery
          images={article.images.length ? article.images : [{
            url: article.featuredImageUrl,
            caption: { en: "", ar: "" },
            alt: { en: localized(article.title, locale), ar: localized(article.title, locale) },
            isFeatured: true,
            displayOrder: 1,
          }]}
          locale={locale}
        />
      </div>
      <div
        className="prose-sip mt-10"
        dangerouslySetInnerHTML={{ __html: localized(article.content, locale) }}
      />
      <p className="mt-10 text-sm">
        {t("share")}:{" "}
        <a
          className="text-gold"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
        >
          LinkedIn
        </a>
      </p>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="display mb-6 text-3xl">{t("related")}</h2>
          <ul className="space-y-4">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/articles/${item.slug}`} className="text-lg font-medium hover:text-gold">
                  {localized(item.title, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
