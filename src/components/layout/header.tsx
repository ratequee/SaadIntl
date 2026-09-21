"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/about#services", key: "services" },
  { href: "/articles", key: "articles" },
  { href: "/documents", key: "documents" },
  { href: "/contact", key: "contact" },
] as const;

export function Header({ hours, companyName }: { hours: string; companyName: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, scrolled / max)) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 md:px-5 md:pt-4">
      <div className="pointer-events-auto relative mx-auto flex max-w-[1280px] items-center justify-between gap-3 overflow-hidden rounded-full border border-border bg-[var(--header)] px-3 py-2 shadow-[var(--shadow)] backdrop-blur-md md:px-4">
        <Link href="/" className="min-w-0 shrink" onClick={() => setOpen(false)}>
          <Logo name={companyName} />
        </Link>

        <nav className="hidden items-center gap-0 lg:flex xl:gap-1" aria-label="Primary">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "rounded-full px-2 py-1.5 text-[13px] text-muted hover:text-foreground xl:px-3 xl:text-sm",
                  active && "bg-cream text-ink hover:bg-cream hover:text-ink dark:text-black",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <p className="hidden text-xs text-muted xl:block">{hours}</p>
          <div className="hidden items-center gap-1 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/contact"
              className={cn(
                buttonClass("gold"),
                "shrink-0 whitespace-nowrap bg-[var(--gold)] px-3.5 py-1.5 text-xs text-ink hover:bg-cream hover:text-ink dark:hover:bg-cream dark:hover:text-ink",
              )}
            >
              {t("startProject")}
            </Link>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full hover:bg-surface lg:hidden"
            aria-expanded={open}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
            <span className="flex w-4 flex-col gap-1.5">
              <span className={cn("h-px bg-foreground transition", open && "translate-y-1 rotate-45")} />
              <span className={cn("h-px bg-foreground transition", open && "-translate-y-1 -rotate-45")} />
            </span>
          </button>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left bg-[var(--gold)]"
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-background transition-transform duration-300 ease-out lg:hidden",
          open ? "pointer-events-auto translate-y-0" : "pointer-events-none -translate-y-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="min-w-0" onClick={() => setOpen(false)}>
            <Logo name={companyName} />
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-surface"
            aria-label={t("closeMenu")}
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
          <div className="grid gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={cn(
                    "rounded-2xl px-4 py-4 text-2xl font-semibold tracking-tight",
                    active ? "bg-cream text-ink dark:text-black" : "hover:bg-surface",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border px-5 py-5">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="text-sm text-muted">{t("language")}</span>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="text-sm text-muted">{t("theme")}</span>
              <ThemeToggle />
            </div>
          </div>
          <Link
            href="/contact"
            className={cn(
              buttonClass("gold"),
              "w-full bg-[var(--gold)] py-3.5 text-base text-ink hover:bg-cream hover:text-ink",
            )}
            onClick={() => setOpen(false)}
          >
            {t("startProject")}
          </Link>
        </div>
      </div>
    </header>
  );
}
