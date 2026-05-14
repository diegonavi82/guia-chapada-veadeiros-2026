const SEO_TITLE_MIN = 30;
const SEO_TITLE_MAX = 70;
const SEO_DESC_MIN = 120;
const SEO_DESC_MAX = 170;

export type PublishPostPayload = {
  excerpt?: string | null;
  slug: string;
  content: string;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  seoFocusKeyword?: string | null;
};

export function collectPostPublishIssues(payload: PublishPostPayload): string[] {
  const issues: string[] = [];
  const t = payload.seoTitle?.trim();
  const d = payload.seoDescription?.trim();
  const kw = payload.seoFocusKeyword?.trim();
  const keywordsMeta = payload.seoKeywords?.trim();
  const img = payload.featuredImage?.trim();
  const imgAlt = payload.featuredImageAlt?.trim();

  if (!t || t.length < SEO_TITLE_MIN || t.length > SEO_TITLE_MAX) {
    issues.push(
      `SEO: título (meta title) precisa ter entre ${SEO_TITLE_MIN} e ${SEO_TITLE_MAX} caracteres (atual: ${t?.length ?? 0}).`,
    );
  }
  if (!d || d.length < SEO_DESC_MIN || d.length > SEO_DESC_MAX) {
    issues.push(
      `SEO: meta description precisa ter entre ${SEO_DESC_MIN} e ${SEO_DESC_MAX} caracteres (atual: ${d?.length ?? 0}).`,
    );
  }
  if (!kw || kw.length < 2 || kw.length > 120) {
    issues.push(`SEO: frase chave de foco obrigatória (até 120 caracteres).`);
  }

  const normalizedKw = kw?.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const nt = t?.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "";
  const nd = d?.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "";
  const ns = payload.slug.replace(/-/g, " ").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (normalizedKw) {
    if (!nt.includes(normalizedKw)) {
      issues.push("SEO: a frase chave deve aparecer no título SEO.");
    }
    if (!nd.includes(normalizedKw)) {
      issues.push("SEO: a frase chave deve aparecer na meta description.");
    }
    const slugWordsMatch =
      normalizedKw.split(/\s+/).filter(Boolean).every((segment) => segment.length <= 2 || ns.includes(segment)) &&
      /\S/.test(ns);
    if (!slugWordsMatch) {
      issues.push("SEO: as palavras da frase chave devem aparecer no slug (endereço amigável).");
    }
  }

  if (!keywordsMeta || keywordsMeta.length < 24) {
    issues.push(`SEO: palavras chave (meta keywords) obrigatórias — sugira pelo menos algumas vírgulas (mín. 24 caracteres).`);
  }

  if (!payload.excerpt?.trim() || payload.excerpt.trim().length < 40) {
    issues.push(`Resumo/excerpt público obrigatório para publicação (mínimo 40 caracteres).`);
  }

  const rawContent = payload.content ?? "";
  const textContent = rawContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = textContent ? textContent.split(/\s+/).length : 0;
  if (words < 200) {
    issues.push(`Conteúdo muito curto para publicação (mínimo ~200 palavras; atual ~${words}).`);
  }

  if (img) {
    if (!imgAlt || imgAlt.length < 24) {
      issues.push(`Imagem destacada informada — preencha o texto alternativo (ALT) com pelo menos 24 caracteres.`);
    }
  } else {
    issues.push(`Imagem destacada obrigatória para publicar na Revista (URL da imagem).`);
  }

  if (!/<\/h[23]>|<h[23]\b/i.test(rawContent) && !/^#{2,3}\s/m.test(rawContent)) {
    issues.push("Use pelo menos uma seção com subtítulo no conteúdo (H2 ou H3) para estrutura e SEO.");
  }

  if (/<img\b/i.test(rawContent)) {
    const imgTags = rawContent.match(/<img\b[^>]*>/gi) ?? [];
    const missingAlt = imgTags.some((tag) => !/\balt=["'][^"']{4,}["']/i.test(tag));
    if (missingAlt) {
      issues.push("Imagens no corpo do HTML precisam de atributo alt com pelo menos 4 caracteres.");
    }
  }

  return issues;
}
