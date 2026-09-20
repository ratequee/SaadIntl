import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomePage } from "@/components/home/home-page";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import {
  getArticles,
  getCategories,
  getDocuments,
  getProjects,
  getSettings,
  getTestimonials,
} from "@/lib/cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    alternates: { canonical: `/${locale}` },
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDescription"),
      locale: locale === "ar" ? "ar_QA" : "en_QA",
      images: ["/images/villa-compound.jpg"],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [settings, projects, articles, documents, testimonials, categories] =
    await Promise.all([
      getSettings(),
      getProjects(),
      getArticles(),
      getDocuments(),
      getTestimonials(),
      getCategories(),
    ]);

  return (
    <>
    <OrganizationJsonLd settings={settings} locale={locale} />
    <HomePage
      locale={locale}
      settings={settings}
      projects={projects}
      ongoing={projects.filter((item) => item.status === "in_progress")}
      articles={articles}
      documents={documents}
      testimonials={testimonials}
      categories={categories}
    />
    </>
  );
}
