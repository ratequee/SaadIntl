import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { IconMail, IconPhone } from "@/components/ui/icons";
import { getSettings } from "@/lib/cms";
import { localized } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("pageTitle"),
    description: t("pageLead"),
    alternates: { canonical: `/${locale}/contact` },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const settings = await getSettings();

  return (
    <div className="container-site py-16 md:py-24">
      <div className="grid gap-10 rounded-[2.2rem] bg-ink px-6 py-12 text-cream lg:grid-cols-2 md:px-12 md:py-16 dark:bg-espresso">
        <div>
          <h1 className="display text-5xl md:text-7xl">{t("title")}</h1>
          <p className="mt-5 max-w-md text-lg text-cream/70">{t("lead")}</p>
          <dl className="mt-10 space-y-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-gold text-espresso">
                <IconMail />
              </span>
              <div>
                <dt className="text-sm text-cream/60">{t("email")}</dt>
                <dd><a href={`mailto:${settings.email}`}>{settings.email}</a></dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-gold text-espresso">
                <IconPhone />
              </span>
              <div>
                <dt className="text-sm text-cream/60">
                  {t("phone")} · {localized(settings.hours, locale)}
                </dt>
                <dd>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
                </dd>
              </div>
            </div>
          </dl>
          <p className="mt-8 text-sm text-cream/60">{localized(settings.address, locale)}</p>
        </div>
        <ContactForm locale={locale} />
      </div>
    </div>
  );
}
