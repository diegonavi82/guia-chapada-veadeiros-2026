import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArticleAuthorCard } from "../components/revista/ArticleAuthorCard";
import { ArticleShareBar } from "../components/revista/ArticleShareBar";
import { SITE_ORIGIN } from "../config/siteOrigin";
import { useSiteLocale } from "../i18n/siteLocale";
import { withLocalePrefix } from "../i18n/paths";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";
import { rewriteHtmlMediaUrls, toPublicAssetUrl } from "../utils/localMediaUrl";
import { formatPublicationDatePt } from "../utils/formatPublicationDatePt";
import "../styles/gcv-post.css";

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
  const locale = useSiteLocale();
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
  const revistaPath = withLocalePrefix(`/revista/${slug}`, locale);
  const sharePageUrl = `${SITE_ORIGIN}${revistaPath}`;
  const trimmedPub = article?.publishedAt?.trim() ?? "";
  const publishedDateAttr = /^\d{4}-\d{2}-\d{2}/.test(trimmedPub) ? trimmedPub.slice(0, 10) : "";
  const publishedFull = formatPublicationDatePt(article?.publishedAt);

  const structuredArticle = article
    ? ({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.seoTitle ?? article.title,
        description: metaTagDescription,
        ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
        datePublished: article.publishedAt,
        mainEntityOfPage: `${SITE_ORIGIN}${revistaPath}`,
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
    <article className="Article-page mx-auto w-full max-w-4xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 md:px-8 md:py-16">
      <Seo
        title={documentTitle}
        description={metaTagDescription}
        canonical={revistaPath}
        ogImage={heroImage}
        ogTitle={article?.ogTitle ?? undefined}
        ogDescription={article?.ogDescription ?? undefined}
        keywords={keywords}
        robots={robots}
        type="article"
        breadcrumbs={[
          { name: "Início", url: `${SITE_ORIGIN}${withLocalePrefix("/", locale)}` },
          { name: "Revista", url: `${SITE_ORIGIN}${withLocalePrefix("/revista", locale)}` },
          { name: documentTitle, url: `${SITE_ORIGIN}${revistaPath}` },
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
              className="mb-0 aspect-[16/9] w-full max-w-full rounded-2xl object-cover sm:rounded-3xl"
              loading="eager"
              fetchPriority="high"
            />
          ) : null}
          <ArticleShareBar
            pageUrl={sharePageUrl}
            shareTitle={article.title}
            placement="afterHero"
          />
          <header className={heroImage ? "mt-6 sm:mt-10" : ""}>
            <h1 className="break-words text-3xl font-black leading-tight text-cerrado-900 sm:text-4xl md:text-5xl">
              {article.title}
            </h1>
            {article.excerpt ? (
              <p className="mt-4 break-words text-lg text-slate-700 sm:mt-6 sm:text-xl">{article.excerpt}</p>
            ) : null}
            {publishedFull ? (
              <p className="mt-3 text-base font-semibold tracking-tight text-slate-600 sm:mt-4">
                <time dateTime={publishedDateAttr || undefined}>{publishedFull}</time>
              </p>
            ) : null}
            {article.seoFocusKeyword ? (
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-cerrado-600">
                foco editorial: <span className="text-slate-800">{article.seoFocusKeyword}</span>
              </p>
            ) : null}
          </header>
          <div className="Article-body mt-8 max-w-full overflow-x-auto sm:mt-10">
            <div
              className="prose prose-base max-w-none break-words prose-headings:break-words prose-p:break-words prose-pre:max-w-full prose-pre:overflow-x-auto prose-img:my-6 prose-img:w-full prose-img:max-w-full prose-img:rounded-2xl sm:prose-lg"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
          <ArticleAuthorCard>
            <p>
              Guia local credenciado pelo Cadastur (Ministério do Turismo) na Chapada dos Veadeiros, com anos de experiência em trilhas e atrativos em todas as épocas do ano.
            </p>
          </ArticleAuthorCard>
          <ArticleShareBar pageUrl={sharePageUrl} shareTitle={article.title} placement="footer" />
        </>
      ) : null}
    </article>
  );
}
