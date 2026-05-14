import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: "../.env" });
dotenv.config({ path: "../../.env" });

const prisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("Configure ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar seed.");
}

const passwordHash = await bcrypt.hash(password, 12);

const admin = await prisma.user.upsert({
  where: { email },
  update: { passwordHash, role: "ADMIN" },
  create: {
    email,
    name: "Administrador",
    passwordHash,
    role: "ADMIN",
  },
});

const seedDir = dirname(fileURLToPath(import.meta.url));
const contratarGuiaHtmlPath = join(seedDir, "seeds", "contratar-guia-chapada-body.html");
const contratarGuiaContent = readFileSync(contratarGuiaHtmlPath, "utf8");

/** Matéria editorial completa — publicada na Revista e na home (`/posts/latest`). */
const contratarGuiaSlug = "contratar-guia-local-chapada-veadeiros";
/** Mesmas fotos que `ContratarGuiaArtigo` em `public/uploads/revista/contratar-guia-artigo/`. */
const contratarFeaturedRevistaJpg =
  "/uploads/revista/contratar-guia-artigo/hero-mirante-grupo-guia-local-chapada-veadeiros.png";
const contratarFeaturedAlt =
  "Grupo em selfie em mirante de madeira sobre vale verde com cachoeiras na Chapada dos Veadeiros — passeio guiado com guia Cadastur";
/** Conteúdo completo no frontend (`ArtigoMelhorEpoca`); o HTML aqui é resumo para a API. */
const melhorEpocaSlug = "melhor-epoca-visitar-chapada-dos-veadeiros";

const melhorEpocaContent = `<p>Guia mês a mês sobre chuva e seca na Chapada dos Veadeiros, floração dos chuveirinhos (Paepalanthus), temperatura da água e cachoeiras sazonais.</p>
<p><strong>Ler a matéria completa no site:</strong> a versão publicada com todas as fotos e tabelas está em <code>/revista/${melhorEpocaSlug}</code>.</p>`;

const categoryDicas = await prisma.category.upsert({
  where: { slug: "dicas" },
  update: {},
  create: { name: "Dicas", slug: "dicas" },
});

const contratarGuiaPost = await prisma.post.upsert({
  where: { slug: contratarGuiaSlug },
  update: {
    title: "Por que é tão importante contratar um guia em passeios por trilhas e natureza",
    excerpt:
      "Contratar um guia de turismo não é um luxo — é a diferença entre um passeio seguro e memorável e uma aventura que pode terminar mal. Entenda por que um condutor credenciado é indispensável na Chapada dos Veadeiros.",
    content: contratarGuiaContent,
    featuredImage: contratarFeaturedRevistaJpg,
    featuredImageAlt: contratarFeaturedAlt,
    seoTitle: "Contratar guia Chapada Veadeiros: segurança em trilhas e natureza",
    seoDescription:
      "Contratar guia Chapada Veadeiros garante segurança em trilhas e cachoeiras, fotos melhores e roteiro completo — incluindo piscinas naturais e formações rochosas só o guia local conduz bem. Saiba por que um credenciado faz diferença.",
    seoKeywords:
      "contratar guia chapada dos veadeiros, guia de turismo chapada veadeiros, condutor de visitantes chapada, por que contratar guia trilhas, passeios guiados alto paraíso, guia local chapada veadeiros, Diego Navi guia chapada, contratar guia natureza, piscina natural chapada dos veadeiros, Diego Navi Chapada dos Veadeiros, reflexo do céu poça natural cerrado, guia local fotos Chapada",
    seoFocusKeyword: "contratar guia chapada veadeiros",
    ogTitle: "Contratar guia Chapada Veadeiros: segurança em trilhas e natureza",
    ogDescription:
      "Segurança, fotos marcantes e roteiro completo na Chapada dos Veadeiros — piscinas naturais e formações só o guia local conduz bem. Saiba por que um credenciado faz diferença.",
    seoRobots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    status: "PUBLISHED",
    publishedAt: new Date("2026-05-13T15:00:00.000Z"),
    authorId: admin.id,
    categories: { set: [{ id: categoryDicas.id }] },
  },
  create: {
    title: "Por que é tão importante contratar um guia em passeios por trilhas e natureza",
    slug: contratarGuiaSlug,
    excerpt:
      "Contratar um guia de turismo não é um luxo — é a diferença entre um passeio seguro e memorável e uma aventura que pode terminar mal. Entenda por que um condutor credenciado é indispensável na Chapada dos Veadeiros.",
    content: contratarGuiaContent,
    featuredImage: contratarFeaturedRevistaJpg,
    featuredImageAlt: contratarFeaturedAlt,
    seoTitle: "Contratar guia Chapada Veadeiros: segurança em trilhas e natureza",
    seoDescription:
      "Contratar guia Chapada Veadeiros garante segurança em trilhas e cachoeiras, fotos melhores e roteiro completo — incluindo piscinas naturais e formações rochosas só o guia local conduz bem. Saiba por que um credenciado faz diferença.",
    seoKeywords:
      "contratar guia chapada dos veadeiros, guia de turismo chapada veadeiros, condutor de visitantes chapada, por que contratar guia trilhas, passeios guiados alto paraíso, guia local chapada veadeiros, Diego Navi guia chapada, contratar guia natureza, piscina natural chapada dos veadeiros, Diego Navi Chapada dos Veadeiros, reflexo do céu poça natural cerrado, guia local fotos Chapada",
    seoFocusKeyword: "contratar guia chapada veadeiros",
    ogTitle: "Contratar guia Chapada Veadeiros: segurança em trilhas e natureza",
    ogDescription:
      "Segurança, fotos marcantes e roteiro completo na Chapada dos Veadeiros — piscinas naturais e formações só o guia local conduz bem. Saiba por que um credenciado faz diferença.",
    seoRobots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    status: "PUBLISHED",
    publishedAt: new Date("2026-05-13T15:00:00.000Z"),
    authorId: admin.id,
    categories: { connect: [{ id: categoryDicas.id }] },
  },
});

const melhorEpocaPost = await prisma.post.upsert({
  where: { slug: melhorEpocaSlug },
  update: {
    title: "Melhor época para visitar a Chapada dos Veadeiros: guia completo mês a mês",
    excerpt:
      "Chuva ou seca? Chuveirinhos em flor, melhores meses, temperatura da água e cachoeiras sazonais — tudo para planejar sua visita.",
    content: melhorEpocaContent,
    featuredImage: "/uploads/artigos/melhor-epoca/guia-diego-navi-palipalan-via-lactea-chapada-veadeiros.png",
    featuredImageAlt:
      "Guia Diego Navi entre chuveirinhos do cerrado sob a Via Láctea na Chapada dos Veadeiros — foto de Márcio Cabral",
    seoTitle: "Melhor época Chapada dos Veadeiros: guia mês a mês (chuva, seca, chuveirinhos)",
    seoDescription:
      "Melhor mês para visitar a Chapada dos Veadeiros, período de chuvas x seca, floração do cerrado, temperatura da água e cachoeiras que secam — guia prático.",
    seoKeywords:
      "melhor época chapada dos veadeiros, melhor mês chapada dos veadeiros, quando visitar chapada dos veadeiros, período de chuvas chapada veadeiros, período de seca chapada veadeiros, chuveirinho cerrado chapada, palipalan chapada veadeiros",
    seoFocusKeyword: "melhor época chapada dos veadeiros",
    ogTitle: "Melhor época para visitar a Chapada dos Veadeiros: guia mês a mês",
    ogDescription:
      "Chuva ou seca? Chuveirinhos, temperatura da água e dicas para planejar sua visita perfeita à Chapada dos Veadeiros.",
    seoRobots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    status: "PUBLISHED",
    publishedAt: new Date("2026-05-13T16:00:00.000Z"),
    authorId: admin.id,
    categories: { set: [{ id: categoryDicas.id }] },
  },
  create: {
    title: "Melhor época para visitar a Chapada dos Veadeiros: guia completo mês a mês",
    slug: melhorEpocaSlug,
    excerpt:
      "Chuva ou seca? Chuveirinhos em flor, melhores meses, temperatura da água e cachoeiras sazonais — tudo para planejar sua visita.",
    content: melhorEpocaContent,
    featuredImage: "/uploads/artigos/melhor-epoca/guia-diego-navi-palipalan-via-lactea-chapada-veadeiros.png",
    featuredImageAlt:
      "Guia Diego Navi entre chuveirinhos do cerrado sob a Via Láctea na Chapada dos Veadeiros — foto de Márcio Cabral",
    seoTitle: "Melhor época Chapada dos Veadeiros: guia mês a mês (chuva, seca, chuveirinhos)",
    seoDescription:
      "Melhor mês para visitar a Chapada dos Veadeiros, período de chuvas x seca, floração do cerrado, temperatura da água e cachoeiras que secam — guia prático.",
    seoKeywords:
      "melhor época chapada dos veadeiros, melhor mês chapada dos veadeiros, quando visitar chapada dos veadeiros, período de chuvas chapada veadeiros, período de seca chapada veadeiros, chuveirinho cerrado chapada, palipalan chapada veadeiros",
    seoFocusKeyword: "melhor época chapada dos veadeiros",
    ogTitle: "Melhor época para visitar a Chapada dos Veadeiros: guia mês a mês",
    ogDescription:
      "Chuva ou seca? Chuveirinhos, temperatura da água e dicas para planejar sua visita perfeita à Chapada dos Veadeiros.",
    seoRobots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    status: "PUBLISHED",
    publishedAt: new Date("2026-05-13T16:00:00.000Z"),
    authorId: admin.id,
    categories: { connect: [{ id: categoryDicas.id }] },
  },
});

/** Remove outros posts na base de dados (ex.: importações antigas) — mantém apenas matérias servidas pelo frontend na Revista. */
const postsToStrip = await prisma.post.findMany({
  where: { slug: { notIn: [contratarGuiaSlug, melhorEpocaSlug] } },
  select: { id: true },
});
const orphanIds = postsToStrip.map((p: { id: number }) => p.id);
if (orphanIds.length > 0) {
  await prisma.seoMetadata.deleteMany({
    where: {
      entityType: "POST",
      entityId: { in: orphanIds },
    },
  });
  await prisma.post.deleteMany({ where: { id: { in: orphanIds } } });
  console.log(`Posts removidos (não é a matéria atual): ${orphanIds.length}`);
}

const robotsSeo = (contratarGuiaPost.seoRobots?.trim() || "index,follow").slice(0, 96);

await prisma.seoMetadata.upsert({
  where: {
    entityType_entityId: {
      entityType: "POST",
      entityId: contratarGuiaPost.id,
    },
  },
  create: {
    entityType: "POST",
    entityId: contratarGuiaPost.id,
    canonicalUrl: `/revista/${contratarGuiaSlug}`,
    seoTitle: contratarGuiaPost.seoTitle,
    seoDescription: contratarGuiaPost.seoDescription,
    ogImage: contratarGuiaPost.featuredImage,
    robots: robotsSeo,
  },
  update: {
    canonicalUrl: `/revista/${contratarGuiaSlug}`,
    seoTitle: contratarGuiaPost.seoTitle,
    seoDescription: contratarGuiaPost.seoDescription,
    ogImage: contratarGuiaPost.featuredImage,
    robots: robotsSeo,
  },
});

const robotsSeoMelhor = (melhorEpocaPost.seoRobots?.trim() || "index,follow").slice(0, 96);

await prisma.seoMetadata.upsert({
  where: {
    entityType_entityId: {
      entityType: "POST",
      entityId: melhorEpocaPost.id,
    },
  },
  create: {
    entityType: "POST",
    entityId: melhorEpocaPost.id,
    canonicalUrl: `/revista/${melhorEpocaSlug}`,
    seoTitle: melhorEpocaPost.seoTitle,
    seoDescription: melhorEpocaPost.seoDescription,
    ogImage: melhorEpocaPost.featuredImage,
    robots: robotsSeoMelhor,
  },
  update: {
    canonicalUrl: `/revista/${melhorEpocaSlug}`,
    seoTitle: melhorEpocaPost.seoTitle,
    seoDescription: melhorEpocaPost.seoDescription,
    ogImage: melhorEpocaPost.featuredImage,
    robots: robotsSeoMelhor,
  },
});

console.log(`Admin criado/atualizado: ${email}`);
console.log(`Artigo publicado na Revista: /revista/${contratarGuiaSlug} (id ${contratarGuiaPost.id})`);
console.log(`Artigo publicado na Revista: /revista/${melhorEpocaSlug} (id ${melhorEpocaPost.id})`);

await prisma.$disconnect();
