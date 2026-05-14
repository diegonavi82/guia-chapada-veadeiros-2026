import { useEffect, useState } from "react";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";
import { RevistaListing } from "../components/revista/RevistaListing";
import type { RevistaTeaserPost } from "../components/revista/types";

const REVISTA_LIST_PER_PAGE = 24;

export function Revista() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<RevistaTeaserPost[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");
    apiGet<{ items: RevistaTeaserPost[]; total: number }>(
      `/posts?page=${page}&perPage=${REVISTA_LIST_PER_PAGE}`,
    )
      .then((data) => {
        setPosts(data.items);
        setTotal(data.total);
      })
      .catch(() => setError("Não foi possível carregar a Revista. Verifique se a API está disponível."))
      .finally(() => setIsLoading(false));
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
          Histórias, serviços e bastidores do destino — visão urbana‑portal com ritmo chapada dos veadeiros: capa forte,
          trilho lateral e densidade tipo grandes portais brasileiros.
        </p>
      </header>
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
