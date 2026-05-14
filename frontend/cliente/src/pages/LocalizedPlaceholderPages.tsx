import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { StaticPage } from "./StaticPage";

export function FaqPlaceholderPage() {
  const { t } = useTranslation();
  return (
    <StaticPage title={t("static.faq.title")} description={t("static.faq.description")} />
  );
}

export function SearchPlaceholderPage() {
  const { t } = useTranslation();
  return (
    <StaticPage title={t("static.search.title")} description={t("static.search.description")} />
  );
}

/** Rota `/categoria/:slug` — arquivo legado WP. */
export function CategoryArchivePage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  return (
    <StaticPage title={t("static.category.title", { slug })} description={t("static.category.description", { slug })} />
  );
}
