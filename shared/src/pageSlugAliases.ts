/**
 * URLs antigas do WordPress / erros comuns (“san” vs “são”) devem resolver na página publicada em `slug`.
 */
export const PAGE_SLUG_ALIASES: Readonly<Record<string, string>> = {
  "cachoeira-almecegas-poco-san-bento-guia-chapada-veadeiros":
    "cachoeira-almecegas-poco-sao-bento-guia-chapada-veadeiros",
};

export function resolvePageSlugAlias(slug: string): string {
  const target = PAGE_SLUG_ALIASES[slug];
  return typeof target === "string" ? target : slug;
}
