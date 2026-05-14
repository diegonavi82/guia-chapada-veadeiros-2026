import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
import { SiteLayout } from "../layouts/SiteLayout";
import { Article } from "../pages/Article";
import { Attractions } from "../pages/Attractions";
import { Contact } from "../pages/Contact";
import { DynamicPage } from "../pages/DynamicPage";
import { Home } from "../pages/Home";
import { ProductDetail } from "../pages/ProductDetail";
import { Revista } from "../pages/Revista";
import { StaticPage } from "../pages/StaticPage";
import { ContratarGuiaArtigo } from "../pages/artigos/ContratarGuiaArtigo";
import ArtigoMelhorEpoca from "../pages/artigos/melhor-epoca-visitar-chapada-dos-veadeiros";

function LegacyBlogSlugRedirect() {
  const { slug } = useParams();

  return <Navigate replace to={slug ? `/revista/${slug}` : "/revista"} />;
}

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/revista", element: <Revista /> },
      { path: "/revista/contratar-guia-local-chapada-veadeiros", element: <ContratarGuiaArtigo /> },
      { path: "/revista/melhor-epoca-visitar-chapada-dos-veadeiros", element: <ArtigoMelhorEpoca /> },
      { path: "/revista/:slug", element: <Article /> },
      { path: "/blog", element: <Navigate replace to="/revista" /> },
      { path: "/blog/:slug", element: <LegacyBlogSlugRedirect /> },
      { path: "/contratar-guia-local-chapada-veadeiros", element: <Navigate replace to="/revista/contratar-guia-local-chapada-veadeiros" /> },
      { path: "/melhor-epoca-visitar-chapada-dos-veadeiros", element: <Navigate replace to="/revista/melhor-epoca-visitar-chapada-dos-veadeiros" /> },
      { path: "/atrativos", element: <Attractions /> },
      { path: "/passeios", element: <Navigate replace to="/atrativos" /> },
      { path: "/passeios/:slug", element: <ProductDetail /> },
      {
        path: "/faq",
        element: (
          <StaticPage title="FAQ" description="Perguntas frequentes com schema FAQ preparado." />
        ),
      },
      { path: "/contato", element: <Contact /> },
      {
        path: "/busca",
        element: <StaticPage title="Busca" description="Busque artigos, atrativos e passeios." />,
      },
      {
        path: "/categoria/:slug",
        element: <StaticPage title="Categoria" description="Arquivo de categoria preservado da migracao." />,
      },
      {
        path: "/:slug",
        element: <DynamicPage />,
      },
    ],
  },
]);
