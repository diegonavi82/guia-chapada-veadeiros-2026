import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import sharp from "sharp";

dotenv.config();

const prefix = process.env.WP_TABLE_PREFIX ?? "wp_";
const wpSiteUrl = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
const uploadsPath = process.env.WP_UPLOADS_PATH;
const skipMedia = process.argv.includes("--skip-media");
const mediaPublicUrl = (process.env.MEDIA_PUBLIC_URL ?? "https://www.guiachapadaveadeiros.com/imagens").replace(/\/$/, "");

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Configure ${name} no .env antes de migrar.`);
  }

  return value;
}

function slugFromGuid(guid) {
  try {
    return new URL(guid).pathname.replace(/^\/|\/$/g, "").split("/").pop();
  } catch {
    return undefined;
  }
}

function cleanSlug(postName, guid) {
  return postName || slugFromGuid(guid) || crypto.randomUUID();
}

function normalizeUploadKey(relativePath) {
  return `wp-content/uploads/${relativePath.replace(/\\/g, "/").replace(/^\/+/, "")}`;
}

function publicUrlFor(key) {
  const fileName = key.split("/").filter(Boolean).at(-1) ?? key;

  return `${mediaPublicUrl}/${fileName}`;
}

function rewriteWordPressUploads(content) {
  return content.replace(/https?:\/\/[^"'\s<>)]+\/wp-content\/uploads\/[^"'\s<>)]+/g, (url) => {
    try {
      const parsedUrl = new URL(url);
      const uploadsPathname = parsedUrl.pathname.split("/wp-content/uploads/").at(1);

      return uploadsPathname ? publicUrlFor(uploadsPathname) : url;
    } catch {
      return url;
    }
  });
}

function shortcodeAttr(attrs, name) {
  const match = attrs.match(new RegExp(`${name}="([^"]*)"`));

  return match?.[1] ?? "";
}

function convertAvadaShortcodes(content) {
  return content
    .replace(/\[fusion_imageframe([^\]]*)\]([\s\S]*?)\[\/fusion_imageframe\]/g, (_match, attrs, url) => {
      const alt = shortcodeAttr(attrs, "alt");
      const cleanUrl = String(url).trim();

      return cleanUrl ? `<img src="${cleanUrl}" alt="${alt}" loading="lazy" />` : "";
    })
    .replace(/\[fusion_button([^\]]*)\]([\s\S]*?)\[\/fusion_button\]/g, (_match, attrs, label) => {
      const link = shortcodeAttr(attrs, "link");

      return link ? `<a href="${link}" class="button">${label.trim()}</a>` : label.trim();
    })
    .replace(/\[fusion_text[^\]]*\]/g, "")
    .replace(/\[\/fusion_text\]/g, "")
    .replace(/\[\/?fusion_[^\]]*\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const wp = await mysql.createConnection(required("WP_DATABASE_URL"));
const target = await mysql.createConnection(required("DATABASE_URL"));
const r2 = new S3Client({
  region: "auto",
  endpoint: required("R2_ENDPOINT"),
  credentials: {
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
  },
});

async function getPostMeta(postId) {
  const [rows] = await wp.query(
    `select meta_key, meta_value from ${prefix}postmeta where post_id = ?`,
    [postId],
  );

  return Object.fromEntries(rows.map((row) => [row.meta_key, row.meta_value]));
}

async function upsertMediaFromAttachment(attachment) {
  const meta = await getPostMeta(attachment.ID);
  const relativePath = meta._wp_attached_file;

  if (!relativePath || !uploadsPath) {
    return null;
  }

  const localFile = path.resolve(uploadsPath, relativePath);
  let buffer;

  try {
    buffer = await fs.readFile(localFile);
  } catch (error) {
    if (error.code !== "ENOENT" || !wpSiteUrl) {
      throw error;
    }

    const remoteCandidates = [
      `${wpSiteUrl}/wp-content/uploads/${relativePath.replace(/\\/g, "/")}`,
      attachment.guid,
    ].filter(Boolean);
    let response;

    for (const remoteUrl of remoteCandidates) {
      try {
        response = await fetch(remoteUrl, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          break;
        }
      } catch {
        response = undefined;
      }
    }

    if (!response?.ok) {
      throw new Error(`Falha ao baixar ${remoteCandidates.join(" ou ")}`);
    }

    buffer = Buffer.from(await response.arrayBuffer());
  }

  const metadata = await sharp(buffer).metadata();
  const key = normalizeUploadKey(relativePath);

  await r2.send(
    new PutObjectCommand({
      Bucket: required("R2_BUCKET"),
      Key: key,
      Body: buffer,
      ContentType: attachment.post_mime_type || (metadata.format ? `image/${metadata.format}` : "application/octet-stream"),
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const url = publicUrlFor(key);

  await target.execute(
    `insert into media (title, alt, url, \`key\`, width, height, mime_type, created_at)
     values (?, ?, ?, ?, ?, ?, ?, ?)
     on duplicate key update title = values(title), alt = values(alt), url = values(url), width = values(width), height = values(height), mime_type = values(mime_type)`,
    [
      attachment.post_title || path.basename(relativePath),
      meta._wp_attachment_image_alt || attachment.post_title || "",
      url,
      key,
      metadata.width ?? null,
      metadata.height ?? null,
      attachment.post_mime_type || `image/${metadata.format}`,
      attachment.post_date,
    ],
  );

  return url;
}

async function getAttachmentPublicUrl(attachmentId) {
  if (!attachmentId) {
    return null;
  }

  const meta = await getPostMeta(attachmentId);
  const relativePath = meta._wp_attached_file;

  if (!relativePath) {
    return null;
  }

  return publicUrlFor(normalizeUploadKey(relativePath));
}

async function migrateTaxonomy(taxonomy) {
  const [terms] = await wp.query(
    `select t.name, t.slug, tt.description, tt.parent
     from ${prefix}terms t
     inner join ${prefix}term_taxonomy tt on tt.term_id = t.term_id
     where tt.taxonomy = ?`,
    [taxonomy],
  );

  for (const term of terms) {
    const table = taxonomy === "post_tag" ? "tags" : "categories";

    if (table === "tags") {
      await target.execute(
        `insert into tags (name, slug, created_at, updated_at)
         values (?, ?, now(), now())
         on duplicate key update name = values(name), updated_at = now()`,
        [term.name, term.slug],
      );
    } else {
      await target.execute(
        `insert into categories (name, slug, description, created_at, updated_at)
         values (?, ?, ?, now(), now())
         on duplicate key update name = values(name), description = values(description), updated_at = now()`,
        [term.name, term.slug, term.description || ""],
      );
    }
  }

  console.log(`${taxonomy}: ${terms.length} termos migrados.`);
}

async function migrateContent(postType, targetTable) {
  const [posts] = await wp.query(
    `select ID, post_title, post_name, post_excerpt, post_content, post_status, post_date, post_modified, guid
     from ${prefix}posts
     where post_type = ? and post_status in ('publish', 'draft')`,
    [postType],
  );

  for (const post of posts) {
    if (!post.post_title?.trim() && !post.post_content?.trim()) {
      continue;
    }

    const meta = await getPostMeta(post.ID);
    const slug = cleanSlug(post.post_name, post.guid);
    const seoTitle = meta._yoast_wpseo_title || post.post_title;
    const seoDescription = meta._yoast_wpseo_metadesc || post.post_excerpt || "";
    const featuredImage = await getAttachmentPublicUrl(meta._thumbnail_id);
    const status = post.post_status === "publish" ? "PUBLISHED" : "DRAFT";
    const content = convertAvadaShortcodes(rewriteWordPressUploads(post.post_content));
    let entityId;

    if (targetTable === "products") {
      await target.execute(
        `insert into products (title, slug, description, short_description, featured_image, price, seo_title, seo_description, status, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         on duplicate key update title = values(title), description = values(description), short_description = values(short_description), featured_image = values(featured_image), seo_title = values(seo_title), seo_description = values(seo_description), status = values(status), updated_at = values(updated_at)`,
        [
          post.post_title,
          slug,
          content,
          post.post_excerpt,
          featuredImage,
          meta._price || null,
          seoTitle,
          seoDescription,
          status,
          post.post_date,
          post.post_modified,
        ],
      );
    } else {
      await target.execute(
        `insert into ${targetTable} (title, slug, excerpt, content, featured_image, seo_title, seo_description, status, published_at, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         on duplicate key update title = values(title), excerpt = values(excerpt), content = values(content), featured_image = values(featured_image), seo_title = values(seo_title), seo_description = values(seo_description), status = values(status), updated_at = values(updated_at)`,
        [
          post.post_title,
          slug,
          post.post_excerpt,
          content,
          featuredImage,
          seoTitle,
          seoDescription,
          status,
          post.post_date,
          post.post_date,
          post.post_modified,
        ],
      );
    }

    const [entityRows] = await target.query(`select id from ${targetTable} where slug = ? limit 1`, [slug]);
    entityId = entityRows[0]?.id;

    if (!entityId) {
      console.warn(`SEO ignorado para ${targetTable}/${slug}: entidade nao encontrada.`);
      continue;
    }

    await target.execute(
      `insert into seo_metadata (entity_type, entity_id, seo_title, seo_description, canonical_url, robots)
       values (?, ?, ?, ?, ?, 'index,follow')
       on duplicate key update seo_title = values(seo_title), seo_description = values(seo_description), canonical_url = values(canonical_url), robots = values(robots)`,
      [
        targetTable === "products" ? "PRODUCT" : targetTable === "pages" ? "PAGE" : "POST",
        entityId,
        seoTitle,
        seoDescription,
        `${wpSiteUrl}/${slug}`,
      ],
    );
  }

  console.log(`${postType}: ${posts.length} registros migrados para ${targetTable}.`);
}

console.log("Iniciando migracao WordPress somente leitura...");

await migrateTaxonomy("category");
await migrateTaxonomy("post_tag");

if (skipMedia) {
  console.log("midia: etapa ignorada por --skip-media.");
} else {
  const [attachments] = await wp.query(
    `select ID, post_title, post_mime_type, post_date, guid from ${prefix}posts where post_type = 'attachment' and post_mime_type like 'image/%'`,
  );

  for (const [index, attachment] of attachments.entries()) {
    try {
      await upsertMediaFromAttachment(attachment);
    } catch (error) {
      console.warn(`Falha ao migrar midia ${attachment.ID}: ${error.message}`);
    }

    if ((index + 1) % 25 === 0 || index + 1 === attachments.length) {
      console.log(`midia: ${index + 1}/${attachments.length} anexos processados...`);
    }
  }

  console.log(`midia: ${attachments.length} anexos processados.`);
}

await migrateContent("post", "posts");
await migrateContent("page", "pages");
await migrateContent("product", "products");

await wp.end();
await target.end();

console.log("Migracao concluida. Revise amostras antes de apontar trafego para a nova plataforma.");
