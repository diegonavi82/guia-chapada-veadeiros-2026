import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { ZodError } from "zod";
import { corsOrigins, env } from "./config/env.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { publicRoutes } from "./routes/public.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "debug" : "info",
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
            }
          : undefined,
    },
  });

  await app.register(sensible);

  await app.register(helmet);

  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 12 * 1024 * 1024,
    },
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "ValidationError",
        details: error.flatten(),
      });
    }

    const sc =
      typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : undefined;

    if (
      typeof sc === "number" &&
      sc >= 400 &&
      sc < 600 &&
      error instanceof Error
    ) {
      request.log.warn({ err: error, statusCode: sc }, "request error");

      return reply.status(sc).send({
        message: error.message,
      });
    }

    return reply.send(error);
  });

  // HEALTH CHECK
  app.get("/", async () => {
    return { ok: true };
  });

  app.get("/health", async () => {
    return { status: "online" };
  });

  await app.register(publicRoutes, { prefix: "/api" });
  await app.register(adminRoutes, { prefix: "/api/admin" });

  return app;
}