import { createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "../layouts/SiteLayout";
import { Article } from "../pages/Article";
import { Blog } from "../pages/Blog";
import { DynamicPage } from "../pages/DynamicPage";
import { Home } from "../pages/Home";
import { StaticPage } from "../pages/StaticPage";

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:slug", element: <Article /> },
      {
        path: "/atrativos",
        element: (
          <StaticPage title="Atrativos" description="Cachoeiras, trilhas, mirantes e experiencias imperdiveis." />
        ),
      },
      {
        path: "/passeios",
        element: (
          <StaticPage title="Passeios" description="Produtos e roteiros migrados do WooCommerce." />
        ),
      },
      {
        path: "/faq",
        element: (
          <StaticPage title="FAQ" description="Perguntas frequentes com schema FAQ preparado." />
        ),
      },
      {
        path: "/contato",
        element: <StaticPage title="Contato" description="Fale com o Guia Chapada dos Veadeiros." />,
      },
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
