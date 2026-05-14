import type { SiteLocale } from "./types";

export function stripLeadingLocale(pathname: string): string {
  if (pathname === "/en" || pathname === "/es") {
    return "/";
  }
  if (pathname.startsWith("/en/")) {
    const rest = pathname.slice(4);
    return rest.startsWith("/") ? rest || "/" : `/${rest}`;
  }
  if (pathname.startsWith("/es/")) {
    const rest = pathname.slice(4);
    return rest.startsWith("/") ? rest || "/" : `/${rest}`;
  }
  return pathname || "/";
}

/** Prefixa path absoluto (/foo) según locale (PT sem prefix). */
export function withLocalePrefix(path: string, locale: SiteLocale): string {
  const p = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  if (locale === "pt") {
    return p;
  }
  if (p === "/") {
    return `/${locale}`;
  }
  return `/${locale}${p}`;
}
