import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { WATERFALL_MAP_PAGE_SLUGS, resolvePageSlugAlias } from "../constants/waterfallMapPageSlugs.js";
import { prisma } from "../utils/prisma.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(96).default(24),
  search: z.string().optional(),
});

const postsLatestSchema = z.object({
  take: z.coerce.number().int().min(1).max(8).default(8),
});

/** Listagem pública mais leve das últimas matérias (home / destaques). */
export async function listPostsLatest(request: FastifyRequest) {
  const query = postsLatestSchema.parse(request.query);

  const items = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: query.take,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      seoDescription: true,
      publishedAt: true,
      categories: {
        select: { name: true, slug: true },
        take: 2,
      },
    },
  });

  return { items };
}

export async function listPosts(request: FastifyRequest) {
  const query = paginationSchema.parse(request.query);
  const where = {
    status: "PUBLISHED" as const,
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search } },
            { excerpt: { contains: query.search } },
            { content: { contains: query.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      include: { categories: true, tags: true },
    }),
    prisma.post.count({ where }),
  ]);

  return { items, total, page: query.page, perPage: query.perPage };
}

export async function getPostBySlug(request: FastifyRequest) {
  const params = z.object({ slug: z.string().min(1) }).parse(request.params);

  return prisma.post.findFirstOrThrow({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: { categories: true, tags: true },
  });
}

export async function listPages() {
  return prisma.page.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
  });
}

/** Listagem leve para /atrativos: só páginas ligadas ao mapa oficial (sem produtos/vendas). */
export async function listAttractionsCatalog() {
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED", slug: { in: [...WATERFALL_MAP_PAGE_SLUGS] } },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
    },
    orderBy: { title: "asc" },
  });

  return { pages, products: [] };
}

export async function getPageBySlug(request: FastifyRequest) {
  const params = z.object({ slug: z.string().min(1) }).parse(request.params);
  const slug = resolvePageSlugAlias(params.slug);

  return prisma.page.findUniqueOrThrow({
    where: { slug },
  });
}

export async function listProducts(request: FastifyRequest) {
  const query = paginationSchema.parse(request.query);

  return prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    skip: (query.page - 1) * query.perPage,
    take: query.perPage,
    include: { categories: true, tags: true },
  });
}

export async function getProductBySlug(request: FastifyRequest) {
  const params = z.object({ slug: z.string().min(1) }).parse(request.params);

  return prisma.product.findFirstOrThrow({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: { categories: true, tags: true },
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}
