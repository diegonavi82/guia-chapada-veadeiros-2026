import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { env } from "../config/env.js";

const tipoValues = ["elogio", "reclamacao", "duvida", "orcamento", "outro"] as const;

const payloadSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome."),
    tipo: z.enum(tipoValues),
    email: z.string().trim().max(254).optional(),
    telefone: z.string().trim().max(32).optional(),
    mensagem: z
      .string()
      .trim()
      .min(10, "Escreva uma mensagem mais detalhada (pelo menos 10 caracteres).")
      .max(4000),
  })
  .superRefine((data, ctx) => {
    const e = data.email?.trim();
    if (e) {
      const ok = z.string().email().safeParse(e).success;
      if (!ok) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "E-mail invalido.", path: ["email"] });
      }
    }
  })
  .transform((data) => ({
    nome: data.nome,
    tipo: data.tipo,
    email: data.email?.trim() || undefined,
    telefone: data.telefone?.trim() || undefined,
    mensagem: data.mensagem,
  }));

const tipoLabel: Record<(typeof tipoValues)[number], string> = {
  elogio: "Elogio",
  reclamacao: "Reclamação",
  duvida: "Dúvida / pergunta",
  orcamento: "Orçamento ou reserva",
  outro: "Outro",
};

type ContactPayload = z.infer<typeof payloadSchema>;

function buildPlainBody(data: ContactPayload) {
  const lines = [
    "Nova mensagem pelo formulário do site Guia Chapada Veadeiros",
    "",
    `Tipo: ${tipoLabel[data.tipo]}`,
    `Nome: ${data.nome}`,
    data.email ? `E-mail para resposta: ${data.email}` : "E-mail para resposta: (não informado)",
    data.telefone ? `Telefone: ${data.telefone}` : "Telefone: (não informado)",
    "",
    "Mensagem:",
    data.mensagem,
  ];
  return lines.join("\n");
}

async function sendResendEmail(data: ContactPayload, bodyText: string) {
  const key = env.CONTACT_RESEND_API_KEY;
  const from = env.CONTACT_FROM_EMAIL;
  if (!key || !from) {
    return false;
  }

  const subject = `[Contato site] ${tipoLabel[data.tipo]} — ${data.nome}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [env.CONTACT_TO_EMAIL],
      subject,
      text: bodyText,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend ${res.status}: ${detail}`);
  }
  return true;
}

async function twilioPostMessage(fields: Record<string, string>) {
  const sid = env.TWILIO_ACCOUNT_SID;
  const token = env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    return false as const;
  }
  const auth = Buffer.from(`${sid}:${token}`, "utf8").toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const body = new URLSearchParams(fields);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Twilio ${res.status}: ${detail}`);
  }
  return true as const;
}

async function sendTwilioSmsSummary(data: ContactPayload) {
  const twilioFrom = env.TWILIO_FROM_NUMBER;
  if (!twilioFrom) {
    return false;
  }

  const summary = `[Guia Chapada] ${tipoLabel[data.tipo]} · ${data.nome.slice(0, 40)}${data.nome.length > 40 ? "..." : ""}`.slice(0, 140);
  return twilioPostMessage({
    To: env.CONTACT_NOTIFY_SMS_TO_E164,
    From: twilioFrom,
    Body: summary,
  });
}

/** WhatsApp com texto completo (Twilio — sender precisa ter canal WhatsApp aprovado). */
async function sendTwilioWhatsAppFull(bodyText: string) {
  const waFrom = env.TWILIO_WHATSAPP_FROM;
  const waTo = env.CONTACT_NOTIFY_WHATSAPP_TO;
  if (!waFrom?.startsWith("whatsapp:") || !waTo?.startsWith("whatsapp:")) {
    return false;
  }
  const capped = bodyText.length > 3900 ? `${bodyText.slice(0, 3897)}...` : bodyText;
  return twilioPostMessage({
    From: waFrom,
    To: waTo,
    Body: capped,
  });
}

export async function postContact(request: FastifyRequest, reply: FastifyReply) {
  const data = payloadSchema.parse(request.body);
  const plain = buildPlainBody(data);

  let emailSent = false;
  let smsSent = false;
  let whatsappSent = false;

  try {
    emailSent = await sendResendEmail(data, plain);
  } catch (err) {
    request.log.error({ err }, "Falha ao enviar e-mail de contato (Resend)");
  }

  try {
    smsSent = await sendTwilioSmsSummary(data);
  } catch (err) {
    request.log.error({ err }, "Falha ao enviar SMS de contato (Twilio)");
  }

  try {
    whatsappSent = await sendTwilioWhatsAppFull(plain);
  } catch (err) {
    request.log.error({ err }, "Falha ao enviar WhatsApp de contato (Twilio)");
  }

  const anyDelivered = emailSent || smsSent || whatsappSent;

  /** Evita mensagem de sucesso quando nenhum canal realmente funcionou na API */
  if (!anyDelivered) {
    return reply.status(503).send({
      ok: false,
      code: "NO_DELIVERY_CHANNELS",
      message:
        "Os canais de envio não estão configurados no servidor. Configure e-mail (Resend) e SMS/WhatsApp (Twilio) no arquivo .env da API.",
    });
  }

  return reply.send({
    ok: true,
    notified: {
      email: emailSent,
      sms: smsSent,
      whatsapp: whatsappSent,
    },
  });
}
