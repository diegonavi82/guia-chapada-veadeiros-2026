import type { SiteLocale } from "./types";

/** Remove repetidamente `/en` ou `/es` do início (`/en/en` → `/`, `/en/foo` → `/foo`). */
export function stripLeadingLocale(pathname: string): string {
  let path = pathname || "/";
  for (let i = 0; i < 8; i += 1) {
    if (path === "/en" || path === "/es") {
      return "/";
    }
    if (path.startsWith("/en/")) {
      const rest = path.slice(4);
      path = rest.startsWith("/") ? rest || "/" : `/${rest}`;
      continue;
    }
    if (path.startsWith("/es/")) {
      const rest = path.slice(4);
      path = rest.startsWith("/") ? rest || "/" : `/${rest}`;
      continue;
    }
    break;
  }
  return path;
}

/** Prefixa `/foo` segundo o idioma (PT sem prefix). Idempotente: remove locale antigo antes. */
export function withLocalePrefix(path: string, locale: SiteLocale): string {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const p = stripLeadingLocale(normalized);
  if (locale === "pt") {
    return p;
  }
  if (p === "/") {
    return `/${locale}`;
  }
  return `/${locale}${p}`;
}
