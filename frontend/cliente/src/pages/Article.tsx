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
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
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
      .catch(() => setError("Artigo nao encontrado ou API indisponivel."))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const title = article?.seoTitle || article?.title || fallbackTitle || "Artigo";
  const description =
    article?.seoDescription || article?.excerpt || "Artigo migrado do WordPress com metadados SEO preservados.";
  const heroImage = toPublicAssetUrl(article?.featuredImage) ?? article?.featuredImage ?? undefined;
  const bodyHtml = article?.content ? rewriteHtmlMediaUrls(article.content) : "";

  return (
    <article className="mx-auto max-w-4xl px-4 py-16">
      <Seo
        title={title}
        description={description}
        canonical={`/blog/${slug}`}
        ogImage={heroImage}
        type="article"
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: title, url: `/blog/${slug}` },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          mainEntityOfPage: `/blog/${slug}`,
          datePublished: article?.publishedAt,
          image: heroImage,
        }}
      />
      {isLoading ? <p className="text-slate-600">Carregando artigo...</p> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {article ? (
        <>
          {heroImage ? (
            <img
              src={heroImage}
              alt={article.title}
              className="mb-10 aspect-[16/9] w-full rounded-3xl object-cover"
              loading="eager"
            />
          ) : null}
          <h1 className="text-5xl font-black text-cerrado-900">{article.title}</h1>
          {article.excerpt ? <p className="mt-6 text-xl text-slate-700">{article.excerpt}</p> : null}
          <div
            className="prose prose-lg mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </>
      ) : null}
    </article>
  );
}
