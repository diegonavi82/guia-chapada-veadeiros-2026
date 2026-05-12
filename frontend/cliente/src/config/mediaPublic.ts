/**
 * Mesma base que MEDIA_PUBLIC_URL na API (imagens públicas no R2 / site).
 * Opcional: defina VITE_MEDIA_PUBLIC_URL no .env da raiz do monorepo.
 */
export const mediaPublicBase =
  (import.meta.env.VITE_MEDIA_PUBLIC_URL as string | undefined)?.replace(/\/$/, "") ??
  "https://www.guiachapadaveadeiros.com/imagens";
