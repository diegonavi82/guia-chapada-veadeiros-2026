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

export async function buildApp() {
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

    return reply.send(error);
  });

  await app.register(publicRoutes, { prefix: "/api" });
  await app.register(adminRoutes, { prefix: "/api/admin" });

  return app;
}
