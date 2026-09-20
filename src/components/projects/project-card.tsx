import { Link } from "@/i18n/navigation";
import { IconArrowUpRight } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/media-image";
import { localized } from "@/lib/utils";
import type { Category, Project } from "@/lib/types";

export function ProjectCard({
  project,
  locale,
  category,
}: {
  project: Project;
  locale: string;
  category?: Category;
}) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <article>
        <div className="relative overflow-hidden rounded-[1.8rem]">
          <MediaImage
            src={project.featuredImageUrl}
            alt={localized(project.title, locale)}
            width={800}
            height={560}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute end-4 bottom-4 grid size-10 place-items-center rounded-full bg-white text-ink">
            <IconArrowUpRight className="size-4 rtl:-scale-x-100" />
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{localized(project.title, locale)}</h2>
            <p className="text-sm text-muted">
              {category ? localized(category.name, locale) : ""}
            </p>
          </div>
          <p className="text-sm text-muted">{localized(project.location, locale)}</p>
        </div>
      </article>
    </Link>
  );
}
