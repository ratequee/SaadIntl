import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import type { SiteSettings } from "@/lib/types";

export async function Footer({
  settings,
  locale,
}: {
  settings: SiteSettings;
  locale: string;
}) {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();
  const name = locale === "ar" ? settings.companyName.ar : settings.companyName.en;

  return (
    <footer className="container-wide py-16">
      <div className="flex flex-col gap-12 border-t border-border pt-16 lg:flex-row lg:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t("blurb")}</p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-16">
          <div>
            <p className="mb-3 text-sm font-semibold">{t("company")}</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/about" className="hover:text-foreground">{locale === "ar" ? "من نحن" : "About"}</Link></li>
              <li><Link href="/projects" className="hover:text-foreground">{locale === "ar" ? "المشاريع" : "Projects"}</Link></li>
              <li><Link href="/#process" className="hover:text-foreground">{t("howWeWork")}</Link></li>
              <li><Link href="/documents" className="hover:text-foreground">{locale === "ar" ? "الوثائق" : "Documents"}</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">{t("services")}</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/about#services" className="hover:text-foreground">{locale === "ar" ? "المقاولات العامة" : "General contracting"}</Link></li>
              <li><Link href="/about#services" className="hover:text-foreground">{locale === "ar" ? "التصميم والتنفيذ" : "Design & build"}</Link></li>
              <li><Link href="/about#services" className="hover:text-foreground">{locale === "ar" ? "إدارة المشاريع" : "Project management"}</Link></li>
              <li><Link href="/about#services" className="hover:text-foreground">{locale === "ar" ? "التصميم الداخلي" : "Interior design"}</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">{t("getInTouch")}</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href={`mailto:${settings.email}`} className="hover:text-foreground">{settings.email}</a></li>
              <li><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-foreground">{settings.phone}</a></li>
              <li>{locale === "ar" ? settings.hours.ar : settings.hours.en}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:justify-between">
        <p>{t("rights", { year })}</p>
        <p>{locale === "ar" ? settings.address.ar : settings.address.en}</p>
        <span className="sr-only">{name}</span>
      </div>
    </footer>
  );
}
