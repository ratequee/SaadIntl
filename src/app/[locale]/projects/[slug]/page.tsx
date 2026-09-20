import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { ProjectCard } from "@/components/projects/project-card";
import { getAdminSession } from "@/lib/auth/session";
import { getCategories, getProjectBySlug, getProjects } from "@/lib/cms";
import { formatDate, localized } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, true);
  if (!project) return {};
  return {
    title: localized(project.seoTitle, locale) || localized(project.title, locale),
    description: localized(project.seoDescription, locale) || localized(project.excerpt, locale),
    alternates: { canonical: `/${locale}/projects/${slug}` },
    openGraph: {
      images: [project.featuredImageUrl],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const session = await getAdminSession();
  const project = await getProjectBySlug(slug, Boolean(session));
  if (!project) notFound();
  const t = await getTranslations("projects");
  const [categories, related] = await Promise.all([
    getCategories("project"),
    getProjects(),
  ]);
  const category = categories.find((item) => item.id === project.categoryId);
  const others = related.filter((item) => item.id !== project.id).slice(0, 3);

  return (
    <div className="container-site py-12 md:py-20">
      <p className="text-sm text-muted">
        <Link href="/projects">{t("pageTitle")}</Link>
        {category ? ` · ${localized(category.name, locale)}` : ""}
      </p>
      <h1 className="display mt-3 max-w-4xl text-5xl md:text-7xl">
        {localized(project.title, locale)}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">{localized(project.excerpt, locale)}</p>
      <div className="mt-10">
        <ProjectGallery images={project.images} locale={locale} />
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div
          className="prose-sip"
          dangerouslySetInnerHTML={{ __html: localized(project.description, locale) }}
        />
        <aside className="h-fit rounded-[1.8rem] bg-surface p-6">
          <h2 className="text-lg font-semibold">{t("facts")}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("location")}</dt>
              <dd>{localized(project.location, locale)}</dd>
            </div>
            {project.client ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t("client")}</dt>
                <dd>{project.client}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("status")}</dt>
              <dd>{t(project.status)}</dd>
            </div>
            {project.startDate ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{locale === "ar" ? "البداية" : "Start"}</dt>
                <dd>{formatDate(project.startDate, locale)}</dd>
              </div>
            ) : null}
            {project.completionDate ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{locale === "ar" ? "الانتهاء" : "Completion"}</dt>
                <dd>{formatDate(project.completionDate, locale)}</dd>
              </div>
            ) : null}
            {localized(project.scope, locale) ? (
              <div>
                <dt className="text-muted">{t("scope")}</dt>
                <dd className="mt-1">{localized(project.scope, locale)}</dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </div>
      {others.length > 0 ? (
        <section className="mt-20">
          <h2 className="display mb-8 text-3xl md:text-5xl">{t("related")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {others.map((item) => (
              <ProjectCard
                key={item.id}
                project={item}
                locale={locale}
                category={categories.find((cat) => cat.id === item.categoryId)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
