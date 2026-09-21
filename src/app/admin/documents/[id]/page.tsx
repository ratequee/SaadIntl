import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DocumentForm } from "../_form";
import { getCategories, getDocumentById } from "@/lib/cms";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("admin");
  const { id } = await params;
  const [document, categories] = await Promise.all([getDocumentById(id), getCategories("document")]);
  if (!document) notFound();
  return (
    <div>
      <Link href="/admin/documents" className="text-sm text-gold">
        {t("backToDocuments")}
      </Link>
      <h1 className="display mb-8 mt-4 text-4xl">{t("editDocument")}</h1>
      <DocumentForm document={document} categories={categories} />
    </div>
  );
}
