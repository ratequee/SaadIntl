import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getExpiringDocuments } from "@/lib/cms";
import { formatDate, localized } from "@/lib/utils";

export default async function AdminNotificationsPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const notices = await getExpiringDocuments();
  const expired = notices.filter((item) => item.expiry.status === "expired");
  const soon = notices.filter((item) => item.expiry.status === "soon");

  return (
    <div>
      <h1 className="display text-4xl">{t("notifications")}</h1>
      <p className="mt-2 text-muted">{t("notificationsLead")}</p>

      <section className="mt-8 rounded-[1.6rem] bg-background p-6">
        <h2 className="font-semibold">{t("expiredSection")}</h2>
        {expired.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("noExpired")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {expired.map(({ document, expiry }) => (
              <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{localized(document.title, locale)}</p>
                  <p className="text-sm text-red-700">
                    {Math.abs(expiry.days) === 1
                      ? t("expiredAgoOne", { days: 1 })
                      : t("expiredAgo", { days: Math.abs(expiry.days) })}
                    {document.expiresAt ? ` · ${formatDate(document.expiresAt, locale)}` : ""}
                  </p>
                </div>
                <Link href={`/admin/documents/${document.id}`} className="text-sm text-gold">
                  {t("edit")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-[1.6rem] bg-background p-6">
        <h2 className="font-semibold">{t("expiringSoon")}</h2>
        {soon.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("noExpiring")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {soon.map(({ document, expiry }) => (
              <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{localized(document.title, locale)}</p>
                  <p className="text-sm text-muted">
                    {expiry.days === 0
                      ? t("expiresToday")
                      : expiry.days === 1
                        ? t("expiresInOne", { days: 1 })
                        : t("expiresIn", { days: expiry.days })}
                    {document.expiresAt ? ` · ${formatDate(document.expiresAt, locale)}` : ""}
                  </p>
                </div>
                <Link href={`/admin/documents/${document.id}`} className="text-sm text-gold">
                  {t("edit")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
