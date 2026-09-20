import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/button";
import { IconArrow, IconCheck, IconHouse, IconPencil, IconSofa } from "@/components/ui/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "من نحن" : "About";
  return { title, alternates: { canonical: `/${locale}/about` } };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="container-site py-16 md:py-24">
      <p className="text-sm text-gold">{locale === "ar" ? "الشركة" : "The company"}</p>
      <h1 className="display mt-3 max-w-4xl text-5xl md:text-7xl">{t("about.title")}</h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">{t("about.lead")}</p>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Image
          src="/images/lobby.jpg"
          alt={t("about.imageAlt")}
          width={1100}
          height={720}
          className="h-[420px] w-full rounded-[2rem] object-cover"
        />
        <div className="flex flex-col justify-center">
          <p className="text-muted">{t("about.body1")}</p>
          <p className="mt-4 text-muted">{t("about.body2")}</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-[1.6rem] bg-gold p-6 text-espresso">
              <p className="display text-4xl">{t("about.statProjects")}</p>
              <p className="mt-2 text-sm">{t("about.statProjectsLabel")}</p>
            </div>
            <div className="rounded-[1.6rem] bg-ink p-6 text-cream">
              <p className="display text-4xl">{t("about.statSatisfaction")}</p>
              <p className="mt-2 text-sm">{t("about.statSatisfactionLabel")}</p>
            </div>
          </div>
        </div>
      </div>

      <section id="services" className="mt-24">
        <h2 className="display max-w-3xl text-4xl md:text-6xl">{t("services.title")}</h2>
        <p className="mt-4 max-w-xl text-muted">{t("services.lead")}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            { key: "contracting", icon: <IconHouse /> },
            { key: "designBuild", icon: <IconPencil /> },
            { key: "projectManagement", icon: <IconCheck /> },
            { key: "interiorDesign", icon: <IconSofa /> },
          ].map((service) => (
            <article
              key={service.key}
              className="about-service-card group rounded-[1.8rem] border border-border bg-background p-7"
            >
              <span className="relative z-10 grid size-11 place-items-center rounded-full bg-gold/15 text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-espresso">
                {service.icon}
              </span>
              <h3 className="relative z-10 mt-6 text-2xl font-semibold tracking-tight">
                {t(`services.${service.key}.title`)}
              </h3>
              <p className="relative z-10 mt-3 text-muted">{t(`services.${service.key}.body`)}</p>
              <Link
                href="/contact"
                className="relative z-10 mt-6 inline-flex items-center gap-2 text-gold transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              >
                {t("services.ask")} <IconArrow className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="mt-24">
        <h2 className="display text-4xl md:text-6xl">{t("process.title")}</h2>
        <p className="mt-4 text-muted">{t("process.lead")}</p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {(["1", "2", "3", "4"] as const).map((step) => (
            <li key={step} className="about-process-card group rounded-[1.8rem] bg-surface p-6">
              <span className="grid size-9 place-items-center rounded-full bg-ink text-cream transition duration-500 group-hover:scale-110 group-hover:bg-gold group-hover:text-espresso dark:bg-cream dark:text-ink dark:group-hover:bg-gold dark:group-hover:text-espresso">
                {step}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{t(`process.steps.${step}.title`)}</h3>
              <p className="mt-2 text-muted">{t(`process.steps.${step}.body`)}</p>
            </li>
          ))}
        </ol>
        <Link
          href="/contact"
          className={buttonClass(
            "dark",
            "mt-10 hover:bg-gold hover:text-espresso dark:hover:bg-gold dark:hover:text-espresso",
          )}
        >
          {t("process.cta")}
        </Link>
      </section>
    </div>
  );
}
