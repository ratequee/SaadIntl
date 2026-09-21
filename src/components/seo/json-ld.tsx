import { siteUrl } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";

export function OrganizationJsonLd({
  settings,
  locale,
}: {
  settings: SiteSettings;
  locale: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: locale === "ar" ? settings.companyName.ar : settings.companyName.en,
    url: siteUrl(`/${locale}`),
    email: settings.email,
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: locale === "ar" ? settings.address.ar : settings.address.en,
      addressLocality: locale === "ar" ? "الدوحة" : "Doha",
      addressCountry: "QA",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
