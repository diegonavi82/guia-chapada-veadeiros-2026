/**
 * Baixa imagens da galeria (production www) para `frontend/cliente/public/imagens/`
 * e reescreve `src` em `attractionGalleries.json` para `/imagens/<arquivo>`.
 * Preserva `alt` e `title`. Usa a mesma regra de “original” que `AttractionPhotoGallery`
 * (remove sufixo `-460x295` etc. antes do download).
 *
 * Uso (raiz): node scripts/download-gallery-images-to-public.mjs
 *   --dry-run   só lista o que faria
 *   --force     baixa de novo mesmo se o arquivo já existir
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "frontend/cliente/src/data/attractionGalleries.json");
const PUBLIC_IMAGENS = path.join(ROOT, "frontend/cliente/public/imagens");
const LIVE_ORIGIN = "https://www.guiachapadaveadeiros.com";
const DELAY_MS = 400;

function wpPreferOriginalSrc(url) {
  return url.replace(/-\d+x\d+(?=\.(?:jpg|jpeg|png|webp)(?:\?|$))/i, "");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadOne(fetchUrl, destPath, force) {
  if (!force && fs.existsSync(destPath)) {
    const st = fs.statSync(destPath);
    if (st.size > 0) {
      return { skipped: true };
    }
  }

  const res = await fetch(fetchUrl, {
    headers: {
      "User-Agent": "GuiaChapadaVeadeiros-GalleryMirror/1.0 (repo-local)",
      Accept: "image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);

  return { skipped: false, bytes: buf.length };
}

function resolveFetchUrl(preferred) {
  const trimmed = preferred.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  const pathOnly = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${LIVE_ORIGIN}${pathOnly}`;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  /** @type {Map<string, string>} pathname -> fetchUrl */
  const byPath = new Map();

  for (const key of Object.keys(data)) {
    if (key === "_meta") {
      continue;
    }
    const arr = data[key];
    if (!Array.isArray(arr)) {
      continue;
    }
    for (const item of arr) {
      if (!item?.src || typeof item.src !== "string") {
        continue;
      }
      const preferred = wpPreferOriginalSrc(item.src.trim());
      let pathname;
      try {
        pathname = new URL(resolveFetchUrl(preferred)).pathname;
      } catch {
        console.warn("URL inválida, ignorando:", item.src);
        continue;
      }
      if (!pathname.startsWith("/wp-content/uploads/")) {
        console.warn("Fora de /wp-content/uploads/, ignorando:", pathname);
        continue;
      }
      const fetchUrl = resolveFetchUrl(preferred);
      byPath.set(pathname, fetchUrl);
    }
  }

  console.log(`${byPath.size} arquivo(s) único(s) (basename em public/imagens/)`);

  const failures = [];
  let downloaded = 0;
  let skipped = 0;

  const paths = [...byPath.keys()].sort();
  for (let i = 0; i < paths.length; i++) {
    const pathname = paths[i];
    const fetchUrl = byPath.get(pathname);
    const destPath = path.join(PUBLIC_IMAGENS, path.basename(pathname));

    process.stdout.write(`[${i + 1}/${paths.length}] ${pathname} `);

    if (dryRun) {
      console.log(dryRun ? "(dry-run)" : "");
      continue;
    }

    try {
      const r = await downloadOne(fetchUrl, destPath, force);
      if (r.skipped) {
        skipped++;
        console.log("já existe, pulado.");
      } else {
        downloaded++;
        console.log(`OK (${r.bytes} bytes)`);
      }
    } catch (e) {
      failures.push({ pathname, fetchUrl, error: String(e?.message ?? e) });
      console.log(`FALHA: ${e?.message ?? e}`);
    }

    if (i < paths.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  if (dryRun) {
    console.log("Dry-run: JSON não alterado.");
    return;
  }

  let rewritten = 0;
  for (const key of Object.keys(data)) {
    if (key === "_meta") {
      continue;
    }
    const arr = data[key];
    if (!Array.isArray(arr)) {
      continue;
    }
    for (const item of arr) {
      if (!item?.src || typeof item.src !== "string") {
        continue;
      }
      const preferred = wpPreferOriginalSrc(item.src.trim());
      let pathname;
      try {
        pathname = new URL(resolveFetchUrl(preferred)).pathname;
      } catch {
        continue;
      }
      if (!pathname.startsWith("/wp-content/uploads/")) {
        continue;
      }
      const imagensSrc = `/imagens/${path.basename(pathname)}`;
      if (item.src !== imagensSrc) {
        rewritten++;
      }
      item.src = imagensSrc;
    }
  }

  data._meta = {
    ...(data._meta && typeof data._meta === "object" ? data._meta : {}),
    source: LIVE_ORIGIN,
    migratedToPublic: "frontend/cliente/public/imagens",
    note: "Imagens servidas localmente; alt/title preservados do HTML original. Regenere lista com scripts/scrape-fusion-galleries.mjs se mudar o site vivo.",
  };

  fs.writeFileSync(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log("");
  console.log(`Baixados: ${downloaded}, já existiam: ${skipped}, entradas JSON reescritas: ${rewritten}`);
  if (failures.length) {
    console.log(`Falhas (${failures.length}):`);
    for (const f of failures) {
      console.log(`  ${f.pathname} ← ${f.fetchUrl}`);
      console.log(`    ${f.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
