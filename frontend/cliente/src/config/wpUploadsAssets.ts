/**
 * Caminhos públicos das fotos migradas do WordPress (pasta
 * `frontend/cliente/public/wp-content/uploads/...`).
 * Evita placeholders idênticos em `/imagens/*.jpg`.
 */
export const wpUploadsAssets = {
  /** Logo do header (WP uploads, mesmo arquivo do site ao vivo). */
  siteLogo: "/wp-content/uploads/2024/05/Logo-Guia-Chapada-Veadeiros-2024.jpg",
  parqueNacionalSalto:
    "/wp-content/uploads/2019/09/parque-nacional-guia-chapada-veadeiros-saltos-rio-preto-garimpao.jpg",
  almecegas: "/wp-content/uploads/2019/09/cachoeira-almecegas-guia-chapada-veadeiros-alto-paraiso-10.jpg",
  valeLua: "/wp-content/uploads/2019/09/vale-lua-guia-chapada-veadeiros-sao-jorge-1.jpg",
  couros: "/wp-content/uploads/2019/10/cataratas-couros-guia-chapada-veadeiros-alto-paraiso-11.jpg",
  santaBarbara: "/wp-content/uploads/2019/10/cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante.jpg",
  segredo: "/wp-content/uploads/2019/10/cachoeira-segredo-guia-chapada-veadeiros-sao-jorge-10.jpg",
  cristais: "/wp-content/uploads/2019/11/cachoeira-cristais-veu-noiva-guia-chapada-veadeiros-alto-paraiso.jpg",
  pocoEncantado: "/wp-content/uploads/2019/10/cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-4.jpg",
  macaquinhos: "/wp-content/uploads/2019/11/cachoeira-macaquinhos-guia-chapada-veadeiros-6.jpg",
  mapaCachoeiras2020: "/wp-content/uploads/2020/01/guia-chapada-veadeiros-mapa-cachoeiras-2020.jpg",
} as const;

/** Destaque por slug de página (fallback quando a API não tem featured_image). */
export const detailImageByPageSlug: Record<string, string> = {
  "cachoeira-almecegas-poco-sao-bento-guia-chapada-veadeiros": wpUploadsAssets.almecegas,
  "vale-lua-guia-chapada-veadeiros-sao-jorge": wpUploadsAssets.valeLua,
  "cataratas-dos-couros-guia-chapada-veadeiros-alto-paraiso": wpUploadsAssets.couros,
  "cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante": wpUploadsAssets.santaBarbara,
  "cachoeira-segredo-guia-chapada-veadeiros-sao-jorge": wpUploadsAssets.segredo,
  "cachoeira-cristais-guia-chapada-veadeiros-alto-paraiso": wpUploadsAssets.cristais,
  "cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-de-goias": wpUploadsAssets.pocoEncantado,
  "cachoeira-macaquinhos-guia-chapada-veadeiros-sao-joao-alianca": wpUploadsAssets.macaquinhos,
};
