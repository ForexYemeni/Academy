"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export function I18nBoot({ children }: { children: React.ReactNode }) {
  const locale = useI18n((s) => s.locale);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
