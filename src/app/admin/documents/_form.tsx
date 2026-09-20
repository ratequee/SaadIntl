import { upsertDocumentAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { FileField } from "@/components/admin/file-field";
import { buttonClass } from "@/components/ui/button";
import type { Category, DocumentItem } from "@/lib/types";

export function DocumentForm({
  document,
  categories,
}: {
  document?: DocumentItem;
  categories: Category[];
}) {
  return (
    <form action={upsertDocumentAction} className="grid gap-5">
      {document ? <input type="hidden" name="id" value={document.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title (English)" name="title_en" defaultValue={document?.title.en} required />
        <Field label="Title (Arabic)" name="title_ar" defaultValue={document?.title.ar} dir="rtl" required />
        <Field label="Slug" name="slug" defaultValue={document?.slug} required />
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Category</span>
          <select name="categoryId" defaultValue={document?.categoryId} className="rounded-full border border-border px-4 py-3">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.en}
              </option>
            ))}
          </select>
        </label>
        <Field label="Display order" name="displayOrder" type="number" defaultValue={document?.displayOrder ?? 99} />
      </div>
      <Field label="Description (English)" name="description_en" defaultValue={document?.description.en} textarea />
      <Field label="Description (Arabic)" name="description_ar" defaultValue={document?.description.ar} textarea dir="rtl" />
      <FileField
        name="fileUrl"
        label="Document file"
        kind="documents"
        defaultUrl={document?.fileUrl}
        extra={{
          fileName: document?.fileName || "",
          fileType: document?.fileType || "",
          fileSize: String(document?.fileSize || 0),
        }}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={document?.isPublished} /> Published
      </label>
      <button type="submit" className={buttonClass("dark")}>Save document</button>
    </form>
  );
}
