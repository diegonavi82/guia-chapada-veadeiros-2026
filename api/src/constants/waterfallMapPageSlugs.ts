/**
 * Lista espelho dos slugs em `shared/src/waterfallMap.ts` (fonte única para hotspots).
 * Mantenha os dois arquivos alinhados ao alterar o mapa interativo.
 */
export const WATERFALL_MAP_PAGE_SLUGS = [
  "cachoeira-almecegas-poco-sao-bento-guia-chapada-veadeiros",
  "vale-lua-guia-chapada-veadeiros-sao-jorge",
  "cataratas-dos-couros-guia-chapada-veadeiros-alto-paraiso",
  "cachoeira-cordovil-poco-esmeralda-guia-chapada-veadeiros",
  "cachoeira-segredo-guia-chapada-veadeiros-sao-jorge",
  "cachoeira-cristais-guia-chapada-veadeiros-alto-paraiso",
  "cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-de-goias",
  "cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante",
  "cachoeira-complexo-rio-prata-guia-chapada-veadeiros-cavalcante",
  "cachoeira-macaquinhos-guia-chapada-veadeiros-sao-joao-alianca",
  "cachoeira-label-guia-chapada-veadeiros-sao-joao-alianca",
  "cachoeira-loquinhas-guia-chapada-veadeiros-alto-paraiso",
  "cachoeira-anjos-arcanjos-guia-chapada-veadeiros-alto-paraiso",
  "mirante-janela-cachoeira-abismo-guia-chapada-veadeiros-sao-jorge",
  "parque-nacional-chapada-veadeiros-saltos-rio-preto-sao-jorge",
  "parque-nacional-chapada-veadeiros-canions-carioquinhas-sao-jorge",
  "cachoeira-macacao-guia-chapada-veadeiros-sao-joao-alianca",
] as const;

/**
 * URLs antigas — ex. “poco-san” em vez de “poco-são”. Manter alinhado com `shared/src/pageSlugAliases.ts`.
 */
const PAGE_SLUG_ALIAS_MAP: Readonly<Record<string, string>> = {
  "cachoeira-almecegas-poco-san-bento-guia-chapada-veadeiros":
    "cachoeira-almecegas-poco-sao-bento-guia-chapada-veadeiros",
};

export function resolvePageSlugAlias(slug: string): string {
  const canon = PAGE_SLUG_ALIAS_MAP[slug];
  return typeof canon === "string" ? canon : slug;
}
