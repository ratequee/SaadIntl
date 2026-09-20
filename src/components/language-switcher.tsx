"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const next = locale === "en" ? "ar" : "en";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      className="grid h-9 min-w-9 place-items-center rounded-full px-2 text-xs font-semibold tracking-wide hover:bg-surface"
      aria-label={next === "ar" ? "العربية" : "English"}
    >
      {next === "ar" ? "ع" : "EN"}
    </button>
  );
}
