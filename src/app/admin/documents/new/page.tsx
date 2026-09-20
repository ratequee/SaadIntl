import { DocumentForm } from "../_form";
import { getCategories } from "@/lib/cms";

export default async function NewDocumentPage() {
  const categories = await getCategories("document");
  return (
    <div>
      <h1 className="display mb-8 text-4xl">Add document</h1>
      <DocumentForm categories={categories} />
    </div>
  );
}
