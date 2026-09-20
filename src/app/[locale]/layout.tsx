import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LocaleAttributes } from "@/components/locale-attributes";
import { getSettings } from "@/lib/cms";
import { localized } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "ar")) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const settings = await getSettings();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleAttributes locale={locale} />
      <Header hours={localized(settings.hours, locale)} />
      <main>{children}</main>
      <Footer settings={settings} locale={locale} />
    </NextIntlClientProvider>
  );
}
