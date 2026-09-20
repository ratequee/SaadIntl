import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { getCategories, getProjects } from "@/lib/cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return {
    title: t("pageTitle"),
    description: t("pageLead"),
    alternates: { canonical: `/${locale}/projects` },
  };
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; status?: string; q?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const [projects, categories] = await Promise.all([
    getProjects({
      category: filters.category,
      status: filters.status,
      query: filters.q,
    }),
    getCategories("project"),
  ]);

  return (
    <div className="container-site py-16 md:py-24">
      <h1 className="display text-5xl md:text-7xl">{t("pageTitle")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("pageLead")}</p>
      <div className="mt-10">
        <ProjectFilters categories={categories} locale={locale} />
      </div>
      {projects.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={t("empty")} />
        </div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              category={categories.find((item) => item.id === project.categoryId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
