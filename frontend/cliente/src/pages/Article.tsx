import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";
import { rewriteHtmlMediaUrls, toPublicAssetUrl } from "../utils/localMediaUrl";

type ArticleData = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  seoFocusKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  seoRobots?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
};

export function Article() {
  const { slug = "" } = useParams();
  const fallbackTitle = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    setIsLoading(true);
    apiGet<ArticleData>(`/posts/${slug}`)
      .then(setArticle)
      .catch(() => setError("Artigo não encontrado ou sem permissão para leitura pública."))
      .finally(() => setIsLoading(false));
  }, [slug]);

  /** Título exibido na aba — prioriza o meta title configurado para buscadores */
  const documentTitle =
    article?.seoTitle ?? article?.title ?? fallbackTitle ?? "Revista Chapada dos Veadeiros";
  /** Descrição da meta principal (snippets Google) */
  const metaTagDescription =
    article?.seoDescription ??
    article?.excerpt ??
    "Matéria completa sobre a Chapada dos Veadeiros, com texto estruturado para leitura e SEO.";

  const robots = article?.seoRobots?.trim() || "index,follow";
  const keywordsTrim = article?.seoKeywords?.trim();
  const keywords = keywordsTrim && keywordsTrim.length > 0 ? keywordsTrim : undefined;

  const heroImage = toPublicAssetUrl(article?.featuredImage) ?? article?.featuredImage ?? undefined;
  const heroAlt =
    article?.featuredImageAlt?.trim() ||
    (article?.title ? `${article.title} — foto de capa` : "Imagem de capa da matéria");
  const bodyHtml = article?.content ? rewriteHtmlMediaUrls(article.content) : "";

  const structuredArticle = article
    ? ({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.seoTitle ?? article.title,
        description: metaTagDescription,
        ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
        datePublished: article.publishedAt,
        mainEntityOfPage: `/revista/${slug}`,
        ...(keywords ? { keywords } : {}),
        ...(heroImage
          ? {
              image: [{ "@type": "ImageObject", url: heroImage, caption: heroAlt }],
            }
          : {}),
        author: {
          "@type": "Organization",
          name: "Guia Chapada dos Veadeiros",
        },
        publisher: {
          "@type": "Organization",
          name: "Guia Chapada dos Veadeiros",
        },
      } as Record<string, unknown>)
    : undefined;

  return (
    <article className="mx-auto max-w-4xl px-4 py-16">
      <Seo
        title={documentTitle}
        description={metaTagDescription}
        canonical={`/revista/${slug}`}
        ogImage={heroImage}
        ogTitle={article?.ogTitle ?? undefined}
        ogDescription={article?.ogDescription ?? undefined}
        keywords={keywords}
        robots={robots}
        type="article"
        breadcrumbs={[
          { name: "Início", url: "/" },
          { name: "Revista", url: "/revista" },
          { name: documentTitle, url: `/revista/${slug}` },
        ]}
        jsonLd={structuredArticle}
      />
      {isLoading ? <p className="text-slate-600">Carregando artigo...</p> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {article ? (
        <>
          {heroImage ? (
            <img
              src={heroImage}
              alt={heroAlt}
              className="mb-10 aspect-[16/9] w-full rounded-3xl object-cover"
              loading="eager"
              fetchPriority="high"
            />
          ) : null}
          <header>
            <h1 className="text-5xl font-black text-cerrado-900">{article.title}</h1>
            {article.excerpt ? <p className="mt-6 text-xl text-slate-700">{article.excerpt}</p> : null}
            {article.seoFocusKeyword ? (
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-cerrado-600">
                foco editorial: <span className="text-slate-800">{article.seoFocusKeyword}</span>
              </p>
            ) : null}
          </header>
          <div
            className="prose prose-lg mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </>
      ) : null}
    </article>
  );
}
