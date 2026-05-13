import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Configure ${name} no .env antes de executar.`);
  }
  return value;
}

/** Converte URLs absolutas de mídia para caminhos locais servidos em public/. */
function rewriteMediaUrls(value) {
  if (!value) return value;
  return String(value)
    .replace(/https?:\/\/[^"'\s<>)]+\/wp-content\/uploads\/([^"'\s<>)]+)/gi, "/wp-content/uploads/$1")
    .replace(/https?:\/\/[^"'\s<>)]+\/imagens\/([^"'\s<>)?#]+)/gi, "/imagens/$1");
}

async function rewriteTableColumn(connection, table, idColumn, column) {
  const [rows] = await connection.query(`select ${idColumn} as id, ${column} as value from ${table} where ${column} is not null and ${column} != ''`);
  let changed = 0;

  for (const row of rows) {
    const nextValue = rewriteMediaUrls(row.value);
    if (nextValue !== row.value) {
      await connection.execute(`update ${table} set ${column} = ? where ${idColumn} = ?`, [nextValue, row.id]);
      changed += 1;
    }
  }

  console.log(`${table}.${column}: ${changed} registro(s) atualizado(s).`);
}

const connection = await mysql.createConnection(required("DATABASE_URL"));

await rewriteTableColumn(connection, "posts", "id", "content");
await rewriteTableColumn(connection, "posts", "id", "featured_image");
await rewriteTableColumn(connection, "pages", "id", "content");
await rewriteTableColumn(connection, "pages", "id", "featured_image");
await rewriteTableColumn(connection, "products", "id", "description");
await rewriteTableColumn(connection, "products", "id", "featured_image");
await rewriteTableColumn(connection, "media", "id", "url");
await rewriteTableColumn(connection, "seo_metadata", "id", "og_image");

await connection.end();
console.log("URLs de mídia apontando para caminhos locais (/wp-content/uploads/... e /imagens/...).");
