import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { pageSlugHasWaterfallMap } from "../config/waterfallMap";
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

type CatalogPayload = {
  pages: CatalogPage[];
  products: unknown[];
};

type CardItem = {
  slug: string;
  title: string;
  href: string;
  image: string | null;
  meta: string;
};

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toPageCard(p: CatalogPage): CardItem {
  const ex = stripHtml(p.excerpt ?? "");
  const rawImg = p.featuredImage ?? detailImageByPageSlug[p.slug];
  const image = rawImg ? toPublicAssetUrl(rawImg) ?? rawImg : null;
  const fallbackMeta = "Trilhas, mirantes e natureza";
  const meta = ex.length > 0 ? (ex.length > 100 ? `${ex.slice(0, 97)}…` : ex) : fallbackMeta;

  return {
    slug: p.slug,
    title: p.title,
    href: `/${p.slug}`,
    image,
    meta: meta.toUpperCase(),
  };
}

function sortCards(items: CardItem[]) {
  return [...items].sort((a, b) => a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }));
}

export function Attractions() {
  const [payload, setPayload] = useState<CatalogPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const visibleCards = useMemo(() => {
    const pages = payload?.pages ?? [];
    const onMap = pages.filter((p) => pageSlugHasWaterfallMap(p.slug));
    return sortCards(onMap.map(toPageCard));
  }, [payload?.pages]);

  const fallbackImg = wpUploadsAssets.parqueNacionalSalto;

  return (
    <>
      <Seo
        title="Atrativos | Guia Chapada Veadeiros"
        description="Cachoeiras, trilhas e mirantes do mapa oficial da Chapada dos Veadeiros."
        canonical="/atrativos"
      />
      <section className="official-home-shell px-4 pb-16 pt-9">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-[1.75rem] border border-white/40 bg-white/90 p-5 shadow-xl shadow-slate-400/15 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-[11px]">
                  Mapa oficial
                </span>
                <h1 className="mt-3 max-w-[24ch] text-balance text-2xl font-black leading-[1.12] text-slate-900 sm:max-w-none md:text-4xl lg:text-[2.65rem]">
                  Atrativos da Chapada
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
                  Os mesmos destaques clicáveis do mapa interativo — cachoeiras, trilhas e mirantes cadastrados
                  no guia.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <span className="text-xs text-slate-500 tabular-nums">{visibleCards.length} atrativos</span>
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
                    key={item.slug}
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
                      Atrativos
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
              <p className="mt-8 text-center text-slate-600">Nenhum atrativo encontrado no mapa.</p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
