import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(root, "..", "guia chapada veadeiros", "wp-content", "uploads");
const dest = path.join(root, "frontend", "cliente", "public", "wp-content", "uploads");

const source =
  process.argv[2]?.trim() ||
  process.env.WP_UPLOADS_SOURCE?.trim() ||
  (process.env.WP_UPLOADS_PATH?.trim()
    ? path.isAbsolute(process.env.WP_UPLOADS_PATH)
      ? process.env.WP_UPLOADS_PATH
      : path.resolve(root, process.env.WP_UPLOADS_PATH)
    : null) ||
  defaultSource;

if (!fs.existsSync(source)) {
  console.error(
    [
      "Pasta de uploads do WordPress não encontrada:",
      source,
      "",
      "Baixe do servidor o diretório wp-content/uploads (FTP ou backup) e informe o caminho, ex.:",
      `  node scripts/sync-wp-uploads-to-public.mjs "D:\\caminho\\para\\uploads"`,
      "",
      "Ou defina WP_UPLOADS_SOURCE ou WP_UPLOADS_PATH no .env da raiz.",
    ].join("\n"),
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(source, dest, { recursive: true });

console.log("Copiado:");
console.log(`  origem: ${source}`);
console.log(`  destino: ${dest}`);
console.log("URLs no site passam a funcionar como /wp-content/uploads/... (após normalização no cliente ou SQL).");
