import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const mediaPublicUrl = (process.env.MEDIA_PUBLIC_URL ?? "https://www.guiachapadaveadeiros.com/imagens").replace(/\/$/, "");

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Configure ${name} no .env antes de atualizar as URLs.`);
  }

  return value;
}

function publicUrlFor(url) {
  try {
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname.split("/").filter(Boolean).at(-1);

    return fileName ? `${mediaPublicUrl}/${fileName}` : url;
  } catch {
    const fileName = String(url).split(/[\\/]/).filter(Boolean).at(-1);

    return fileName ? `${mediaPublicUrl}/${fileName}` : url;
  }
}

function rewriteImageUrls(value) {
  if (!value) {
    return value;
  }

  return String(value)
    .replace(/https?:\/\/[^"'\s<>)]+\/wp-content\/uploads\/[^"'\s<>)]+/g, publicUrlFor)
    .replace(/https?:\/\/pub-[^"'\s<>)]+\.r2\.dev\/[^"'\s<>)]+/g, publicUrlFor);
}

async function rewriteTableColumn(connection, table, idColumn, column) {
  const [rows] = await connection.query(`select ${idColumn} as id, ${column} as value from ${table} where ${column} is not null`);
  let changed = 0;

  for (const row of rows) {
    const nextValue = rewriteImageUrls(row.value);

    if (nextValue !== row.value) {
      await connection.execute(`update ${table} set ${column} = ? where ${idColumn} = ?`, [nextValue, row.id]);
      changed += 1;
    }
  }

  console.log(`${table}.${column}: ${changed} registro(s) atualizado(s).`);
}

const connection = await mysql.createConnection(required("DATABASE_URL"));

await rewriteTableColumn(connection, "media", "id", "url");
await rewriteTableColumn(connection, "posts", "id", "content");
await rewriteTableColumn(connection, "posts", "id", "featured_image");
await rewriteTableColumn(connection, "pages", "id", "content");
await rewriteTableColumn(connection, "pages", "id", "featured_image");
await rewriteTableColumn(connection, "products", "id", "description");
await rewriteTableColumn(connection, "products", "id", "featured_image");
await rewriteTableColumn(connection, "seo_metadata", "id", "og_image");

await connection.end();

console.log("URLs publicas de imagens corrigidas.");
