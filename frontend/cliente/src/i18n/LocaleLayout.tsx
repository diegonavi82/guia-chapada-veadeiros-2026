import { useEffect, useLayoutEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setActiveSiteLocaleForApi } from "./activeSiteLocaleForApi";
import type { SiteLocale } from "./types";
import { SiteLocaleContext } from "./siteLocale";

const htmlLang: Record<SiteLocale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

export function LocaleLayout({ locale }: { locale: SiteLocale }) {
  setActiveSiteLocaleForApi(locale);

  const { i18n } = useTranslation();
  /** Altera texto i18next antes dos efeitos dos filhos (evita navbar PT num frame). */
  useLayoutEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
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
