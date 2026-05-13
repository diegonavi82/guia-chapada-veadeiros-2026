import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AttractionPhotoGallery,
  type AttractionGalleryItem,
} from "../components/AttractionPhotoGallery";
import { WaterfallRegionMap } from "../components/WaterfallRegionMap";
import attractionGalleriesManifest from "../data/attractionGalleries.json";
import { pageSlugHasWaterfallMap } from "../config/waterfallMap";
import { detailImageByPageSlug } from "../config/wpUploadsAssets";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";
import { rewriteHtmlMediaUrls, toPublicAssetUrl } from "../utils/localMediaUrl";

function galleryItemsForSlug(slug: string): AttractionGalleryItem[] {
  const row = (attractionGalleriesManifest as Record<string, unknown>)[slug];
  return Array.isArray(row) ? (row as AttractionGalleryItem[]) : [];
}

/**
 * O conteúdo migrado do WordPress ainda traz a galeria Avada Fusion no HTML (título, parágrafo e figuras).
 * Quando já renderizamos `AttractionPhotoGallery` via JSON, removemos esse bloco para não duplicar.
 */
function stripLegacyFusionGalleryFromHtml(html: string): string {
  if (!html.trim()) {
    return html;
  }

  try {
    const doc = new DOMParser().parseFromString(`<div id="gcv-gallery-strip">${html}</div>`, "text/html");
    const root = doc.getElementById("gcv-gallery-strip");
    if (!root) {
      return html;
    }

    root.querySelectorAll(".fusion-gallery").forEach((el) => el.remove());
    root.querySelectorAll(".fusion-recent-works").forEach((el) => el.remove());
    root.querySelectorAll("[class*='fusion-gallery-wrapper']").forEach((el) => el.remove());

    root.querySelectorAll("[class*='fusion-gallery-image']").forEach((el) => {
      const col = el.closest(".fusion-layout-column");
      if (col && root.contains(col)) {
        col.remove();
      } else {
        const wrap = el.closest("div") ?? el;
        if (wrap.parentElement) {
          wrap.remove();
        }
      }
    });

    root.querySelectorAll("h2").forEach((h2) => {
      const normalized = h2.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
      if (normalized !== "galeria de fotos") {
        return;
      }

      let next = h2.nextElementSibling;
      if (next?.tagName === "P") {
        const pText = next.textContent ?? "";
        if (/gui oficial|textos alternativos|acessibilidade|seo/i.test(pText)) {
          next.remove();
        }
      }
      h2.remove();
    });

    return root.innerHTML;
  } catch {
    return html;
  }
}

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

const guideBookingButtonHref =
  "https://www.guiachapadaveadeiros.com/produto/guia-turismo-parque-nacional-chapada-veadeiros-alto-paraiso-sao-jorge/";

/** Texto típico de fechamento do bloco lateral sem link .button migrado */
const CONTRATE_NOTICE_RE = /\bContrate\s+um\s+guia\s+local\b(?:\s*[\!\?\.])?/i;

/** Indica lista de infos (Distâncias, ingressos…) antes da redação principal */
const METADATA_SIDEBAR_HINT_RE =
  /\b(?:Dist[aâ]ncia|Ingressos|Atrativos|Nível\s+de\s+Dificuldade|Entrada\b|Estacionamento\b|Per[ií]odo\s+recomendado)\b/i;

const BUTTON_ANCHOR_RE =
  /<a\b[^>]*class=["']([^"']*)["'][^>]*>[\s\S]*?<\/a>/gi;

function anchorClassesLookLikeSiteCta(classes: string) {
  const c = classes.toLowerCase();
  return (
    /\bbutton\b/.test(c) ||
    /\bfusion-button\b/.test(c) ||
    /\bwp-element-button\b/.test(c) ||
    /\bwp-block-button__link\b/.test(c)
  );
}

function listButtonAnchors(content: string) {
  const out: { html: string; index: number; label: string }[] = [];
  let m: RegExpExecArray | null;
  BUTTON_ANCHOR_RE.lastIndex = 0;

  while ((m = BUTTON_ANCHOR_RE.exec(content)) !== null) {
    const klass = m[1] ?? "";
    if (!anchorClassesLookLikeSiteCta(klass)) {
      continue;
    }

    out.push({
      html: m[0],
      index: m.index,
      label: m[0].replace(/<[^>]+>/g, "").trim(),
    });
  }

  return out;
}

function splitAtFirstButton(content: string, buttons = listButtonAnchors(content)) {
  if (!buttons.length) {
    return {
      sidebarInfo: "",
      ctaHtml: "",
      mainContent: content,
    };
  }

  const first = buttons[0]!;

  return {
    sidebarInfo: content
      .slice(0, first.index)
      .replace(/Compre seu passeio!/i, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    ctaHtml: first.html,
    mainContent: content.slice(first.index + first.html.length).trim(),
  };
}

/** Migrações em que \"Compre\" vem antes do bloco factual e \"Contrate\" fecha a barra lateral. */
function splitCompreThenContrate(content: string, buttons: ReturnType<typeof listButtonAnchors>) {
  const comprehend = buttons.findIndex((b) => /compre\s+seu\s+passeio\b/i.test(b.label));
  const contrateIdx = buttons.findIndex((b) => /contrate\s+um\s+guia\s+local/i.test(b.label));

  if (comprehend === -1 || contrateIdx === -1 || buttons[comprehend]!.index >= buttons[contrateIdx]!.index) {
    return null;
  }

  const sliceCompre = buttons[comprehend]!;
  const sliceContrate = buttons[contrateIdx]!;

  const sidebarInfo = content.slice(sliceCompre.index + sliceCompre.html.length, sliceContrate.index).trim();
  const ctaHtml = sliceContrate.html;
  const mainContent = content.slice(sliceContrate.index + sliceContrate.html.length).trim();

  return { sidebarInfo, ctaHtml, mainContent };
}

/** HTML sem anchors .button mas com aviso de \"Contrate\" (ex.: Vale da Lua). */
function splitPlaintextSidebarBeforeContrateNotice(content: string) {
  const contrNotice = CONTRATE_NOTICE_RE.exec(content);

  if (!contrNotice) {
    return null;
  }

  let sidebarRaw = content.slice(0, contrNotice.index).replace(/^Compre\s+seu\s+passeio!\s*/im, "").trim();
  sidebarRaw = sidebarRaw.replace(/\s+$/, "");

  const afterContr = contrNotice.index + contrNotice[0].length;
  let mainTail = content.slice(afterContr).trimStart();

  mainTail = mainTail.startsWith("</p>")
    ? mainTail.replace(/^<\/p>\s*/i, "").trimStart()
    : mainTail;

  const ctaHtml = `<a href="${guideBookingButtonHref}" class="button" rel="noopener noreferrer">Contrate um guia local!</a>`;
  const preludeCompre = `<a href="/contato" class="button">Compre seu passeio!</a>\n`;

  return {
    sidebarInfo: sidebarRaw,
    ctaHtml,
    mainContent: preludeCompre + mainTail,
  };
}

function headHasLongProseBlock(head: string) {
  return head.split(/\n{2,}/).some((b) => b.replace(/\s+/g, " ").trim().length > 260);
}

/**
 * Fallback: primeiro <h2|h3> após um bloco curto parecendo ficha técnica.
 * Cobre migrações sem fusion_button nem texto \"Contrate…\" antes do texto corrido.
 */
function splitMetadataBeforeFirstHeading(content: string) {
  const hExec = /<h[23]\b/i.exec(content);

  if (!hExec || hExec.index < 60) {
    return null;
  }

  const head = content.slice(0, hExec.index).trim();
  const body = content.slice(hExec.index).trim();

  if (!METADATA_SIDEBAR_HINT_RE.test(head) || head.length > 1400 || headHasLongProseBlock(head)) {
    return null;
  }

  let sidebarRaw = head.replace(/^Compre\s+seu\s+passeio!\s*/im, "").trim();
  sidebarRaw = sidebarRaw.replace(CONTRATE_NOTICE_RE, "").trim();
  sidebarRaw = sidebarRaw.replace(/\n{3,}/g, "\n\n").trim();

  const hadContrateInHead = /\bcontrate\s+um\s+guia\s+local\b/i.test(head);
  const hadComprePlain = /\bcompre\s+seu\s+passeio\b/i.test(head);
  const suggestContrate =
    hadContrateInHead ||
    /\brecomendado\s+.*\bguia\b/i.test(head) ||
    /\bguia\s+obrigat[oó]rio\b/i.test(head) ||
    /\bcom\s+guia\s+local\b/i.test(head);

  let ctaHtml = "";
  if (suggestContrate) {
    ctaHtml = `<a href="${guideBookingButtonHref}" class="button" rel="noopener noreferrer">Contrate um guia local!</a>`;
  }

  const preludeCompre = hadComprePlain
    ? `<a href="/contato" class="button">Compre seu passeio!</a>\n`
    : "";

  const mainContent = preludeCompre + body;

  if (!sidebarRaw && !ctaHtml && !preludeCompre) {
    return null;
  }

  return { sidebarInfo: sidebarRaw, ctaHtml, mainContent };
}

function splitDetailContent(content: string) {
  const buttons = listButtonAnchors(content);

  const inverted = splitCompreThenContrate(content, buttons);
  if (inverted) {
    return inverted;
  }

  const plaintextSplit =
    buttons.length === 0 ? splitPlaintextSidebarBeforeContrateNotice(content) : null;
  if (plaintextSplit) {
    return plaintextSplit;
  }

  const metadataSplit = buttons.length === 0 ? splitMetadataBeforeFirstHeading(content) : null;
  if (metadataSplit) {
    return metadataSplit;
  }

  return splitAtFirstButton(content);
}

function stripHtmlTags(s: string) {
  return s.replace(/<[^>]+>/g, "");
}

/** Converte blocos HTML típicos do WP em quebras de linha antes de tirar as tags (evita um único <p> gigante). */
function htmlSidebarToPlainWithBreaks(sidebarInfo: string) {
  return sidebarInfo
    .replace(/<\/p>/gi, "\n")
    .replace(/<p\b[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<div\b[^>]*>/gi, "")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n");
}

function getSidebarLines(sidebarInfo: string) {
  const plain = stripHtmlTags(htmlSidebarToPlainWithBreaks(sidebarInfo)).trim();

  if (!plain) {
    return [];
  }

  return plain
    .split(/\n+/)
    .map((block) => block.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

function SidebarInfoLine({ line }: { line: string }) {
  const trimmed = line.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("-")) {
    return <p>{trimmed}</p>;
  }

  const sep = trimmed.indexOf(": ");
  if (sep !== -1) {
    const label = trimmed.slice(0, sep + 1);
    const rest = trimmed.slice(sep + 2).trim();
    return (
      <p>
        <span className="gcv-detail-info-label">{label}</span>
        {rest ? ` ${rest}` : ""}
      </p>
    );
  }

  if (trimmed.endsWith(":")) {
    return (
      <p>
        <span className="gcv-detail-info-label">{trimmed}</span>
      </p>
    );
  }

  return <p>{trimmed}</p>;
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
  const rawDetailImage = page.featuredImage || detailImageByPageSlug[page.slug] || firstImage?.src;
  const detailImage = toPublicAssetUrl(rawDetailImage) ?? rawDetailImage;
  const detailContent = prepareDetailContent(page.content, firstImage?.tag);
  const detailParts = splitDetailContent(detailContent);
  const sidebarLines = getSidebarLines(detailParts.sidebarInfo);
  let mainHtml = rewriteHtmlMediaUrls(detailParts.mainContent);
  const galleryItems = galleryItemsForSlug(page.slug);
  if (galleryItems.length > 0) {
    mainHtml = stripLegacyFusionGalleryFromHtml(mainHtml);
  }
  const ogImage = toPublicAssetUrl(page.featuredImage) ?? toPublicAssetUrl(detailImage) ?? undefined;

  const hasSidebarColumn =
    Boolean(detailImage) || Boolean(detailParts.ctaHtml) || sidebarLines.length > 0;

  return (
    <article className="gcv-detail-page bg-[#f4f6fb] px-4 py-8 md:py-10">
      <Seo
        title={page.seoTitle || page.title}
        description={page.seoDescription || page.excerpt || `Pagina ${page.title}`}
        canonical={`/${page.slug}`}
        ogImage={ogImage}
      />
      <div className="mx-auto max-w-[1180px]">
        <header className="gcv-detail-title">
          <h1>{page.title}</h1>
        </header>

        <section
          className={
            hasSidebarColumn ? "gcv-detail-layout" : "gcv-detail-layout gcv-detail-layout--full"
          }
        >
          {hasSidebarColumn ? (
            <>
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
                    dangerouslySetInnerHTML={{ __html: rewriteHtmlMediaUrls(detailParts.ctaHtml) }}
                  />
                ) : null}
                {sidebarLines.length > 0 ? (
                  <div className="gcv-detail-info">
                    {sidebarLines.map((line, index) => (
                      <SidebarInfoLine key={`${index}-${line.slice(0, 48)}`} line={line} />
                    ))}
                  </div>
                ) : null}
                {page.excerpt ? <p className="gcv-detail-excerpt">{page.excerpt}</p> : null}
              </aside>

              <div className="gcv-detail-content" dangerouslySetInnerHTML={{ __html: mainHtml }} />
            </>
          ) : (
            <div className="gcv-detail-full-main">
              {page.excerpt ? <p className="gcv-detail-excerpt">{page.excerpt}</p> : null}
              <div className="gcv-detail-content gcv-detail-content--wide" dangerouslySetInnerHTML={{ __html: mainHtml }} />
            </div>
          )}
        </section>

        {galleryItems.length > 0 ? (
          <AttractionPhotoGallery pageTitle={page.title} items={galleryItems} />
        ) : null}

        {pageSlugHasWaterfallMap(page.slug) ? (
          <WaterfallRegionMap activePath={`/${page.slug}`} />
        ) : null}
      </div>
    </article>
  );
}
