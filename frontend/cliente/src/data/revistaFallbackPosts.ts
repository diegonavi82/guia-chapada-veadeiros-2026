import type { RevistaTeaserPost } from "../components/revista/types";

/**
 * Quando `/posts` da API falha (ex.: backend parado em dev), estas entradas
 * mantêm a Revista navegável. Título e foto de destaque podem vir de
 * `revistaListOverridesBySlug` no RevistaTeaserCard.
 */
export const REVISTA_FALLBACK_POSTS: RevistaTeaserPost[] = [
  {
    id: 9_001_027,
    title: "Matéria no site (sem API)",
    slug: "melhor-epoca-visitar-chapada-dos-veadeiros",
    excerpt:
      "Chuva ou seca? Chuveirinhos, melhores meses, temperatura da água e cachoeiras sazonais — guia completo para planejar sua visita.",
    featuredImage: null,
    seoDescription:
      "Período de chuvas x seca, maio como melhor mês, floração do cerrado e FAQ — matéria completa no próprio frontend.",
    publishedAt: "2026-05-13T16:00:00.000Z",
    categories: [{ name: "Dicas", slug: "dicas" }],
  },
  {
    id: 9_001_026,
    title: "Matéria no site (sem API)",
    slug: "contratar-guia-local-chapada-veadeiros",
    excerpt:
      "Aproveite mais, preocupe-se menos e viva experiências inesquecíveis com segurança",
    featuredImage: null,
    seoDescription:
      "Riscos reais sem guia, benefícios de um condutor local e registos fotográficos — matéria completa no próprio frontend.",
    publishedAt: "2026-05-13T14:00:00.000Z",
    categories: [{ name: "Dicas", slug: "dicas" }],
  },
];
