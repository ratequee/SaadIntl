import Link from "next/link";
import { deleteDocumentAction } from "@/app/admin/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { buttonClass } from "@/components/ui/button";
import { getDocuments } from "@/lib/cms";

export default async function AdminDocumentsPage() {
  const documents = await getDocuments({ includeDrafts: true });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Documents</h1>
          <p className="mt-2 text-muted">Publish company files for tenders and due diligence.</p>
        </div>
        <Link href="/admin/documents/new" className={buttonClass("dark")}>Add document</Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-[1.6rem] bg-background">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-border last:border-0">
                <td className="px-4 py-4">
                  <p className="font-medium">{doc.title.en}</p>
                  <p className="text-muted" dir="rtl">{doc.title.ar}</p>
                </td>
                <td className="px-4 py-4">{doc.isPublished ? "Published" : "Draft"}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-3">
                    <Link href={`/admin/documents/${doc.id}`} className="text-gold">Edit</Link>
                    <a href={doc.fileUrl} className="text-muted" target="_blank" rel="noreferrer">Preview</a>
                    <ConfirmDelete action={deleteDocumentAction} id={doc.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
