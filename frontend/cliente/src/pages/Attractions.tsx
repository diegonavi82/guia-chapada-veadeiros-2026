import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { detailImageByPageSlug, wpUploadsAssets } from "../config/wpUploadsAssets";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";
import { toPublicAssetUrl } from "../utils/localMediaUrl";

type CatalogPage = {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
};

type CatalogProduct = {
  slug: string;
  title: string;
  shortDescription: string | null;
  featuredImage: string | null;
  price: string | number | null;
};

type CatalogPayload = {
  pages: CatalogPage[];
  products: CatalogProduct[];
};

type CardKind = "page" | "product";

type CardItem = {
  kind: CardKind;
  slug: string;
  title: string;
  href: string;
  image: string | null;
  meta: string;
  label: string;
};

type FilterKey = "all" | "nature" | "tours";

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isNonAttractionPage(p: CatalogPage): boolean {
  const s = p.slug.toLowerCase();
  return /hospedagem|contato|politica|privacidade|termo|obrigad|thank|sample|faq|loja|blog|artigo|gcv-artigo|contratar-guia|demonstrativo/i.test(
    s,
  );
}

function isNatureAttraction(p: CatalogPage): boolean {
  if (isNonAttractionPage(p)) {
    return false;
  }
  const blob = `${p.slug} ${p.title}`.toLowerCase();
  return /(cachoeira|cachoeiras|vale-|mirante|parque-|catarata|poco-|po[cç]o-|macaquinhos|loquinhas|\bsegredo\b|cristais|couros|carioquinha|anjo|arcanjos|cordovil|rio-prata|saltos|encantad|santa-barbara|teresina|cavalcante|c[aâ]nion|cano\b|trilha|rio preto|garimp|janela|abismo|lobe)/i.test(
    blob,
  );
}

function formatPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const n = typeof value === "string" ? Number(value) : Number(value);
  if (Number.isNaN(n)) {
    return "";
  }
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function toProductCard(p: CatalogProduct): CardItem {
  const sd = stripHtml(p.shortDescription ?? "");
  const priceStr = formatPrice(p.price);
  let meta =
    sd.length > 0 ? (sd.length > 90 ? `${sd.slice(0, 87)}…` : sd) : "Roteiros e experiências com guia";
  if (priceStr) {
    meta = `${meta} · ${priceStr}`;
  }
  const rawImg = p.featuredImage;
  const image = rawImg ? toPublicAssetUrl(rawImg) ?? rawImg : null;

  return {
    kind: "product",
    slug: p.slug,
    title: p.title,
    href: `/passeios/${p.slug}`,
    image,
    meta: meta.toUpperCase(),
    label: "Passeio",
  };
}

function toPageCard(p: CatalogPage): CardItem {
  const natureFlag = !isNonAttractionPage(p) && isNatureAttraction(p);
  const ex = stripHtml(p.excerpt ?? "");
  const rawImg = p.featuredImage ?? detailImageByPageSlug[p.slug];
  const image = rawImg ? toPublicAssetUrl(rawImg) ?? rawImg : null;
  const fallbackMeta = natureFlag ? "Trilhas, mirantes e natureza" : "Página no guia";
  const meta = ex.length > 0 ? (ex.length > 100 ? `${ex.slice(0, 97)}…` : ex) : fallbackMeta;

  return {
    kind: "page",
    slug: p.slug,
    title: p.title,
    href: `/${p.slug}`,
    image,
    meta: meta.toUpperCase(),
    label: natureFlag ? "Atrativo natural" : "Guia",
  };
}

function sortCards(items: CardItem[]) {
  return [...items].sort((a, b) => a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }));
}

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "nature", label: "Cachoeiras e natureza" },
  { key: "tours", label: "Passeios" },
];

export function Attractions() {
  const [payload, setPayload] = useState<CatalogPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    let alive = true;
    apiGet<CatalogPayload>("/catalog/attractions")
      .then((data) => {
        if (alive) {
          setPayload(data);
          setError(null);
        }
      })
      .catch(() => {
        if (alive) {
          setError("Não foi possível carregar os atrativos. Verifique se a API está no ar.");
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const productCards = useMemo(() => (payload?.products ?? []).map(toProductCard), [payload?.products]);

  const listablePages = useMemo(
    () => (payload?.pages ?? []).filter((p) => !isNonAttractionPage(p)),
    [payload?.pages],
  );

  const allCards = useMemo(
    () => sortCards([...listablePages.map(toPageCard), ...productCards]),
    [listablePages, productCards],
  );

  const natureCards = useMemo(
    () => sortCards(listablePages.filter(isNatureAttraction).map(toPageCard)),
    [listablePages],
  );

  const toursCardsSorted = useMemo(() => sortCards(productCards), [productCards]);

  const visibleCards = useMemo(() => {
    if (filter === "nature") {
      return natureCards;
    }
    if (filter === "tours") {
      return toursCardsSorted;
    }
    return allCards;
  }, [filter, allCards, natureCards, toursCardsSorted]);

  const fallbackImg = wpUploadsAssets.parqueNacionalSalto;

  return (
    <>
      <Seo
        title="Atrativos | Guia Chapada Veadeiros"
        description="Cachoeiras, trilhas, mirantes e passeios com guia na Chapada dos Veadeiros — lista completa."
        canonical="/atrativos"
      />
      <section className="official-home-shell px-4 pb-16 pt-9">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-[1.75rem] border border-white/40 bg-white/90 p-5 shadow-xl shadow-slate-400/15 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-[11px]">
                  Atrações imperdíveis
                </span>
                <h1 className="mt-3 max-w-[24ch] text-balance text-2xl font-black leading-[1.12] text-slate-900 sm:max-w-none md:text-4xl lg:text-[2.65rem]">
                  Todos os atrativos da Chapada
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
                  Cachoeiras, trilhas e passeios cadastrados no guia — o mesmo visual da página inicial, em grade
                  completa para você explorar.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFilter(opt.key)}
                  className={
                    filter === opt.key
                      ? "rounded-full bg-[#e58b55] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-md"
                      : "rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-[#df8350] hover:text-[#df8350]"
                  }
                >
                  {opt.label}
                </button>
              ))}
              <span className="text-xs text-slate-500 ml-auto tabular-nums self-center">{visibleCards.length} itens</span>
            </div>

            {error ? (
              <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">{error}</p>
            ) : null}

            {!payload && !error ? (
              <div className="mt-10 grid animate-pulse gap-4 md:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="h-72 rounded-2xl bg-slate-200/80" />
                ))}
              </div>
            ) : null}

            {payload && !error ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleCards.map((item) => (
                  <Link
                    key={`${item.kind}-${item.slug}`}
                    to={item.href}
                    className="group relative h-72 overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-black/5 transition hover:shadow-2xl"
                  >
                    <img
                      src={item.image ?? fallbackImg}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.endsWith(fallbackImg)) {
                          return;
                        }
                        img.src = fallbackImg;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/25 to-transparent" />
                    <span className="absolute left-3 top-3 max-w-[85%] truncate rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-semibold text-slate-900 shadow-md sm:text-[10px]">
                      {item.label}
                    </span>
                    <h2 className="gcv-card-photo-text absolute bottom-5 left-4 right-4 text-balance text-base font-black leading-snug text-white sm:text-lg">
                      {item.title}
                    </h2>
                    <p className="gcv-card-photo-text absolute bottom-2 left-4 right-4 line-clamp-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-white/85 sm:text-[11px]">
                      {item.meta}
                    </p>
                  </Link>
                ))}
              </div>
            ) : null}

            {payload && visibleCards.length === 0 && !error ? (
              <p className="mt-8 text-center text-slate-600">Nenhum item neste filtro.</p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
