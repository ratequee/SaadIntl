import { notFound } from "next/navigation";
import { DocumentForm } from "../_form";
import { getCategories, getDocumentById } from "@/lib/cms";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [document, categories] = await Promise.all([getDocumentById(id), getCategories("document")]);
  if (!document) notFound();
  return (
    <div>
      <h1 className="display mb-8 text-4xl">Edit document</h1>
      <DocumentForm document={document} categories={categories} />
    </div>
  );
}
