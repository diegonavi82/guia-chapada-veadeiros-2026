import { useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SiteLocale } from "./types";
import { SiteLocaleContext } from "./siteLocale";

const htmlLang: Record<SiteLocale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

export function LocaleLayout({ locale }: { locale: SiteLocale }) {
  const { i18n } = useTranslation();
  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  useEffect(() => {
    document.documentElement.lang = htmlLang[locale];
  }, [locale]);

  const value = useMemo(() => locale, [locale]);

  return (
    <SiteLocaleContext.Provider value={value}>
      <Outlet />
    </SiteLocaleContext.Provider>
  );
}
