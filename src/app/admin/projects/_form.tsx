import { upsertProjectAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { FileField } from "@/components/admin/file-field";
import { GalleryField } from "@/components/admin/gallery-field";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import type { Category, Project } from "@/lib/types";

export function ProjectForm({
  project,
  categories,
}: {
  project?: Project;
  categories: Category[];
}) {
  return (
    <form action={upsertProjectAction} className="grid gap-5">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <TitleSlugFields defaultTitle={project?.title.en} defaultSlug={project?.slug} />
        <Field label="Title (Arabic)" name="title_ar" defaultValue={project?.title.ar} dir="rtl" required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Category</span>
          <select
            name="categoryId"
            defaultValue={project?.categoryId}
            className="rounded-full border border-border px-4 py-3"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.en}
              </option>
            ))}
          </select>
        </label>
        <Field label="Location (English)" name="location_en" defaultValue={project?.location.en} />
        <Field label="Location (Arabic)" name="location_ar" defaultValue={project?.location.ar} dir="rtl" />
        <Field label="Client" name="client" defaultValue={project?.client} />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Status</span>
          <select
            name="status"
            defaultValue={project?.status || "planning"}
            className="rounded-full border border-border px-4 py-3"
          >
            <option value="planning">Planning</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <Field label="Start date" name="startDate" type="date" defaultValue={project?.startDate || ""} />
        <Field label="Completion date" name="completionDate" type="date" defaultValue={project?.completionDate || ""} />
        <Field label="Progress (%)" name="progress" type="number" defaultValue={project?.progress ?? ""} />
        <Field label="Display order" name="displayOrder" type="number" defaultValue={project?.displayOrder ?? 99} />
        <Field label="Services (comma separated)" name="services" defaultValue={project?.services.join(", ")} />
        <Field label="Contract value (QAR)" name="contractValue" defaultValue={project?.contractValue} />
      </div>
      <Field label="Short description (English)" name="excerpt_en" defaultValue={project?.excerpt.en} textarea />
      <Field label="Short description (Arabic)" name="excerpt_ar" defaultValue={project?.excerpt.ar} textarea dir="rtl" />
      <Field label="Description (English)" name="description_en" defaultValue={project?.description.en} textarea />
      <Field label="Description (Arabic)" name="description_ar" defaultValue={project?.description.ar} textarea dir="rtl" />
      <Field label="Scope (English)" name="scope_en" defaultValue={project?.scope.en} />
      <Field label="Scope (Arabic)" name="scope_ar" defaultValue={project?.scope.ar} dir="rtl" />
      <FileField name="featuredImageUrl" label="Featured image" kind="images" defaultUrl={project?.featuredImageUrl} />
      <GalleryField
        defaultImages={project?.images.map((image) => ({
          url: image.url,
          caption: image.caption,
          alt: image.alt,
          isFeatured: image.isFeatured,
          displayOrder: image.displayOrder,
        }))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title (English)" name="seo_title_en" defaultValue={project?.seoTitle.en} />
        <Field label="SEO title (Arabic)" name="seo_title_ar" defaultValue={project?.seoTitle.ar} dir="rtl" />
        <Field label="SEO description (English)" name="seo_description_en" defaultValue={project?.seoDescription.en} textarea />
        <Field label="SEO description (Arabic)" name="seo_description_ar" defaultValue={project?.seoDescription.ar} textarea dir="rtl" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={project?.isPublished} /> Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={project?.isFeatured} /> Featured
      </label>
      <button type="submit" className={buttonClass("dark", goldHoverClass)}>
        Save project
      </button>
    </form>
  );
}
