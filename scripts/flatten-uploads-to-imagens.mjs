/**
 * Move todas as mídias de `frontend/cliente/public/wp-content/uploads/**`
 * para `frontend/cliente/public/imagens/` (apenas o nome do arquivo).
 * Atualiza `attractionGalleries.json` e remove `public/wp-content/`.
 *
 * Uso (raiz): node scripts/flatten-uploads-to-imagens.mjs
 *   --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const UPLOADS = path.join(ROOT, "frontend", "cliente", "public", "wp-content", "uploads");
const IMAGENS = path.join(ROOT, "frontend", "cliente", "public", "imagens");
const GALLERY_JSON = path.join(ROOT, "frontend", "cliente", "src", "data", "attractionGalleries.json");

function listFilesRecursive(dir) {
  /** @type {string[]} */
  const out = [];
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...listFilesRecursive(full));
    } else if (name.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function wpUploadsPathToImagens(webPath) {
  const trimmed = String(webPath).trim();
  const base = trimmed.split("/").filter(Boolean).pop();
  return base ? `/imagens/${base}` : trimmed;
}

function main() {
  const dry = process.argv.includes("--dry-run");

  const files = listFilesRecursive(UPLOADS);
  if (!files.length) {
    console.log("Nada em public/wp-content/uploads — já migrado ou pasta vazia.");
    return;
  }

  /** @type {{ from: string; to: string; base: string }[]} */
  const plan = [];
  const byBase = new Map();

  for (const abs of files) {
    const base = path.basename(abs);
    const prev = byBase.get(base);
    if (prev && prev !== abs) {
      console.error(`Colisão de nome: "${base}" em\n  ${prev}\n  ${abs}\nRenomeie um dos arquivos e rode de novo.`);
      process.exit(1);
    }
    byBase.set(base, abs);
    plan.push({ from: abs, to: path.join(IMAGENS, base), base });
  }

  console.log(`${plan.length} arquivo(s) → public/imagens/`);

  if (!dry) {
    fs.mkdirSync(IMAGENS, { recursive: true });
    for (const { from, to } of plan) {
      fs.copyFileSync(from, to);
    }
  }

  if (fs.existsSync(GALLERY_JSON)) {
    const data = JSON.parse(fs.readFileSync(GALLERY_JSON, "utf8"));
    let n = 0;
    for (const key of Object.keys(data)) {
      if (key === "_meta") {
        continue;
      }
      const row = data[key];
      if (!Array.isArray(row)) {
        continue;
      }
      for (const item of row) {
        if (!item?.src || typeof item.src !== "string") {
          continue;
        }
        const next = wpUploadsPathToImagens(item.src);
        if (next !== item.src) {
          n++;
        }
        item.src = next;
      }
    }
    data._meta = {
      ...(data._meta && typeof data._meta === "object" ? data._meta : {}),
      migratedToPublic: "frontend/cliente/public/imagens",
      note: "Imagens em pasta única public/imagens; URLs relativas /imagens/<arquivo>.",
    };
    if (!dry) {
      fs.writeFileSync(GALLERY_JSON, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    }
    console.log(`attractionGalleries.json: ${n} src(s) reescrito(s).`);
  }

  const wpContentPublic = path.join(ROOT, "frontend", "cliente", "public", "wp-content");
  if (!dry && fs.existsSync(wpContentPublic)) {
    fs.rmSync(wpContentPublic, { recursive: true, force: true });
    console.log("Removido: frontend/cliente/public/wp-content/");
  }

  if (dry) {
    console.log("Dry-run: arquivos e JSON não alterados.");
  }
}

main();
