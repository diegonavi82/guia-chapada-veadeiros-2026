import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../../.env" });
dotenv.config({ path: "../.env" });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(3333),
  API_BASE_URL: z.string().url().default("http://localhost:3333"),
  CLIENTE_BASE_URL: z.string().url().default("http://localhost:5173"),
  ADMIN_BASE_URL: z.string().url().default("http://localhost:5174"),
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://localhost:5174"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET precisa ser configurado"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL precisa ser configurado"),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ENDPOINT: z.string().url(),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_URL: z.string().url(),
  MEDIA_PUBLIC_URL: z.string().url().default("https://www.guiachapadaveadeiros.com/imagens"),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  INSTAGRAM_BUSINESS_ACCOUNT_ID: z.string().optional(),
  /** Contato — email via Resend (https://resend.com) */
  CONTACT_RESEND_API_KEY: z.string().optional(),
  CONTACT_FROM_EMAIL: z.string().email().optional(),
  CONTACT_TO_EMAIL: z.string().email().default("contato@guiachapadaveadeiros.com"),
  /** Contato — SMS para o número de atendimento (Twilio). Corpo será um resumo. */
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  CONTACT_NOTIFY_SMS_TO_E164: z.string().default("+5562982506891"),
  /** Contato — WhatsApp via Twilio (From/To com prefixo whatsapp:+...) */
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  CONTACT_NOTIFY_WHATSAPP_TO: z.string().default("whatsapp:+5562982506891"),
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
