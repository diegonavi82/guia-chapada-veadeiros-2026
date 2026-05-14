import { Link } from "react-router-dom";
import type { ComponentProps } from "react";
import type { SiteLocale } from "./types";
import { useSiteLocale } from "./siteLocale";
import { withLocalePrefix } from "./paths";

type RRLinkProps = ComponentProps<typeof Link>;

/** `Link` com prefix `/en|/es` automático segundo o contexto. */
export function LangLink(props: Omit<RRLinkProps, "to"> & { to: string }) {
  const locale = useSiteLocale();
  return <LangLinkForced {...props} locale={locale} />;
}

/** Para componentes já fora do contexto ou testes — passa locale explicitamente. */
export function LangLinkForced({
  locale,
  to,
  ...rest
}: Omit<RRLinkProps, "to"> & { locale: SiteLocale; to: string }) {
  const resolved = typeof to === "string" ? withLocalePrefix(to, locale) : to;
  return <Link to={resolved} {...rest} />;
}
