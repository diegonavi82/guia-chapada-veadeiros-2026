import bcrypt from "bcryptjs";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const payload = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    return reply.unauthorized("Credenciais invalidas");
  }

  const passwordOk = await bcrypt.compare(payload.password, user.passwordHash);

  if (!passwordOk) {
    return reply.unauthorized("Credenciais invalidas");
  }

  const token = await reply.jwtSign({
    sub: String(user.id),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
