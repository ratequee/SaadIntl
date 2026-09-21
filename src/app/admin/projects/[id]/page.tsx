import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProjectForm } from "../_form";
import { getCategories, getProjectById } from "@/lib/cms";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("admin");
  const { id } = await params;
  const [project, categories] = await Promise.all([getProjectById(id), getCategories("project")]);
  if (!project) notFound();
  return (
    <div>
      <Link href="/admin/projects" className="text-sm text-gold">
        {t("backToProjects")}
      </Link>
      <h1 className="display mb-8 mt-4 text-4xl">{t("editProject")}</h1>
      <ProjectForm project={project} categories={categories} />
    </div>
  );
}
