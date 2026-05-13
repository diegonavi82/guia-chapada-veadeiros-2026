import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { WATERFALL_MAP_PAGE_SLUGS } from "../constants/waterfallMapPageSlugs.js";
import { prisma } from "../utils/prisma.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().optional(),
});

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
      orderBy: { publishedAt: "desc" },
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

  return prisma.post.findUniqueOrThrow({
    where: { slug: params.slug },
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

  return prisma.page.findUniqueOrThrow({
    where: { slug: params.slug },
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
