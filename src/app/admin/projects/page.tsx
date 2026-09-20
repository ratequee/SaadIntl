import Link from "next/link";
import { deleteProjectAction } from "@/app/admin/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { getProjects } from "@/lib/cms";
import { buttonClass, goldHoverClass } from "@/components/ui/button";

const PAGE_SIZE = 8;

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const all = await getProjects({ includeDrafts: true, query: q });
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const projects = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Projects</h1>
          <p className="mt-2 text-muted">Create, publish and reorder project showcases.</p>
        </div>
        <Link href="/admin/projects/new" className={buttonClass("dark", goldHoverClass)}>
          Add project
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" action="/admin/projects">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title or location"
          className="min-w-64 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm"
        />
        <button type="submit" className={buttonClass("dark", goldHoverClass)}>
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-[1.6rem] bg-background">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 text-start font-medium">Title</th>
              <th className="px-4 py-3 text-start font-medium">Status</th>
              <th className="px-4 py-3 text-start font-medium">Visibility</th>
              <th className="px-4 py-3 text-start font-medium">Order</th>
              <th className="px-4 py-3 text-start font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-start text-muted">
                  No projects match this search.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-4 text-start align-top">
                    <p className="font-medium">{project.title.en}</p>
                    <p className="text-muted" dir="rtl">{project.title.ar}</p>
                  </td>
                  <td className="px-4 py-4 text-start align-top whitespace-nowrap">{project.status}</td>
                  <td className="px-4 py-4 text-start align-top whitespace-nowrap">
                    {project.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-4 text-start align-top whitespace-nowrap">{project.displayOrder}</td>
                  <td className="px-4 py-4 text-start align-top">
                    <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
                      <Link href={`/admin/projects/${project.id}`} className="text-gold">
                        Edit
                      </Link>
                      <Link href={`/en/projects/${project.slug}`} className="text-muted" target="_blank">
                        Preview
                      </Link>
                      <ConfirmDelete action={deleteProjectAction} id={project.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          {current > 1 ? (
            <Link
              href={`/admin/projects?q=${encodeURIComponent(q)}&page=${current - 1}`}
              className="text-gold"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {current} of {totalPages}
          </span>
          {current < totalPages ? (
            <Link
              href={`/admin/projects?q=${encodeURIComponent(q)}&page=${current + 1}`}
              className="text-gold"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
