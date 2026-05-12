import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../utils/prisma.js";
import { uploadOptimizedImage } from "../services/r2.service.js";

export async function uploadMedia(request: FastifyRequest, reply: FastifyReply) {
  const file = await request.file();

  if (!file) {
    return reply.badRequest("Arquivo obrigatorio");
  }

  if (!file.mimetype.startsWith("image/")) {
    return reply.badRequest("Envie uma imagem valida");
  }

  const buffer = await file.toBuffer();
  const optimized = await uploadOptimizedImage({
    buffer,
    fileName: file.filename,
    contentType: file.mimetype,
  });
  const media = await prisma.media.create({
    data: {
      title: file.filename,
      alt: "",
      url: optimized.original.url,
      key: optimized.original.key,
      width: optimized.original.width,
      height: optimized.original.height,
      mimeType: optimized.original.mimeType,
    },
  });

  return {
    media,
    variants: optimized,
  };
}
