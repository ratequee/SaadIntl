import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { getDashboardStats } from "@/lib/cms";
import { localized } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const locale = (await cookies()).get("SIP_LOCALE")?.value === "ar" ? "ar" : "en";
  const t = await getTranslations({ locale, namespace: "admin" });
  const stats = await getDashboardStats();
  const cards = [
    { label: t("totalProjects"), value: stats.projects },
    { label: t("publishedProjects"), value: stats.publishedProjects },
    { label: t("draftProjects"), value: stats.draftProjects },
    { label: t("totalArticles"), value: stats.articles },
    { label: t("publishedArticles"), value: stats.publishedArticles },
    { label: t("totalDocuments"), value: stats.documents },
  ];

  return (
    <div>
      <h1 className="display text-4xl">{t("dashboard")}</h1>
      <p className="mt-2 text-muted">{t("overview")}</p>
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
          <h2 className="font-semibold">{t("recentProjects")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {stats.recentProjects.length === 0 ? (
              <li className="text-muted">{t("empty")}</li>
            ) : (
              stats.recentProjects.map((project) => (
                <li key={project.id} className="flex justify-between gap-3">
                  <Link href={`/admin/projects/${project.id}`} className="hover:text-gold">
                    {localized(project.title, locale)}
                  </Link>
                  <span className="text-muted">{project.isPublished ? t("published") : t("draft")}</span>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-[1.6rem] bg-background p-6">
          <h2 className="font-semibold">{t("recentArticles")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {stats.recentArticles.length === 0 ? (
              <li className="text-muted">{t("empty")}</li>
            ) : (
              stats.recentArticles.map((article) => (
                <li key={article.id} className="flex justify-between gap-3">
                  <Link href={`/admin/articles/${article.id}`} className="hover:text-gold">
                    {localized(article.title, locale)}
                  </Link>
                  <span className="text-muted">{article.isPublished ? t("published") : t("draft")}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
