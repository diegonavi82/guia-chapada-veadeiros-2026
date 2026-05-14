import type { RevistaTeaserPost } from "./types";
import { RevistaTeaserCard } from "./RevistaTeaserCard";

export function RevistaListing({ posts, page }: { posts: RevistaTeaserPost[]; page: number }) {
  if (posts.length === 0) return null;

  const highlightFirst = page === 1;

  if (highlightFirst) {
    const [hero, ...rest] = posts;
    return (
      <div className="Revista-editorial-shell">
        <div className="Revista-editorial-top">
          <RevistaTeaserCard post={hero} variant="capa" />
          <aside className="flex flex-col gap-[clamp(14px,2.5vw,22px)]">
            {rest.slice(0, 5).map((p) => (
              <RevistaTeaserCard key={p.id} post={p} variant="lista" />
            ))}
          </aside>
        </div>
        {rest.length > 5 ? (
          <section aria-label="Mais matérias">
            <h2 className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-slate-500">Mais matérias</h2>
            <div className="Revista-editorial-strip Revista-editorial-strip--3">
              {rest.slice(5, 14).map((p) => (
                <RevistaTeaserCard key={p.id} post={p} variant="lista" />
              ))}
            </div>
            {rest.length > 14 ? (
              <div className="mt-6 Revista-editorial-grid">
                {rest.slice(14).map((p) => (
                  <RevistaTeaserCard key={p.id} post={p} variant="lista" />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="Revista-editorial-grid">
      {posts.map((p) => (
        <RevistaTeaserCard key={p.id} post={p} variant="lista" />
      ))}
    </div>
  );
}
