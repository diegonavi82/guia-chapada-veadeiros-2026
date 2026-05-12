import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./utils/prisma.js";

const app = await buildApp();

const close = async () => {
  await app.close();
  await prisma.$disconnect();
};

process.on("SIGINT", close);
process.on("SIGTERM", close);

await app.listen({
  port: env.API_PORT,
  host: "0.0.0.0",
});
