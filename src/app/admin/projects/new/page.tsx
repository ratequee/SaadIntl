import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProjectForm } from "../_form";
import { getCategories } from "@/lib/cms";

export default async function NewProjectPage() {
  const t = await getTranslations("admin");
  const categories = await getCategories("project");
  return (
    <div>
      <Link href="/admin/projects" className="text-sm text-gold">
        {t("backToProjects")}
      </Link>
      <h1 className="display mb-8 mt-4 text-4xl">{t("addProject")}</h1>
      <ProjectForm categories={categories} />
    </div>
  );
}
