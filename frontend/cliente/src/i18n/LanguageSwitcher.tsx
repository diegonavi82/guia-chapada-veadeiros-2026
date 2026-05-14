import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { SiteLocale } from "./types";
import { SITE_LOCALES } from "./types";
import { stripLeadingLocale } from "./paths";
import { LangLinkForced } from "./LangLink";

const labels: Record<SiteLocale, string> = { pt: "PT", en: "EN", es: "ES" };

export function LanguageSwitcher() {
  const location = useLocation();
  const basePath = useMemo(() => stripLeadingLocale(location.pathname), [location.pathname]);

  const search = location.search ?? "";

  return (
    <div
      className="flex shrink-0 gap-1 rounded-full border border-slate-200 bg-white/90 px-1 py-0.5 text-[11px] font-bold text-slate-600"
      aria-label="Idioma / Language"
    >
      {SITE_LOCALES.map((lng) => {
        const active =
          lng === "pt"
            ? !location.pathname.startsWith("/en") && !location.pathname.startsWith("/es")
            : location.pathname === `/${lng}` || location.pathname.startsWith(`/${lng}/`);
        /** Caminho já sem `/en|/es` — só o `LangLinkForced` deve prefixar (evita `/en/en`). */
        const target = `${basePath}${search}`;
        return (
          <LangLinkForced
            key={lng}
            locale={lng}
            to={target}
            className={
              active
                ? "rounded-full bg-[#df8350] px-2 py-0.5 text-white"
                : "rounded-full px-2 py-0.5 hover:bg-slate-100"
            }
            replace={false}
          >
            {labels[lng]}
          </LangLinkForced>
        );
      })}
    </div>
  );
}
