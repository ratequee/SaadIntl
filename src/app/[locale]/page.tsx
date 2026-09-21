import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
import { localized } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSettings();
  return {
    title: localized(settings.companyName, locale),
    description: localized(settings.about, locale) || localized(settings.tagline, locale),
    alternates: { canonical: `/${locale}` },
    openGraph: {
      title: localized(settings.companyName, locale),
      description: localized(settings.about, locale) || localized(settings.tagline, locale),
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
