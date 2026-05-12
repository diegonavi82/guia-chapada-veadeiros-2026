import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { env } from "../config/env.js";

const r2 = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export type OptimizedUpload = {
  original: {
    key: string;
    url: string;
    width?: number;
    height?: number;
    mimeType: string;
  };
  webp: {
    key: string;
    url: string;
    mimeType: "image/webp";
  };
  avif: {
    key: string;
    url: string;
    mimeType: "image/avif";
  };
};

function publicUrlFor(key: string) {
  const fileName = key.split("/").filter(Boolean).at(-1) ?? key;

  return `${env.MEDIA_PUBLIC_URL.replace(/\/$/, "")}/${fileName}`;
}

async function putObject(key: string, body: Buffer, contentType: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function uploadOptimizedImage(input: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}): Promise<OptimizedUpload> {
  const folder = input.folder ?? "media";
  const safeName = input.fileName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const baseName = safeName.replace(/\.[a-z0-9]+$/i, "");
  const stamp = Date.now();
  const originalKey = `${folder}/${stamp}-${safeName}`;
  const webpKey = `${folder}/${stamp}-${baseName}.webp`;
  const avifKey = `${folder}/${stamp}-${baseName}.avif`;
  const image = sharp(input.buffer);
  const metadata = await image.metadata();
  const webp = await image.clone().webp({ quality: 82 }).toBuffer();
  const avif = await image.clone().avif({ quality: 60 }).toBuffer();

  await Promise.all([
    putObject(originalKey, input.buffer, input.contentType),
    putObject(webpKey, webp, "image/webp"),
    putObject(avifKey, avif, "image/avif"),
  ]);

  return {
    original: {
      key: originalKey,
      url: publicUrlFor(originalKey),
      width: metadata.width,
      height: metadata.height,
      mimeType: input.contentType,
    },
    webp: {
      key: webpKey,
      url: publicUrlFor(webpKey),
      mimeType: "image/webp",
    },
    avif: {
      key: avifKey,
      url: publicUrlFor(avifKey),
      mimeType: "image/avif",
    },
  };
}
