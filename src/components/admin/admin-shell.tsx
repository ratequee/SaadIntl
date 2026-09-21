"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { logoutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/logo";
import { AdminToast } from "@/components/admin/admin-toast";
import { AdminSwitchers } from "@/components/admin/admin-switchers";
import { IconArrowUpRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

function NavIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 shrink-0", className)} fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  dashboard: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
  projects: "M5 20V8.5L12 4l7 4.5V20M9 20v-6h6v6",
  articles: "M6 4h9l3 3v13H6zM9 10h6M9 14h6",
  documents: "M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1zM14 3.5V8h4",
  notifications: "M12 5a5 5 0 0 1 5 5c0 4 1.5 5.5 1.5 5.5H5.5S7 14 7 10a5 5 0 0 1 5-5zM10 19a2 2 0 0 0 4 0",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4.8 12l1.7-1 .5-1.8-1.4-1.6 1.5-1.5 1.6 1.4 1.8-.5 1-1.7h2.2l1 1.7 1.8.5 1.6-1.4 1.5 1.5-1.4 1.6.5 1.8 1.7 1v2.2l-1.7 1-.5 1.8 1.4 1.6-1.5 1.5-1.6-1.4-1.8.5-1 1.7h-2.2l-1-1.7-1.8-.5-1.6 1.4-1.5-1.5 1.4-1.6-.5-1.8-1.7-1z",
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  email,
  expiryCount = 0,
  companyName,
}: {
  children: React.ReactNode;
  email: string;
  expiryCount?: number;
  companyName?: string;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("admin");
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/admin", label: t("dashboard"), icon: ICONS.dashboard },
    { href: "/admin/projects", label: t("projects"), icon: ICONS.projects },
    { href: "/admin/articles", label: t("articles"), icon: ICONS.articles },
    { href: "/admin/documents", label: t("documents"), icon: ICONS.documents },
    {
      href: "/admin/notifications",
      label: t("notifications"),
      icon: ICONS.notifications,
      badge: expiryCount,
    },
    { href: "/admin/settings", label: t("settings"), icon: ICONS.settings },
  ];
  const initial = (email.split("@")[0]?.[0] || "S").toUpperCase();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-surface">
      <Suspense fallback={null}>
        <AdminToast />
      </Suspense>
      <aside className="fixed inset-y-0 start-0 z-20 hidden w-72 flex-col bg-ink text-cream lg:flex">
        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        <span className="pointer-events-none absolute inset-y-10 end-0 w-px bg-gradient-to-b from-gold/0 via-gold/40 to-gold/0" />

        <div className="px-6 pb-6 pt-7">
          <Logo name={companyName} className="[&_span]:text-cream [&_.text-muted]:text-cream/55" />
          <p className="mt-5 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold">
            {t("studio")}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4">
          <div className="grid gap-1">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-gold text-espresso"
                      : "text-cream/70 hover:bg-white/5 hover:text-cream",
                  )}
                >
                  <NavIcon d={link.icon} />
                  <span className="flex-1 tracking-tight">{link.label}</span>
                  {link.badge ? (
                    <span
                      className={cn(
                        "grid min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-semibold",
                        active ? "bg-espresso text-gold" : "bg-gold text-espresso",
                      )}
                    >
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 border-t border-cream/10 pt-5">
            <p className="mb-2 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream/35">
              {t("public")}
            </p>
            <a
              href={`/${locale}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm text-cream/70 transition-colors hover:bg-white/5 hover:text-gold"
            >
              <IconArrowUpRight className="size-4" />
              <span className="flex-1 tracking-tight">{t("website")}</span>
            </a>
          </div>
        </nav>

        <div className="mt-auto border-t border-cream/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-sm font-semibold text-espresso">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-cream">{email}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-gold/80">{t("administrator")}</p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/70 transition-colors hover:border-gold hover:bg-gold hover:text-espresso"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:ps-72">
        <header className="sticky top-0 z-30 hidden items-center justify-end gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:flex lg:px-10">
          <AdminSwitchers />
        </header>
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-ink px-4 py-3 text-cream lg:hidden">
          <Logo compact className="[&_img]:ring-1 [&_img]:ring-gold/40" />
          <div className="flex items-center gap-1">
            <AdminSwitchers tone="ink" />
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full hover:bg-white/10"
              aria-expanded={open}
              aria-label={open ? t("closeMenu") : t("openMenu")}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="flex w-4 flex-col gap-1.5">
                <span className={cn("h-px bg-cream transition", open && "translate-y-1 rotate-45")} />
                <span className={cn("h-px bg-cream transition", open && "-translate-y-1 -rotate-45")} />
              </span>
            </button>
          </div>
        </header>

        <div
          className={cn(
            "fixed inset-0 z-40 flex flex-col bg-ink text-cream transition-transform duration-300 ease-out lg:hidden",
            open ? "pointer-events-auto translate-y-0" : "pointer-events-none -translate-y-full",
          )}
          aria-hidden={!open}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <Logo name={companyName} className="[&_span]:text-cream [&_.text-muted]:text-cream/55" />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-white/10"
              aria-label={t("closeMenu")}
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-2" aria-label="Admin">
            <p className="mb-3 px-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold">
              {t("studio")}
            </p>
            <div className="grid gap-1">
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl px-4 py-4 text-2xl font-semibold tracking-tight",
                      active ? "bg-gold text-espresso" : "text-cream hover:bg-white/5",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <NavIcon d={link.icon} className="size-5" />
                    <span className="flex-1">{link.label}</span>
                    {link.badge ? (
                      <span
                        className={cn(
                          "grid min-w-6 place-items-center rounded-full px-2 text-sm font-semibold",
                          active ? "bg-espresso text-gold" : "bg-gold text-espresso",
                        )}
                      >
                        {link.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
            <a
              href={`/${locale}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center gap-4 rounded-2xl px-4 py-4 text-xl tracking-tight text-cream/80 hover:bg-white/5 hover:text-gold"
              onClick={() => setOpen(false)}
            >
              <IconArrowUpRight className="size-5" />
              {t("website")}
            </a>
          </nav>

          <div className="border-t border-cream/10 px-5 py-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-sm font-semibold text-espresso">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-cream">{email}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-gold/80">{t("administrator")}</p>
              </div>
            </div>
            <form action={logoutAction} className="mt-3">
              <button
                type="submit"
                className="w-full rounded-full border border-cream/15 px-4 py-3 text-sm text-cream/70 hover:border-gold hover:bg-gold hover:text-espresso"
              >
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>

        <div className="px-4 py-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
