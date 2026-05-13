import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
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

console.log("Copiado para staging:");
console.log(`  origem: ${source}`);
console.log(`  destino temp: ${dest}`);
console.log("Achatando para frontend/cliente/public/imagens/ ...");

const flattenScript = path.join(root, "scripts", "flatten-uploads-to-imagens.mjs");
const flat = spawnSync(process.execPath, [flattenScript], { cwd: root, stdio: "inherit" });

if (flat.status !== 0 && flat.status !== null) {
  process.exit(flat.status);
}

console.log("Pronto: imagens servidas como /imagens/<arquivo> (legado /wp-content/uploads no HTML vira /imagens no cliente).");
