import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/button";
import { IconArrow, IconArrowUpRight, IconCheck, IconDownload, IconHouse, IconMail, IconPencil, IconPhone, IconSofa } from "@/components/ui/icons";
import { ContactForm } from "@/components/contact/contact-form";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { HeroProgress } from "@/components/home/hero-progress";
import { Testimonials } from "@/components/home/testimonials";
import { localized } from "@/lib/utils";
import { TICKER_KEYS } from "@/lib/data/seed";
import type { Article, Category, DocumentItem, Project, SiteSettings, Testimonial } from "@/lib/types";

function categoryName(categories: Category[], id: string, locale: string) {
  const match = categories.find((item) => item.id === id);
  return match ? localized(match.name, locale) : "";
}

export async function HomePage({
  locale,
  settings,
  projects,
  ongoing,
  articles,
  documents,
  testimonials,
  categories,
}: {
  locale: string;
  settings: SiteSettings;
  projects: Project[];
  ongoing: Project[];
  articles: Article[];
  documents: DocumentItem[];
  testimonials: Testimonial[];
  categories: Category[];
}) {
  const t = await getTranslations();

  return (
    <>
      <section className="container-wide pt-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink md:rounded-[2.5rem]">
          <Image
            src="/images/hero.jpg"
            alt={t("about.imageAlt")}
            width={2200}
            height={2940}
            quality={90}
            sizes="(min-width: 1441px) 80vw, 100vw"
            priority
            className="h-[78vw] max-h-[760px] min-h-[540px] w-full object-cover object-[center_28%] md:h-[720px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_340px]">
              <div className="max-w-3xl text-white">
                <h1 className="display text-5xl md:text-7xl">{localized(settings.tagline, locale)}</h1>
                <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">{localized(settings.about, locale)}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className={buttonClass(
                      "gold",
                      "bg-[var(--gold)] text-ink hover:bg-cream hover:text-ink",
                    )}
                  >
                    {t("hero.ctaPrimary")} <IconArrow className="size-4" />
                  </Link>
                  <Link
                    href="/projects"
                    className={buttonClass(
                      "secondary",
                      "bg-white text-ink hover:bg-cream hover:text-ink dark:hover:bg-black dark:hover:text-white",
                    )}
                  >
                    {t("hero.ctaSecondary")}
                  </Link>
                </div>
              </div>
              {ongoing.length > 0 ? (
                <HeroProgress
                  title={t("hero.ongoing")}
                  items={ongoing.slice(0, 3).map((project) => ({
                    id: project.id,
                    title: localized(project.title, locale),
                    location: localized(project.location, locale).split(",")[0],
                    progress: project.progress ?? 0,
                  }))}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 bg-gold py-4 text-espresso">
        <div className="marquee">
          <div className="marquee-track text-sm font-semibold tracking-wide">
            {[...TICKER_KEYS, ...TICKER_KEYS].map((key, index) => (
              <span key={`${key}-${index}`} className="inline-flex items-center gap-3">
                {t(`ticker.${key}`)}
                <span className="size-1.5 rounded-full bg-espresso/40" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="container-site grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <h2 className="display text-4xl md:text-6xl">{t("about.title")}</h2>
          <p className="mt-6 max-w-xl text-lg text-muted">{t("about.lead")}</p>
          <p className="mt-5 max-w-xl text-muted">{t("about.body1")}</p>
          <p className="mt-4 max-w-xl text-muted">{t("about.body2")}</p>
          <Link
            href="/about#services"
            className={buttonClass(
              "dark",
              "mt-8 bg-ink px-7 py-3.5 text-base text-white hover:bg-ink-2 dark:bg-white dark:text-ink dark:hover:bg-cream",
            )}
          >
            {t("about.cta")} <IconArrow className="size-5" />
          </Link>
        </div>
        <div className="relative">
          <Image
            src="/images/lobby.jpg"
            alt={t("about.imageAlt")}
            width={900}
            height={640}
            className="h-[380px] w-full rounded-[2rem] object-cover md:h-[460px]"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[1.6rem] bg-gold px-5 py-6 text-espresso">
              <p className="display text-4xl">{t("about.statProjects")}</p>
              <p className="mt-2 text-sm">{t("about.statProjectsLabel")}</p>
            </div>
            <div className="rounded-[1.6rem] bg-ink px-5 py-6 text-cream dark:bg-espresso">
              <p className="display text-4xl">{t("about.statSatisfaction")}</p>
              <p className="mt-2 text-sm text-cream/80">{t("about.statSatisfactionLabel")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="container-wide">
        <div className="rounded-[2.2rem] bg-ink px-6 py-14 text-white md:px-12 md:py-16 dark:bg-espresso dark:ring-1 dark:ring-cream/20">
          <div className="mb-10 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
            <h2 className="display text-4xl text-white md:text-6xl">{t("services.title")}</h2>
            <p className="text-white">{t("services.lead")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { key: "contracting", icon: <IconHouse /> },
              { key: "designBuild", icon: <IconPencil /> },
              { key: "projectManagement", icon: <IconCheck /> },
              { key: "interiorDesign", icon: <IconSofa /> },
            ].map((service) => (
              <article key={service.key} className="group relative overflow-hidden rounded-[1.6rem] bg-cream p-6 text-ink">
                <span className="service-card-fill" aria-hidden />
                <span className="relative z-10 grid size-11 place-items-center rounded-md text-white transition-colors duration-500 group-hover:bg-white group-hover:text-ink">
                  {service.icon}
                </span>
                <h3 className="relative z-10 mt-8 text-xl font-semibold tracking-tight transition-colors duration-500 group-hover:text-white">
                  {t(`services.${service.key}.title`)}
                </h3>
                <p className="relative z-10 mt-3 text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-white">
                  {t(`services.${service.key}.body`)}
                </p>
                <Link
                  href="/contact"
                  className="relative z-10 mt-6 inline-flex items-center gap-2 text-sm text-gold transition-colors duration-500 group-hover:text-white"
                >
                  {t("services.ask")} <IconArrow className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProjects
        title={t("projects.title")}
        projects={projects}
        categories={categories}
        locale={locale}
      />

      <section id="process" className="container-site grid items-center gap-10 pb-20 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2rem]">
          <Image
            src="/images/engineers.jpg"
            alt={t("process.imageAlt")}
            width={900}
            height={700}
            className="h-[420px] w-full object-cover md:h-[520px]"
          />
          <Link
            href="/contact"
            className="absolute end-6 top-6 grid size-28 place-items-center rounded-full bg-gold text-center text-sm font-semibold text-espresso"
          >
            {t("process.cta")}
          </Link>
        </div>
        <div>
          <h2 className="display text-4xl md:text-6xl">{t("process.title")}</h2>
          <p className="mt-4 text-muted">{t("process.lead")}</p>
          <ol className="mt-10 space-y-6">
            {(["1", "2", "3", "4"] as const).map((step) => (
              <li key={step} className="flex gap-4 border-b border-border pb-6 last:border-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm text-cream dark:bg-cream dark:text-ink">
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight">{t(`process.steps.${step}.title`)}</h3>
                  <p className="mt-1 text-sm text-muted">{t(`process.steps.${step}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <Testimonials
          title={t("testimonials.title")}
          imageAlt={t("testimonials.imageAlt")}
          customers={t("testimonials.customers")}
          testimonials={testimonials}
          locale={locale}
        />
      ) : null}

      <section className="container-site grid gap-8 pb-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="display mb-8 text-4xl md:text-5xl">{t("articles.homeTitle")}</h2>
          <ul>
            {articles.slice(0, 3).map((article) => (
              <li key={article.id} className="border-t border-border py-5 first:border-t-0">
                <Link href={`/articles/${article.slug}`} className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{localized(article.title, locale)}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {categoryName(categories, article.categoryId, locale)} · {t("articles.minRead", { minutes: article.readingTimeMinutes })}
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border">
                    <IconArrowUpRight className="size-4 rtl:-scale-x-100" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <aside className="rounded-[2.4rem] bg-[color-mix(in_srgb,var(--gold)_28%,white)] p-7 text-ink">
          <h2 className="text-3xl font-semibold tracking-tight">{t("documents.title")}</h2>
          <p className="mt-2 text-sm text-ink/70">{t("documents.lead")}</p>
          <ul className="mt-6 space-y-3">
            {documents.slice(0, 3).map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.slug}`}
                  className="flex items-start justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--gold)_16%,white)]"
                >
                  <span className="inline-flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 shrink-0 rounded-md bg-ink px-2 py-1 text-[0.65rem] font-semibold text-white">
                      {t("documents.pdf")}
                    </span>
                    <span className="min-w-0 whitespace-normal break-words">
                      {localized(doc.title, locale)}
                    </span>
                  </span>
                  <span className="mt-0.5 shrink-0">
                    <IconDownload />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="container-wide pb-20">
        <div className="grid gap-10 rounded-[2.2rem] bg-ink px-6 py-12 text-white lg:grid-cols-2 md:px-12 md:py-16 dark:bg-espresso dark:ring-1 dark:ring-cream/20">
          <div>
            <h2 className="display text-4xl text-white md:text-6xl">{t("contact.title")}</h2>
            <p className="mt-4 max-w-md text-white">{t("contact.lead")}</p>
            <dl className="mt-10 space-y-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-gold text-espresso">
                  <IconMail />
                </span>
                <div>
                  <dt className="text-sm text-white">{t("contact.email")}</dt>
                  <dd>
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-gold text-espresso">
                  <IconPhone />
                </span>
                <div>
                  <dt className="text-sm text-white">
                    {t("contact.phone")} · {localized(settings.hours, locale)}
                  </dt>
                  <dd>
                    <a href={`tel:${settings.phone.replace(/\s/g, "")}`} dir="ltr" className="inline-block">
                      {settings.phone}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
            <p className="mt-8 text-sm text-white/70">{localized(settings.address, locale)}</p>
          </div>
          <ContactForm locale={locale} replyEmail={settings.email} />
        </div>
      </section>
    </>
  );
}
