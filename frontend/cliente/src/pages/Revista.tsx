import { useEffect, useState } from "react";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";
import { REVISTA_FALLBACK_POSTS } from "../data/revistaFallbackPosts";
import { mergeRevistaTeaserPosts } from "../data/mergeRevistaTeaserPosts";
import { RevistaListing } from "../components/revista/RevistaListing";
import type { RevistaTeaserPost } from "../components/revista/types";

const REVISTA_LIST_PER_PAGE = 24;

export function Revista() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<RevistaTeaserPost[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");
    setUsingFallback(false);
    apiGet<{ items: RevistaTeaserPost[]; total: number }>(
      `/posts?page=${page}&perPage=${REVISTA_LIST_PER_PAGE}`,
    )
      .then((data) => {
        if (cancelled) return;
        const fillStatic =
          page === 1 && data.total < REVISTA_FALLBACK_POSTS.length;
        const items = fillStatic
          ? mergeRevistaTeaserPosts(data.items, REVISTA_FALLBACK_POSTS)
          : data.items;
        setPosts(items);
        setTotal(fillStatic ? Math.max(data.total, items.length) : data.total);
        setUsingFallback(false);
      })
      .catch(() => {
        if (cancelled) return;
        /** API indisponível (ex.: `npm run dev` só no cliente): lista mínima com rotas estáticas. */
        if (page !== 1) {
          setError("Sem ligação à API — a paginação extra não está disponível offline.");
          setPosts([]);
          setTotal(0);
          return;
        }
        setPosts(mergeRevistaTeaserPosts([], REVISTA_FALLBACK_POSTS));
        setTotal(REVISTA_FALLBACK_POSTS.length);
        setUsingFallback(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const lastPage = Math.max(1, Math.ceil(total / REVISTA_LIST_PER_PAGE));

  return (
    <div className="Revista-page">
      <Seo
        title="Revista Chapada dos Veadeiros"
        description="Notícias, roteiros, natureza e cultura na Chapada dos Veadeiros — matérias atualizadas do Guia Chapada."
        canonical="/revista"
        keywords="Chapada dos Veadeiros, notícias, ecoturismo, cachoeiras, alto paraíso, são jorge, revista chapada"
      />
      <header className="Revista-masthead">
        <h1 className="Revista-masthead__title">Revista</h1>
        <p className="Revista-masthead__sub">
          Tudo sobre a Chapada dos Veadeiros: dicas, trilhas, eventos, bastidores e o melhor do destino em um só lugar.
        </p>
      </header>
      {usingFallback && !isLoading ? (
        <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Modo local:</strong> a API em <code className="rounded bg-white/80 px-1">VITE_API_BASE_URL</code> não
          respondeu (por omissão <code className="rounded bg-white/80 px-1">http://localhost:3333/api</code>). A mostrar{" "}
          matérias servidas pelo próprio site. Para ver a lista completa, arranque o backend da API neste projeto.
        </p>
      ) : null}
      {isLoading ? <p className="text-slate-600">Carregando matérias…</p> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {!isLoading && !error && posts.length === 0 ? (
        <p className="text-slate-600">Nenhuma matéria publicada por enquanto.</p>
      ) : null}
      {!isLoading && !error && posts.length > 0 ? <RevistaListing posts={posts} page={page} /> : null}
      {!isLoading && !error && lastPage > 1 ? (
        <nav aria-label="Paginação da Revista" className="Revista-pagination">
          <button disabled={page <= 1} type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Anterior
          </button>
          <span className="text-sm font-bold text-slate-600">
            Página {page} de {lastPage}
          </span>
          <button disabled={page >= lastPage} type="button" onClick={() => setPage((p) => p + 1)}>
            Próxima →
          </button>
        </nav>
      ) : null}
    </div>
  );
}
