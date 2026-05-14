import type { FastifyRequest } from "fastify";
import { z } from "zod";

/** Alinhado a `AppLocale` no Prisma. */
export const SITE_LOCALES = ["pt", "en", "es"] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];

const siteLocaleSchema = z.enum(SITE_LOCALES);

export function siteLocaleFromRequest(request: FastifyRequest): SiteLocale {
  const raw = (request.query as { locale?: string } | undefined)?.locale;
  if (raw) {
    const q = siteLocaleSchema.safeParse(raw);
    if (q.success) {
      return q.data;
    }
  }

  const accept = request.headers["accept-language"];
  if (typeof accept === "string") {
    for (const part of accept.split(",")) {
      const code = part.trim().split(";")[0]?.slice(0, 2).toLowerCase();
      if (code === "en") {
        return "en";
      }
      if (code === "es") {
        return "es";
      }
      if (code === "pt") {
        return "pt";
      }
    }
  }

  return "pt";
}
