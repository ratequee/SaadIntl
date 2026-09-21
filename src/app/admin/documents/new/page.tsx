import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DocumentForm } from "../_form";
import { getCategories } from "@/lib/cms";

export default async function NewDocumentPage() {
  const t = await getTranslations("admin");
  const categories = await getCategories("document");
  return (
    <div>
      <Link href="/admin/documents" className="text-sm text-gold">
        {t("backToDocuments")}
      </Link>
      <h1 className="display mb-8 mt-4 text-4xl">{t("addDocument")}</h1>
      <DocumentForm categories={categories} />
    </div>
  );
}
