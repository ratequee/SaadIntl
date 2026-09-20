import Link from "next/link";
import { getDashboardStats } from "@/lib/cms";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const cards = [
    { label: "Total projects", value: stats.projects },
    { label: "Published projects", value: stats.publishedProjects },
    { label: "Draft projects", value: stats.draftProjects },
    { label: "Total articles", value: stats.articles },
    { label: "Published articles", value: stats.publishedArticles },
    { label: "Total documents", value: stats.documents },
  ];

  return (
    <div>
      <h1 className="display text-4xl">Dashboard</h1>
      <p className="mt-2 text-muted">Overview of published and draft content.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[1.6rem] bg-background p-6">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-3 display text-4xl">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-[1.6rem] bg-background p-6">
          <h2 className="font-semibold">Recent projects</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {stats.recentProjects.map((project) => (
              <li key={project.id} className="flex justify-between gap-3">
                <Link href={`/admin/projects/${project.id}`} className="hover:text-gold">
                  {project.title.en}
                </Link>
                <span className="text-muted">{project.isPublished ? "Published" : "Draft"}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[1.6rem] bg-background p-6">
          <h2 className="font-semibold">Recent articles</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {stats.recentArticles.map((article) => (
              <li key={article.id} className="flex justify-between gap-3">
                <Link href={`/admin/articles/${article.id}`} className="hover:text-gold">
                  {article.title.en}
                </Link>
                <span className="text-muted">{article.isPublished ? "Published" : "Draft"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
