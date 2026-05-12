import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mediaPublicBase } from "../config/mediaPublic";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";

type PageData = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

const detailImageBase = mediaPublicBase;
const detailFallbackImages: Record<string, string> = {
  "cachoeira-almecegas-poco-sao-bento-guia-chapada-veadeiros": `${detailImageBase}/almecegas.jpg`,
  "vale-lua-guia-chapada-veadeiros-sao-jorge": `${detailImageBase}/vale-lua.jpg`,
  "cataratas-dos-couros-guia-chapada-veadeiros-alto-paraiso": `${detailImageBase}/couros.jpg`,
  "cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante": `${detailImageBase}/santa-barbara.jpg`,
  "cachoeira-segredo-guia-chapada-veadeiros-sao-jorge": `${detailImageBase}/segredo.jpg`,
  "cachoeira-cristais-guia-chapada-veadeiros-alto-paraiso": `${detailImageBase}/cristais.jpg`,
  "cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-de-goias": `${detailImageBase}/poco-encantado.jpg`,
  "cachoeira-macaquinhos-guia-chapada-veadeiros-sao-joao-alianca": `${detailImageBase}/macaquinhos.jpg`,
};

function extractFirstImage(content: string) {
  const imageMatch = content.match(/<img\b[^>]*>/i);

  if (!imageMatch) {
    return null;
  }

  const imageTag = imageMatch[0];
  const src = imageTag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  const alt = imageTag.match(/\balt=["']([^"']*)["']/i)?.[1];

  return src ? { tag: imageTag, src, alt } : null;
}

function prepareDetailContent(content: string, imageTag?: string) {
  return content
    .replace(/^\s*<h2\b[\s\S]*?<\/h2>\s*/i, "")
    .replace(imageTag ?? "", "")
    .replace(/[A-Za-z0-9+/=]{500,}/g, "")
    .trim();
}

function splitDetailContent(content: string) {
  const ctaMatch = content.match(/<a\b[^>]*class=["'][^"']*\bbutton\b[^"']*["'][^>]*>[\s\S]*?<\/a>/i);

  if (!ctaMatch) {
    return {
      sidebarInfo: "",
      ctaHtml: "",
      mainContent: content,
    };
  }

  return {
    sidebarInfo: content
      .slice(0, ctaMatch.index)
      .replace(/Compre seu passeio!/i, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    ctaHtml: ctaMatch[0],
    mainContent: content.slice((ctaMatch.index ?? 0) + ctaMatch[0].length).trim(),
  };
}

function getSidebarLines(sidebarInfo: string) {
  return sidebarInfo
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function DynamicPage() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    setIsLoading(true);
    setError("");
    apiGet<PageData>(`/pages/${slug}`)
      .then(setPage)
      .catch(() => setError("Pagina nao encontrada ou API indisponivel."))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-slate-600">Carregando pagina...</main>;
  }

  if (error || !page) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <Seo title="Pagina nao encontrada" description="Esta pagina nao foi encontrada." robots="noindex,follow" />
        <h1 className="text-4xl font-black text-cerrado-900">Pagina nao encontrada</h1>
        <p className="mt-4 text-slate-600">{error}</p>
      </main>
    );
  }

  const firstImage = extractFirstImage(page.content);
  const fallbackImage = detailFallbackImages[page.slug];
  const detailImage = fallbackImage || page.featuredImage || firstImage?.src;
  const detailContent = prepareDetailContent(page.content, firstImage?.tag);
  const detailParts = splitDetailContent(detailContent);
  const sidebarLines = getSidebarLines(detailParts.sidebarInfo);

  return (
    <article className="gcv-detail-page bg-[#f4f6fb] px-4 py-8 md:py-10">
      <Seo
        title={page.seoTitle || page.title}
        description={page.seoDescription || page.excerpt || `Pagina ${page.title}`}
        canonical={`/${page.slug}`}
        ogImage={page.featuredImage ?? undefined}
      />
      <div className="mx-auto max-w-[1180px]">
        <header className="gcv-detail-title">
          <h1>{page.title}</h1>
        </header>

        <section className="gcv-detail-layout">
          <aside className="gcv-detail-sidebar">
            {detailImage ? (
              <img
                src={detailImage}
                alt={firstImage?.alt || page.title}
                className="gcv-detail-main-image"
                loading="eager"
              />
            ) : null}
            {detailParts.ctaHtml ? (
              <div
                className="gcv-detail-cta"
                dangerouslySetInnerHTML={{ __html: detailParts.ctaHtml }}
              />
            ) : null}
            {sidebarLines.length > 0 ? (
              <div className="gcv-detail-info">
                {sidebarLines.map((line, index) => {
                  const isHeading = line.endsWith(":") || (!line.startsWith("-") && index === 0);

                  return (
                    <p key={`${line}-${index}`} className={isHeading ? "gcv-detail-info-heading" : undefined}>
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : null}
            {page.excerpt ? <p className="gcv-detail-excerpt">{page.excerpt}</p> : null}
          </aside>

          <div
            className="gcv-detail-content"
            dangerouslySetInnerHTML={{ __html: detailParts.mainContent }}
          />
        </section>
      </div>
    </article>
  );
}
