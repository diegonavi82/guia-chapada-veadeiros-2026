import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";

function normalizeEmail(raw: unknown): string {
  if (typeof raw !== "string") {
    return "";
  }
  return raw.trim().toLowerCase();
}

/** Mantém apenas dígitos para comparar armazenamento e duplicidade. */
function normalizePhone(raw: unknown): string {
  if (typeof raw !== "string") {
    return "";
  }
  return raw.replace(/\D/g, "").slice(0, 64);
}

const bodySchema = z
  .object({
    email: z.union([z.string(), z.literal(""), z.undefined()]).optional(),
    phone: z.union([z.string(), z.literal(""), z.undefined()]).optional(),
  })
  .transform((data) => ({
    email: normalizeEmail(data.email),
    phone: normalizePhone(data.phone),
  }))
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe seu email ou seu telefone (ou ambos).",
        path: ["email"],
      });
    }
    if (data.email && !z.string().email().safeParse(data.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email inválido.",
        path: ["email"],
      });
    }
    if (data.phone && data.phone.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um telefone válido com DDD (10 dígitos ou mais).",
        path: ["phone"],
      });
    }
  });

export async function postWaitlist(request: FastifyRequest, reply: FastifyReply) {
  const parsed = bodySchema.safeParse(request.body ?? {});
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg =
      flat.fieldErrors.email?.[0] ??
      flat.fieldErrors.phone?.[0] ??
      flat.formErrors[0] ??
      parsed.error.errors[0]?.message ??
      "Não foi possível validar os dados.";
    return reply.code(400).send({ ok: false, message: msg });
  }

  const emailStored = parsed.data.email;
  const phoneStored = parsed.data.phone;

  const [emailHit, phoneHit] = await Promise.all([
    emailStored
      ? prisma.$queryRaw<Array<{ email: string }>>`
          SELECT \`email\` FROM \`waitlist_leads\` WHERE \`email\` = ${emailStored} LIMIT 1
        `
      : Promise.resolve([]),
    phoneStored
      ? prisma.$queryRaw<Array<{ phone: string }>>`
          SELECT \`phone\` FROM \`waitlist_leads\` WHERE \`phone\` = ${phoneStored} LIMIT 1
        `
      : Promise.resolve([]),
  ]);

  const duplicateEmail = Boolean(emailStored && emailHit.length > 0);
  const duplicatePhone = Boolean(phoneStored && phoneHit.length > 0);

  if (duplicateEmail || duplicatePhone) {
    let message: string;
    if (duplicateEmail && duplicatePhone) {
      message =
        "Este email e este telefone já estão cadastrados na lista de espera. Confira os dados ou use outros.";
    } else if (duplicateEmail) {
      message = "Este email já está cadastrado na lista de espera.";
    } else {
      message = "Este telefone já está cadastrado na lista de espera.";
    }

    return reply.code(409).send({
      ok: false,
      duplicateEmail,
      duplicatePhone,
      message,
    });
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO \`waitlist_leads\` (\`email\`, \`phone\`, \`created_at\`)
      VALUES (${emailStored}, ${phoneStored}, NOW(3))
    `;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("1062") || /duplicate entry/i.test(msg)) {
      return reply.code(409).send({
        ok: false,
        duplicateEmail: true,
        duplicatePhone: true,
        message: "Estes dados já constam na lista de espera.",
      });
    }
    throw err;
  }

  return reply.code(201).send({
    ok: true,
    message: "Recebemos seus dados com sucesso. Avisaremos em primeira mão quando abrirmos as reservas!",
  });
}
