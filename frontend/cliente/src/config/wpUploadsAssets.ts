/**
 * Caminhos públicos das fotos estáticas em `frontend/cliente/public/imagens/`.
 */
export const wpUploadsAssets = {
  /** Logo do header (WP uploads, mesmo arquivo do site ao vivo). */
  siteLogo: "/imagens/Logo-Guia-Chapada-Veadeiros-2024.jpg",
  parqueNacionalSalto: "/imagens/parque-nacional-guia-chapada-veadeiros-saltos-rio-preto-garimpao.jpg",
  almecegas: "/imagens/cachoeira-almecegas-guia-chapada-veadeiros-alto-paraiso-10.jpg",
  valeLua: "/imagens/vale-lua-guia-chapada-veadeiros-sao-jorge-1.jpg",
  /** Hero home — 2.º slide (“Em breve” / lista de espera). */
  heroSlideEmBreve: "/imagens/hero-slide-02-em-breve-cachoeira.png",
  couros: "/imagens/cataratas-couros-guia-chapada-veadeiros-alto-paraiso-11.jpg",
  santaBarbara: "/imagens/cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante.jpg",
  segredo: "/imagens/cachoeira-segredo-guia-chapada-veadeiros-sao-jorge-10.jpg",
  cristais: "/imagens/cachoeira-cristais-veu-noiva-guia-chapada-veadeiros-alto-paraiso.jpg",
  pocoEncantado: "/imagens/cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-4.jpg",
  macaquinhos: "/imagens/cachoeira-macaquinhos-guia-chapada-veadeiros-6.jpg",
  /** Mesma arte do mapa interativo em produção (`imagem` + `<map>` em guiachapadaveadeiros.com). */
  mapaCachoeiras2022: "/imagens/cachoeiras-guia-chapada-veadeiros-2022.jpg",
  mapaCachoeiras2020: "/imagens/guia-chapada-veadeiros-mapa-cachoeiras-2020.jpg",
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
