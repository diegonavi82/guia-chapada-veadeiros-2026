import type { FastifyInstance } from "fastify";
import {
  getPageBySlug,
  getPostBySlug,
  listCategories,
  listPages,
  listPosts,
  listProducts,
} from "../controllers/content.controller.js";
import { listInstagramMedia } from "../controllers/instagram.controller.js";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ ok: true }));
  app.get("/posts", listPosts);
  app.get("/posts/:slug", getPostBySlug);
  app.get("/pages", listPages);
  app.get("/pages/:slug", getPageBySlug);
  app.get("/products", listProducts);
  app.get("/categories", listCategories);
  app.get("/instagram/media", listInstagramMedia);
}
