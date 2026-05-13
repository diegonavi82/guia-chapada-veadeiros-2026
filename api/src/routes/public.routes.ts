import type { FastifyInstance } from "fastify";
import { postContact } from "../controllers/contact.controller.js";
import {
  getPageBySlug,
  getPostBySlug,
  getProductBySlug,
  listAttractionsCatalog,
  listCategories,
  listPages,
  listPosts,
  listProducts,
} from "../controllers/content.controller.js";
import { listInstagramMedia } from "../controllers/instagram.controller.js";
import { postWaitlist } from "../controllers/waitlist.controller.js";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ ok: true }));
  app.post("/contact", postContact);
  app.post("/waitlist", postWaitlist);
  app.get("/posts", listPosts);
  app.get("/posts/:slug", getPostBySlug);
  app.get("/pages", listPages);
  app.get("/pages/:slug", getPageBySlug);
  app.get("/catalog/attractions", listAttractionsCatalog);
  app.get("/products", listProducts);
  app.get("/products/:slug", getProductBySlug);
  app.get("/categories", listCategories);
  app.get("/instagram/media", listInstagramMedia);
}
