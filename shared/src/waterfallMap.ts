/**
 * Slugs das páginas de atrativo ligadas ao mapa oficial (`WaterfallRegionMap`).
 * Mantém uma única fonte de verdade para API + frontend.
 */

export type MapBox = {
  l: number;
  t: number;
  w: number;
  h: number;
};

export type WaterfallMapHotspotDef = {
  slug: string;
  label: string;
  /** % do retângulo da imagem (arte 2022, 1366×600), igual ao `<map>` do WordPress. */
  box: MapBox;
};

/**
 * Hotspots espelhando https://www.guiachapadaveadeiros.com/ (`#image-map`).
 */
export const WATERFALL_MAP_HOTSPOTS: WaterfallMapHotspotDef[] = [
  {
    slug: "cachoeira-almecegas-poco-sao-bento-guia-chapada-veadeiros",
    label: "Cachoeiras Almécegas e Poço São Bento",
    box: { l: 53.51, t: 65.33, w: 9.22, h: 6.33 },
  },
  {
    slug: "vale-lua-guia-chapada-veadeiros-sao-jorge",
    label: "Vale da Lua",
    box: { l: 35.43, t: 70.67, w: 5.42, h: 6 },
  },
  {
    slug: "cataratas-dos-couros-guia-chapada-veadeiros-alto-paraiso",
    label: "Cataratas dos Couros",
    box: { l: 37.48, t: 77.83, w: 7.69, h: 7.33 },
  },
  {
    slug: "cachoeira-cordovil-poco-esmeralda-guia-chapada-veadeiros",
    label: "Cachoeira Cordovil e Poço Esmeralda",
    box: { l: 41.07, t: 66.83, w: 6, h: 5.17 },
  },
  {
    slug: "cachoeira-segredo-guia-chapada-veadeiros-sao-jorge",
    label: "Cachoeira do Segredo",
    box: { l: 27.16, t: 88.5, w: 6.66, h: 4.33 },
  },
  {
    slug: "cachoeira-cristais-guia-chapada-veadeiros-alto-paraiso",
    label: "Cachoeira dos Cristais",
    box: { l: 66.4, t: 49.33, w: 5.27, h: 3 },
  },
  {
    slug: "cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-de-goias",
    label: "Cachoeira Poço Encantado",
    box: { l: 72.99, t: 37.83, w: 11.13, h: 4.17 },
  },
  {
    slug: "cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante",
    label: "Cachoeira Santa Bárbara",
    box: { l: 46.49, t: 4.5, w: 6.66, h: 6.17 },
  },
  {
    slug: "cachoeira-complexo-rio-prata-guia-chapada-veadeiros-cavalcante",
    label: "Complexo de Cachoeiras do Rio da Prata",
    box: { l: 29.65, t: 5.83, w: 8.57, h: 3.67 },
  },
  {
    slug: "cachoeira-macaquinhos-guia-chapada-veadeiros-sao-joao-alianca",
    label: "Cachoeiras dos Macaquinhos",
    box: { l: 89.68, t: 67, w: 9.59, h: 4 },
  },
  {
    slug: "cachoeira-label-guia-chapada-veadeiros-sao-joao-alianca",
    label: "Cachoeira do Label",
    box: { l: 82.36, t: 84.67, w: 4.98, h: 3.67 },
  },
  {
    slug: "cachoeira-loquinhas-guia-chapada-veadeiros-alto-paraiso",
    label: "Cachoeira das Loquinhas",
    box: { l: 66.33, t: 60.33, w: 7.1, h: 3.83 },
  },
  {
    slug: "cachoeira-anjos-arcanjos-guia-chapada-veadeiros-alto-paraiso",
    label: "Cachoeira Anjos e Arcanjos",
    box: { l: 77.6, t: 48.33, w: 10.54, h: 4.33 },
  },
  {
    slug: "mirante-janela-cachoeira-abismo-guia-chapada-veadeiros-sao-jorge",
    label: "Mirante da Janela e Cachoeira do Abismo",
    box: { l: 19.03, t: 57.5, w: 10.61, h: 7.33 },
  },
  {
    slug: "parque-nacional-chapada-veadeiros-saltos-rio-preto-sao-jorge",
    label: "Parque Nacional da Chapada dos Veadeiros - Saltos do Rio Preto",
    box: { l: 25.55, t: 45, w: 7.47, h: 6.67 },
  },
  {
    slug: "parque-nacional-chapada-veadeiros-canions-carioquinhas-sao-jorge",
    label: "Parque Nacional da Chapada dos Veadeiros - Cânions e Cariocas",
    box: { l: 34.85, t: 50.67, w: 7.61, h: 6.67 },
  },
  {
    slug: "cachoeira-macacao-guia-chapada-veadeiros-sao-joao-alianca",
    label: "Cachoeira do Macaco",
    box: { l: 81.55, t: 64.83, w: 7.1, h: 4.17 },
  },
];

export const WATERFALL_MAP_PAGE_SLUGS: readonly string[] = WATERFALL_MAP_HOTSPOTS.map((h) => h.slug);

const slugSet = new Set(WATERFALL_MAP_PAGE_SLUGS);

/** Páginas que têm `<area>` no mapa oficial — exibir mapa no rodapé do guia / catálogo de atrativos. */
export function pageSlugHasWaterfallMap(slug: string): boolean {
  return slugSet.has(slug);
}
