import type { RevistaTeaserPost } from "../components/revista/types";

function teaserSortTime(p: RevistaTeaserPost): number {
  const t = p.publishedAt;
  if (!t) return 0;
  const n = Date.parse(t);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Une resultados da API com teasers estáticos (mesmos slugs das rotas em AppRoutes).
 * Cada slug da API prevalece sobre o fallback.
 */
export function mergeRevistaTeaserPosts(
  fromApi: RevistaTeaserPost[],
  fallback: RevistaTeaserPost[],
): RevistaTeaserPost[] {
  const bySlug = new Map<string, RevistaTeaserPost>();
  for (const p of fromApi) {
    bySlug.set(p.slug, p);
  }
  for (const p of fallback) {
    if (!bySlug.has(p.slug)) {
      bySlug.set(p.slug, p);
    }
  }
  return [...bySlug.values()].sort((a, b) => teaserSortTime(b) - teaserSortTime(a));
}
