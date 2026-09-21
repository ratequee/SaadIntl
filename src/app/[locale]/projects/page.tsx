import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectsPagination } from "@/components/projects/projects-pagination";
import { getCategories, getProjects } from "@/lib/cms";

const PAGE_SIZE = 9;

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
  searchParams: Promise<{ category?: string; status?: string; q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const query = filters.q?.trim() || "";
  const [allProjects, categories] = await Promise.all([
    getProjects({
      category: filters.category,
      status: filters.status,
      query,
      locale,
    }),
    getCategories("project"),
  ]);

  const totalPages = Math.max(1, Math.ceil(allProjects.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(filters.page) || 1), totalPages);
  const projects = allProjects.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hasFilters = Boolean(query || (filters.category && filters.category !== "all") || (filters.status && filters.status !== "all"));

  return (
    <div className="container-site py-16 md:py-24">
      <h1 className="display text-5xl md:text-7xl">{t("pageTitle")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("pageLead")}</p>
      <div className="mt-10">
        <ProjectFilters categories={categories} locale={locale} />
      </div>
      {allProjects.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={hasFilters ? t("emptySearch") : t("empty")} />
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted">{t("results", { count: allProjects.length })}</p>
          <div className="mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                locale={locale}
                category={categories.find((item) => item.id === project.categoryId)}
              />
            ))}
          </div>
          <ProjectsPagination
            current={current}
            totalPages={totalPages}
            query={{ category: filters.category, status: filters.status, q: query }}
          />
        </>
      )}
    </div>
  );
}
