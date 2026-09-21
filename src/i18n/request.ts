import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing, type AppLocale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    const cookieLocale = (await cookies()).get("SIP_LOCALE")?.value;
    locale =
      cookieLocale && routing.locales.includes(cookieLocale as AppLocale)
        ? cookieLocale
        : routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
