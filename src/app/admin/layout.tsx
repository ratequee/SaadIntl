import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getAdminSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSwitchers } from "@/components/admin/admin-switchers";
import { LocaleAttributes } from "@/components/locale-attributes";
import { getExpiringDocuments, getSettings } from "@/lib/cms";
import { localized } from "@/lib/utils";

async function adminMessages(locale: "en" | "ar") {
  return (await import(`../../../messages/${locale}.json`)).default;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = (await cookies()).get("SIP_LOCALE")?.value === "ar" ? "ar" : "en";
  setRequestLocale(locale);
  const [messages, session, settings] = await Promise.all([
    adminMessages(locale),
    getAdminSession(),
    getSettings(),
  ]);
  const companyName = localized(settings.companyName, locale);

  const content = session ? (
    <AdminShell
      email={session.email}
      expiryCount={(await getExpiringDocuments()).length}
      companyName={companyName}
    >
      {children}
    </AdminShell>
  ) : (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center justify-end px-4 py-3">
        <AdminSwitchers />
      </header>
      {children}
    </div>
  );

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleAttributes locale={locale} />
      <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
        {content}
      </div>
    </NextIntlClientProvider>
  );
}
