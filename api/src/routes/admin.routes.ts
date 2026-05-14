import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { login } from "../controllers/auth.controller.js";
import { uploadMedia } from "../controllers/media.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";
import { collectPostPublishIssues } from "../utils/postPublishValidation.js";

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const postUpdateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1),
  featuredImage: z.string().nullable().optional(),
  featuredImageAlt: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.string().nullable().optional(),
  seoFocusKeyword: z.string().nullable().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  seoRobots: z.string().nullable().optional(),
  status: publishStatusSchema,
});

const pageUpdateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  status: publishStatusSchema,
});

const productUpdateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().nullable().optional(),
  description: z.string().min(1),
  price: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  status: publishStatusSchema,
});

async function syncSeoMetadata({
  canonicalUrl,
  entityId,
  entityType,
  seoDescription,
  seoTitle,
  ogImage,
  robots,
}: {
  canonicalUrl: string;
  entityId: number;
  entityType: "POST" | "PAGE" | "PRODUCT";
  seoDescription?: string | null;
  seoTitle?: string | null;
  ogImage?: string | null;
  robots?: string | null;
}) {
  const robotsValue = (robots?.trim() || "index,follow").slice(0, 96);

  await prisma.seoMetadata.upsert({
    where: {
      entityType_entityId: {
        entityId,
        entityType,
      },
    },
    create: {
      canonicalUrl,
      entityId,
      entityType,
      robots: robotsValue,
      seoDescription,
      seoTitle,
      ogImage: ogImage ?? undefined,
    },
    update: {
      canonicalUrl,
      seoDescription,
      seoTitle,
      ogImage: ogImage ?? undefined,
      robots: robotsValue,
    },
  });
}

export async function adminRoutes(app: FastifyInstance) {
  app.post("/auth/login", login);

  app.register(async (privateRoutes) => {
    privateRoutes.addHook("preHandler", requireAuth);

    privateRoutes.get("/dashboard", async () => {
      const [posts, pages, products, media, redirects] = await Promise.all([
        prisma.post.count(),
        prisma.page.count(),
        prisma.product.count(),
        prisma.media.count(),
        prisma.redirect.count(),
      ]);

      return { posts, pages, products, media, redirects };
    });

    privateRoutes.get("/posts", async () =>
      prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        include: { categories: true, tags: true },
      }),
    );

    privateRoutes.delete("/posts/bulk", async (request) => {
      const payload = bulkDeleteSchema.parse(request.body);

      await prisma.seoMetadata.deleteMany({
        where: {
          entityId: { in: payload.ids },
          entityType: "POST",
        },
      });

      const result = await prisma.post.deleteMany({
        where: { id: { in: payload.ids } },
      });

      return { deleted: result.count };
    });

    privateRoutes.get("/posts/:id", async (request) => {
      const params = idParamsSchema.parse(request.params);

      return prisma.post.findUniqueOrThrow({
        where: { id: params.id },
        include: { categories: true, tags: true },
      });
    });

    privateRoutes.put("/posts/:id", async (request, reply) => {
      const params = idParamsSchema.parse(request.params);
      const payload = postUpdateSchema.parse(request.body);

      const existing = await prisma.post.findUniqueOrThrow({
        where: { id: params.id },
      });

      if (payload.status === "PUBLISHED") {
        const issues = collectPostPublishIssues(payload);
        if (issues.length > 0) {
          return reply.code(400).send({ error: "validacao_revista", issues });
        }
      }

      const publishedAt =
        payload.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;

      const post = await prisma.post.update({
        where: { id: params.id },
        data: { ...payload, publishedAt },
        include: { categories: true, tags: true },
      });

      await syncSeoMetadata({
        canonicalUrl: `/revista/${post.slug}`,
        entityId: post.id,
        entityType: "POST",
        seoDescription: post.seoDescription,
        seoTitle: post.seoTitle,
        ogImage: post.featuredImage,
        robots: post.seoRobots,
      });

      return post;
    });

    privateRoutes.get("/pages", async () =>
      prisma.page.findMany({
        orderBy: { updatedAt: "desc" },
      }),
    );

    privateRoutes.get("/pages/:id", async (request) => {
      const params = idParamsSchema.parse(request.params);

      return prisma.page.findUniqueOrThrow({
        where: { id: params.id },
      });
    });

    privateRoutes.put("/pages/:id", async (request) => {
      const params = idParamsSchema.parse(request.params);
      const payload = pageUpdateSchema.parse(request.body);

      const page = await prisma.page.update({
        where: { id: params.id },
        data: payload,
      });

      await syncSeoMetadata({
        canonicalUrl: `/${page.slug}`,
        entityId: page.id,
        entityType: "PAGE",
        seoDescription: page.seoDescription,
        seoTitle: page.seoTitle,
      });

      return page;
    });

    privateRoutes.get("/products", async () =>
      prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        include: { categories: true, tags: true },
      }),
    );

    privateRoutes.get("/products/:id", async (request) => {
      const params = idParamsSchema.parse(request.params);

      return prisma.product.findUniqueOrThrow({
        where: { id: params.id },
        include: { categories: true, tags: true },
      });
    });

    privateRoutes.put("/products/:id", async (request) => {
      const params = idParamsSchema.parse(request.params);
      const payload = productUpdateSchema.parse(request.body);

      const product = await prisma.product.update({
        where: { id: params.id },
        data: {
          ...payload,
          price: payload.price || null,
        },
        include: { categories: true, tags: true },
      });

      await syncSeoMetadata({
        canonicalUrl: `/passeios/${product.slug}`,
        entityId: product.id,
        entityType: "PRODUCT",
        seoDescription: product.seoDescription,
        seoTitle: product.seoTitle,
      });

      return product;
    });

    privateRoutes.get("/media", async () =>
      prisma.media.findMany({ orderBy: { createdAt: "desc" } }),
    );

    privateRoutes.post("/media", uploadMedia);

    privateRoutes.get("/redirects", async () =>
      prisma.redirect.findMany({ orderBy: { createdAt: "desc" } }),
    );
  });
}
