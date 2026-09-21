export const ADMIN_NOTICES = {
  "signed-in": "Signed in to the dashboard.",
  "project-saved": "Project saved successfully.",
  "project-updated": "Project updated successfully.",
  "project-deleted": "Project deleted permanently.",
  "article-saved": "Article saved successfully.",
  "article-updated": "Article updated successfully.",
  "article-deleted": "Article deleted permanently.",
  "document-saved": "Document saved successfully.",
  "document-updated": "Document updated successfully.",
  "document-deleted": "Document deleted permanently.",
  "settings-saved": "Settings saved successfully.",
} as const;

export type AdminNotice = keyof typeof ADMIN_NOTICES;

export function isAdminNotice(value: string | null): value is AdminNotice {
  return Boolean(value && value in ADMIN_NOTICES);
}

export function noticePath(path: string, notice: AdminNotice) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("notice", notice);
  return `${url.pathname}?${url.searchParams.toString()}`;
}
