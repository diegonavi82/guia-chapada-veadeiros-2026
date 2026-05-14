import { createBrowserRouter, Navigate, type RouteObject, useParams } from "react-router-dom";
import { LocaleLayout } from "../i18n/LocaleLayout";
import { withLocalePrefix } from "../i18n/paths";
import { useSiteLocale } from "../i18n/siteLocale";
import { SiteLayout } from "../layouts/SiteLayout";
import { Article } from "../pages/Article";
import { Attractions } from "../pages/Attractions";
import { Contact } from "../pages/Contact";
import { DynamicPage } from "../pages/DynamicPage";
import { Home } from "../pages/Home";
import {
  CategoryArchivePage,
  FaqPlaceholderPage,
  SearchPlaceholderPage,
} from "../pages/LocalizedPlaceholderPages";
import { ProductDetail } from "../pages/ProductDetail";
import { Revista } from "../pages/Revista";
import { ContratarGuiaArtigo } from "../pages/artigos/ContratarGuiaArtigo";
import ArtigoMelhorEpoca from "../pages/artigos/melhor-epoca-visitar-chapada-dos-veadeiros";

function LegacyBlogSlugRedirect() {
  const { slug } = useParams();
  const locale = useSiteLocale();
  const path = slug ? `/revista/${slug}` : "/revista";

  return <Navigate replace to={withLocalePrefix(path, locale)} />;
}

function LegacyBlogIndexRedirect() {
  const locale = useSiteLocale();
  return <Navigate replace to={withLocalePrefix("/revista", locale)} />;
}

function RedirectPasseiosToAtrativos() {
  const locale = useSiteLocale();
  return <Navigate replace to={withLocalePrefix("/atrativos", locale)} />;
}

function RedirectContratarGuideFromRoot() {
  const locale = useSiteLocale();
  return (
    <Navigate replace to={withLocalePrefix("/revista/contratar-guia-local-chapada-veadeiros", locale)} />
  );
}

function RedirectMelhorEpocaFromRoot() {
  const locale = useSiteLocale();
  return (
    <Navigate replace to={withLocalePrefix("/revista/melhor-epoca-visitar-chapada-dos-veadeiros", locale)} />
  );
}

/** Mesmas páginas em PT (sem segmento `/en`) e em inglês/espanhol. */
function localeChildRoutes(): RouteObject[] {
  return [
    { index: true, element: <Home /> },
    { path: "blog", element: <LegacyBlogIndexRedirect /> },
    { path: "blog/:slug", element: <LegacyBlogSlugRedirect /> },
    {
      path: "contratar-guia-local-chapada-veadeiros",
      element: <RedirectContratarGuideFromRoot />,
    },
    {
      path: "melhor-epoca-visitar-chapada-dos-veadeiros",
      element: <RedirectMelhorEpocaFromRoot />,
    },
    { path: "revista", element: <Revista /> },
    {
      path: "revista/contratar-guia-local-chapada-veadeiros",
      element: <ContratarGuiaArtigo />,
    },
    {
      path: "revista/melhor-epoca-visitar-chapada-dos-veadeiros",
      element: <ArtigoMelhorEpoca />,
    },
    { path: "revista/:slug", element: <Article /> },
    { path: "atrativos", element: <Attractions /> },
    { path: "passeios", element: <RedirectPasseiosToAtrativos /> },
    { path: "passeios/:slug", element: <ProductDetail /> },
    { path: "faq", element: <FaqPlaceholderPage /> },
    { path: "contato", element: <Contact /> },
    { path: "busca", element: <SearchPlaceholderPage /> },
    { path: "categoria/:slug", element: <CategoryArchivePage /> },
    { path: ":slug", element: <DynamicPage /> },
  ];
}

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { element: <LocaleLayout locale="pt" />, children: localeChildRoutes() },
      { path: "en", element: <LocaleLayout locale="en" />, children: localeChildRoutes() },
      { path: "es", element: <LocaleLayout locale="es" />, children: localeChildRoutes() },
    ],
  },
]);
