"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 start-0 z-20 hidden w-64 border-e border-border bg-background p-5 md:block">
        <Logo />
        <p className="mt-6 text-xs uppercase tracking-wide text-muted">Admin</p>
        <nav className="mt-3 grid gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2.5 text-sm",
                pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
                  ? "bg-ink text-cream dark:bg-cream dark:text-ink"
                  : "hover:bg-surface",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="absolute inset-x-5 bottom-5">
          <p className="mb-2 truncate text-xs text-muted">{email}</p>
          <button type="submit" className="w-full rounded-full border border-border px-4 py-2 text-sm">
            Sign out
          </button>
        </form>
      </aside>
      <div className="md:ps-64">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 md:hidden">
          <Logo compact />
          <nav className="flex gap-2 overflow-x-auto text-sm">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full px-3 py-1 hover:bg-surface">
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="px-4 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}
