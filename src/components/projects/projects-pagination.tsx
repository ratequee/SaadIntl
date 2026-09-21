import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function hrefFor(
  page: number,
  query: { category?: string; status?: string; q?: string },
  basePath: string,
) {
  const search = new URLSearchParams();
  if (query.category && query.category !== "all") search.set("category", query.category);
  if (query.status && query.status !== "all") search.set("status", query.status);
  if (query.q) search.set("q", query.q);
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function visiblePages(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}

export async function ProjectsPagination({
  current,
  totalPages,
  query,
  basePath = "/projects",
  namespace = "projects",
}: {
  current: number;
  totalPages: number;
  query: { category?: string; status?: string; q?: string };
  basePath?: string;
  namespace?: string;
}) {
  if (totalPages <= 1) return null;
  const t = await getTranslations(namespace);
  const pages = visiblePages(current, totalPages);

  return (
    <nav className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between" aria-label={t("pageOf", { current, total: totalPages })}>
      <p className="text-sm text-muted">{t("pageOf", { current, total: totalPages })}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {current > 1 ? (
          <Link
            href={hrefFor(current - 1, query, basePath)}
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-surface"
          >
            {t("previous")}
          </Link>
        ) : null}
        {pages.map((page, index) => {
          const previous = pages[index - 1];
          return (
            <span key={page} className="contents">
              {previous && page - previous > 1 ? (
                <span className="px-1 text-muted" aria-hidden>
                  …
                </span>
              ) : null}
              <Link
                href={hrefFor(page, query, basePath)}
                className={cn(
                  "grid size-10 place-items-center rounded-full text-sm",
                  page === current
                    ? "bg-ink text-cream dark:bg-cream dark:text-ink"
                    : "hover:bg-surface",
                )}
                aria-current={page === current ? "page" : undefined}
              >
                {page}
              </Link>
            </span>
          );
        })}
        {current < totalPages ? (
          <Link
            href={hrefFor(current + 1, query, basePath)}
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-surface"
          >
            {t("next")}
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
