"use client";

import { useLayoutEffect } from "react";

export function LocaleAttributes({ locale }: { locale: string }) {
  const dir = locale === "ar" ? "rtl" : "ltr";

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [dir, locale]);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(locale)};document.documentElement.dir=${JSON.stringify(dir)};`,
      }}
    />
  );
}
