import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ScrollToTop } from "../components/ScrollToTop";
import { wpUploadsAssets } from "../config/wpUploadsAssets";
import { LangLink } from "../i18n/LangLink";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";

export function SiteLayout() {
  const { t } = useTranslation();
  const navItems = useMemo(
    () =>
      [
        ["nav.home", "/"] as const,
        ["nav.revista", "/revista"] as const,
        ["nav.atrativos", "/atrativos"] as const,
        ["nav.contato", "/contato"] as const,
      ],
    [],
  );

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="bg-[#61b979] px-4 py-2 text-center text-xs font-medium text-white max-md:px-[max(1rem,env(safe-area-inset-left))] max-md:pr-[max(1rem,env(safe-area-inset-right))]">
        {t("topBar.contacts")}
      </div>
      <header className="sticky top-0 z-40 bg-white/95 shadow-[0_14px_38px_rgba(15,35,48,0.08)] backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-5">
          <LangLink
            to="/"
            className="flex shrink-0 items-center gap-3 text-sm font-semibold text-cerrado-900 md:text-base"
          >
            <img
              src={wpUploadsAssets.siteLogo}
              alt={t("logoAlt")}
              className="h-9 w-auto sm:h-10"
            />
          </LangLink>
          <div className="flex min-w-0 flex-row flex-wrap items-center justify-end gap-3 sm:flex-nowrap sm:justify-normal">
            <nav
              className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-initial sm:gap-6 md:gap-8 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
              aria-label={t("layout.mainNavAria")}
            >
              {navItems.map(([key, href]) => (
                <LangLink
                  key={href}
                  to={href}
                  className="shrink-0 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#df8350] active:bg-slate-100 sm:px-0 sm:py-0 sm:hover:bg-transparent"
                >
                  {t(key)}
                </LangLink>
              ))}
              <LangLink
                to="/busca"
                aria-label={t("layout.searchAria")}
                className="shrink-0 rounded-lg p-2 text-lg leading-none text-slate-700 hover:bg-slate-50 hover:text-[#df8350] sm:p-0 sm:hover:bg-transparent"
              >
                ⌕
              </LangLink>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main>
        <ScrollToTop />
        <Outlet />
      </main>
      <footer className="mt-14 bg-gradient-to-br from-[#1f2f2b] via-[#263a35] to-[#152420] px-4 text-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 py-14 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <img
              src={wpUploadsAssets.parqueNacionalSalto}
              alt={t("footer.nationalParkAlt")}
              className="mb-5 h-24 w-32 rounded-2xl object-cover shadow-2xl"
            />
            <h2 className="text-3xl font-semibold leading-none tracking-tight">{t("footer.taglineTitle")}</h2>
            <p className="mt-4 text-sm leading-7 text-white/75">{t("footer.taglineBody")}</p>
            <a
              className="mt-4 inline-flex rounded-full bg-[#df8350] px-4 py-3 text-sm font-black text-white"
              href="https://www.instagram.com/guiachapadaveadeiros/"
              rel="noreferrer"
              target="_blank"
            >
              {t("footer.instagramHandle")}
            </a>
          </div>
          <div>
            <img
              src="/cadastur-guia-chapada-dos-veadeiros.jpg"
              alt={t("footer.cadasturAlt")}
              className="mx-auto max-h-64 w-auto rounded-xl shadow-2xl md:mx-0"
              loading="lazy"
            />
          </div>
          <nav className="flex flex-col gap-3 text-sm text-white/80" aria-label={t("footer.colPlan")}>
            <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[#df8350]">{t("footer.colPlan")}</h3>
            <LangLink to="/loja">{t("footer.linkShop")}</LangLink>
            <LangLink to="/hospedagem-na-chapada-dos-veadeiros">{t("footer.linkLodging")}</LangLink>
            <LangLink to="/contato">{t("footer.linkContact")}</LangLink>
            <a
              href="https://api.whatsapp.com/send?phone=5562982506891&text=*Quero%20planejar%20minha%20viagem%20na%20Chapada*"
              rel="noreferrer"
              target="_blank"
            >
              {t("footer.linkWhatsapp")}
            </a>
          </nav>
          <div className="text-sm text-white/80">
            <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-[#df8350]">{t("footer.colSupport")}</h3>
            <p>
              <strong>{t("footer.whatsappLabel")}</strong> +55 62 98250-6891
            </p>
            <p className="mt-3">
              <strong>{t("footer.emailLabel")}</strong> contato@guiachapadaveadeiros.com
            </p>
            <p className="mt-3">
              <strong>{t("footer.baseLabel")}</strong> {t("footer.baseValue")}
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">{t("footer.copyright")}</div>
      </footer>
    </div>
  );
}
