import type { FastifyRequest } from "fastify";
import type {
  Category,
  Page,
  PageTranslation,
  Post,
  PostTranslation,
  Product,
  ProductTranslation,
  Tag,
} from "@prisma/client";
import { z } from "zod";
import { WATERFALL_MAP_PAGE_SLUGS, resolvePageSlugAlias } from "../constants/waterfallMapPageSlugs.js";
import { siteLocaleFromRequest, type SiteLocale } from "../utils/locale.js";
import { prisma } from "../utils/prisma.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(96).default(24),
  search: z.string().optional(),
});

const postsLatestSchema = z.object({
  take: z.coerce.number().int().min(1).max(8).default(8),
});

function httpError(statusCode: number, message: string): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

type PostListedRow = Pick<
  Post,
  "id" | "title" | "slug" | "excerpt" | "featuredImage" | "seoDescription" | "publishedAt"
> & {
  categories: Pick<Category, "name" | "slug">[];
  translations: Pick<
    PostTranslation,
    "title" | "slug" | "excerpt" | "seoDescription"
  >[];
};

function mapListed(row: PostListedRow, locale: SiteLocale): Omit<PostListedRow, "translations"> {
  const tr = locale !== "pt" ? row.translations[0] : undefined;
  return {
    id: row.id,
    slug: tr?.slug ?? row.slug,
    title: tr?.title ?? row.title,
    excerpt: tr?.excerpt ?? row.excerpt,
    seoDescription: tr?.seoDescription ?? row.seoDescription,
    featuredImage: row.featuredImage,
    publishedAt: row.publishedAt,
    categories: row.categories,
  };
}



/** Listagem pública mais leve das últimas matérias (home / destaques). */
export async function listPostsLatest(request: FastifyRequest) {
  const query = postsLatestSchema.parse(request.query);
  const locale = siteLocaleFromRequest(request);

  const rows = await prisma.post.findMany({
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
      translations: {
        where: { locale },
        take: 1,
        select: { title: true, slug: true, excerpt: true, seoDescription: true },
      },
    },
  });

  return { items: rows.map((r) => mapListed(r, locale)) };
}

export async function listPosts(request: FastifyRequest) {
  const query = paginationSchema.parse(request.query);
  const locale = siteLocaleFromRequest(request);
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

  const [itemsRaw, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      include: {
        categories: true,
        tags: true,
        translations: { where: { locale } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const items = itemsRaw.map((postRow) => {
    const tr = postRow.translations[0];
    const { translations: _omit, ...base } = postRow;
    void _omit;
    return serializePostMerged(base as Post & { categories: Category[]; tags: Tag[] }, tr, locale);
  });

  return { items, total, page: query.page, perPage: query.perPage };
}

function serializePostMerged(
  base: Post & { categories: Category[]; tags: Tag[] },
  tr: PostTranslation | undefined | null,
  locale: SiteLocale,
) {
  if (!tr || locale === "pt") {
    return base;
  }
  return {
    ...base,
    slug: tr.slug,
    title: tr.title,
    excerpt: tr.excerpt ?? base.excerpt,
    content: tr.content,
    featuredImageAlt: tr.featuredImageAlt ?? base.featuredImageAlt,
    seoTitle: tr.seoTitle ?? base.seoTitle,
    seoDescription: tr.seoDescription ?? base.seoDescription,
    seoKeywords: tr.seoKeywords ?? base.seoKeywords,
    seoFocusKeyword: tr.seoFocusKeyword ?? base.seoFocusKeyword,
    ogTitle: tr.ogTitle ?? base.ogTitle,
    ogDescription: tr.ogDescription ?? base.ogDescription,
    seoRobots: tr.seoRobots ?? base.seoRobots,
  };
}

export async function getPostBySlug(request: FastifyRequest) {
  const params = z.object({ slug: z.string().min(1) }).parse(request.params);
  const locale = siteLocaleFromRequest(request);

  if (locale === "pt") {
    return prisma.post.findFirstOrThrow({
      where: { slug: params.slug, status: "PUBLISHED" },
      include: { categories: true, tags: true },
    });
  }

  const hit = await prisma.postTranslation.findFirst({
    where: {
      slug: params.slug,
      locale,
      post: { status: "PUBLISHED" },
    },
    include: {
      post: { include: { categories: true, tags: true } },
    },
  });

  if (hit?.post) {
    const base = hit.post;
    return serializePostMerged(base, hit, locale);
  }

  const fb = await prisma.post.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: { categories: true, tags: true },
  });
  if (fb) {
    return fb;
  }

  throw httpError(404, "Post não encontrado");
}

export async function listPages() {
  return prisma.page.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
  });
}

/** Listagem leve para /atrativos */
export async function listAttractionsCatalog(request: FastifyRequest) {
  const locale = siteLocaleFromRequest(request);

  const pagesRaw = await prisma.page.findMany({
    where: { status: "PUBLISHED", slug: { in: [...WATERFALL_MAP_PAGE_SLUGS] } },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      translations: { where: { locale }, take: 1 },
    },
    orderBy: { title: "asc" },
  });

  const pages = pagesRaw.map((p) => ({
    slug: p.translations[0]?.slug ?? p.slug,
    title: p.translations[0]?.title ?? p.title,
    excerpt: p.translations[0]?.excerpt ?? p.excerpt,
    featuredImage: p.featuredImage,
  }));

  return { pages, products: [] };
}

function serializePageMerged(page: Page, tr?: PageTranslation | null, locale: SiteLocale = "pt") {
  if (!tr || locale === "pt") {
    return page;
  }
  return {
    ...page,
    slug: tr.slug,
    title: tr.title,
    excerpt: tr.excerpt ?? page.excerpt,
    content: tr.content,
    seoTitle: tr.seoTitle ?? page.seoTitle,
    seoDescription: tr.seoDescription ?? page.seoDescription,
  };
}

export async function getPageBySlug(request: FastifyRequest) {
  const params = z.object({ slug: z.string().min(1) }).parse(request.params);
  const locale = siteLocaleFromRequest(request);
  const canonicalSlug = resolvePageSlugAlias(params.slug);

  if (locale === "pt") {
    return prisma.page.findUniqueOrThrow({
      where: { slug: canonicalSlug },
    });
  }

  const trHit = await prisma.pageTranslation.findFirst({
    where: { slug: params.slug, locale },
    include: { page: true },
  });

  if (trHit?.page) {
    return serializePageMerged(trHit.page, trHit, locale);
  }

  return prisma.page.findUniqueOrThrow({
    where: { slug: canonicalSlug },
  });
}

export async function listProducts(request: FastifyRequest) {
  const query = paginationSchema.parse(request.query);
  const locale = siteLocaleFromRequest(request);

  const raw = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    skip: (query.page - 1) * query.perPage,
    take: query.perPage,
    include: {
      categories: true,
      tags: true,
      translations: { where: { locale } },
    },
  });

  return raw.map((prod) => {
    const tr = prod.translations[0];
    const { translations: __o, ...base } = prod;
    void __o;
    return serializeProductMerged(base as Product & { categories: Category[]; tags: Tag[] }, tr, locale);
  });
}

function serializeProductMerged(
  base: Product & { categories: Category[]; tags: Tag[] },
  tr: ProductTranslation | undefined | null,
  locale: SiteLocale,
) {
  if (!tr || locale === "pt") {
    return base;
  }

  return {
    ...base,
    slug: tr.slug,
    title: tr.title,
    description: tr.description,
    shortDescription: tr.shortDescription ?? base.shortDescription,
    seoTitle: tr.seoTitle ?? base.seoTitle,
    seoDescription: tr.seoDescription ?? base.seoDescription,
  };
}

export async function getProductBySlug(request: FastifyRequest) {
  const params = z.object({ slug: z.string().min(1) }).parse(request.params);
  const locale = siteLocaleFromRequest(request);

  if (locale === "pt") {
    return prisma.product.findFirstOrThrow({
      where: { slug: params.slug, status: "PUBLISHED" },
      include: { categories: true, tags: true },
    });
  }

  const hit = await prisma.productTranslation.findFirst({
    where: {
      slug: params.slug,
      locale,
      product: { status: "PUBLISHED" },
    },
    include: { product: { include: { categories: true, tags: true } } },
  });

  if (hit?.product) {
    const base = hit.product;
    return serializeProductMerged(base, hit, locale);
  }

  const fb = await prisma.product.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: { categories: true, tags: true },
  });
  if (fb) return fb;

  throw httpError(404, "Produto não encontrado");
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}
