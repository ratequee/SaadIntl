import { getAdminSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return <div className="min-h-screen bg-surface">{children}</div>;
  }

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
