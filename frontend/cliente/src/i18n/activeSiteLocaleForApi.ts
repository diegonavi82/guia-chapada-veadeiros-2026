import type { SiteLocale } from "./types";

/**
 * Locale da rota vigente durante o render (definido no `LocaleLayout`).
 * Importante: `i18n.changeLanguage` em `useEffect` corre tarde para pedidos HTTP feitos nos efeitos
 * das páginas filhas — a API antes lia `i18n.language` = `pt`.
 */
let activeSiteLocaleForApi: SiteLocale = "pt";

export function setActiveSiteLocaleForApi(locale: SiteLocale): void {
  activeSiteLocaleForApi = locale;
}

export function getActiveSiteLocaleForApi(): SiteLocale {
  return activeSiteLocaleForApi;
}
