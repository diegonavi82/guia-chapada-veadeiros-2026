/**
 * Remove páginas lixo herdadas do WordPress / WP Travel Engine / WooCommerce e apaga todos os produtos.
 *
 * Uso (na raiz do repo): node scripts/prune-wp-commerce.mjs
 * Simulação: node scripts/prune-wp-commerce.mjs --dry-run
 *
 * Requer DATABASE_URL no .env (mesmo formato da API).
 */
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: ".env" });

const dryRun = process.argv.includes("--dry-run");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Configure DATABASE_URL no .env.");
  process.exit(1);
}

/** Slugs institucionais — nunca remover por engano. */
const NEVER_DELETE_SLUGS = new Set([
  "contato",
  "hospedagem-na-chapada-dos-veadeiros",
  "blog",
  "busca",
  "faq",
]);

/**
 * Correspondência ampla mas focada em loja / conta / checkout / WP Travel / boletos.
 * Ajuste se alguma página útil for apagada por engano (rode antes com --dry-run).
 */
const JUNK_PAGE_SLUG_REGEXP =
  "checkout|shopping-cart|^cart$|my-account|wishlist|trip-types|trip-search|travellers-information|terms-and-conditions|^accessories$|^activities$|travel-engine|^destination$|pagseguro|boleto|form-dados|woocommerce|wpte-|thank-you|^sample-page|^shop$|^store$|coupon|pagamento|wp-travel|paid-bookings";

async function clearProductPivotTables(connection) {
  const [rows] = await connection.query("SHOW TABLES");
  const names = rows.map((row) => Object.values(row)[0]).filter((n) => typeof n === "string");

  for (const name of names) {
    if (!name.startsWith("_")) {
      continue;
    }
    const lower = name.toLowerCase();
    if (!lower.includes("product")) {
      continue;
    }
    const quoted = `\`${name.replace(/`/g, "``")}\``;
    const verb = dryRun ? "SIMULAR DELETE" : "DELETE";
    console.log(`${verb} pivot ${name}`);
    if (!dryRun) {
      await connection.query(`DELETE FROM ${quoted}`);
    }
  }
}

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    const neverList = [...NEVER_DELETE_SLUGS].map((s) => `'${s.replace(/'/g, "''")}'`).join(",");

    const [junkPages] = await connection.query(
      `SELECT id, slug, title FROM pages WHERE slug REGEXP ? AND slug NOT IN (${neverList})`,
      [JUNK_PAGE_SLUG_REGEXP],
    );

    console.log(`Páginas candidatas à remoção: ${junkPages.length}`);
    for (const row of junkPages.slice(0, 40)) {
      console.log(`  - ${row.slug} (${row.title})`);
    }
    if (junkPages.length > 40) {
      console.log(`  … e mais ${junkPages.length - 40}`);
    }

    const pageIds = junkPages.map((r) => r.id);
    if (pageIds.length > 0) {
      const placeholders = pageIds.map(() => "?").join(",");
      const verb = dryRun ? "SIMULAR" : "Executando";
      console.log(`${verb}: remover seo_metadata + pages (${pageIds.length} páginas)`);
      if (!dryRun) {
        await connection.query(`DELETE FROM seo_metadata WHERE entity_type = 'PAGE' AND entity_id IN (${placeholders})`, pageIds);
        await connection.query(`DELETE FROM pages WHERE id IN (${placeholders})`, pageIds);
      }
    }

    const [productCountRows] = await connection.query("SELECT COUNT(*) AS n FROM products");
    const productCount = productCountRows[0]?.n ?? 0;
    console.log(`Produtos na base: ${productCount}`);
    const verbProd = dryRun ? "SIMULAR" : "Executando";
    console.log(`${verbProd}: remover todos os produtos e pivôs`);

    if (!dryRun && productCount > 0) {
      await connection.query("DELETE FROM seo_metadata WHERE entity_type = 'PRODUCT'");
      await clearProductPivotTables(connection);
      await connection.query("DELETE FROM products");
    }

    if (dryRun && productCount > 0) {
      await clearProductPivotTables(connection);
    }

    console.log(dryRun ? "Dry-run concluído (nada foi alterado)." : "Limpeza concluída.");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
