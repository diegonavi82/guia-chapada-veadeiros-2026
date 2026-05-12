import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const required = [
  "R2_ENDPOINT",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Variavel ausente: ${name}`);
  }
}

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const key = `smoke-tests/r2-test-${Date.now()}.txt`;
const body = `R2 smoke test Guia Chapada Veadeiros 2026 - ${new Date().toISOString()}\n`;

await client.send(
  new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: "text/plain; charset=utf-8",
    CacheControl: "public, max-age=31536000, immutable",
  }),
);

const publicUrl = `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
const response = await fetch(publicUrl);
const text = await response.text();

console.log(`Upload OK: ${key}`);
console.log(`URL publica: ${publicUrl}`);
console.log(`Leitura publica: HTTP ${response.status}`);

if (!response.ok || !text.includes("R2 smoke test Guia Chapada Veadeiros 2026")) {
  throw new Error("Upload funcionou, mas a leitura publica nao retornou o conteudo esperado.");
}

console.log("Teste R2 concluido com sucesso.");
