import Link from "next/link";
import { ProjectForm } from "../_form";
import { getCategories } from "@/lib/cms";

export default async function NewProjectPage() {
  const categories = await getCategories("project");
  return (
    <div>
      <Link href="/admin/projects" className="text-sm text-gold">
        ← Back to projects
      </Link>
      <h1 className="display mb-8 mt-4 text-4xl">Add project</h1>
      <ProjectForm categories={categories} />
    </div>
  );
}
