/**
 * Para cada página/post publicado no banco, baixa do site ao vivo (mesmo slug)
 * a imagem principal da matéria e grava em frontend/cliente/public/imagens/.
 * Atualiza featured_image para o caminho local (/imagens/<arquivo>).
 *
 * Uso:
 *   node scripts/scrape-live-site-featured-images.mjs
 *   node scripts/scrape-live-site-featured-images.mjs --limit 10
 *   node scripts/scrape-live-site-featured-images.mjs --dry-run
 *
 * Requer DATABASE_URL no .env da raiz.
 * Opcional: SCRAPE_RESET_CADASTR=1 zera featured_image que foi preenchido só com o selo Cadastur (reescreva com critério novo).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "frontend", "cliente", "public");
const BASE = (process.env.LIVE_SITE_BASE ?? "https://www.guiachapadaveadeiros.com").replace(/\/$/, "");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 GuiaChapadaImageSync/1.0";

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const limitIdx = argv.indexOf("--limit");
  const limit = limitIdx !== -1 && argv[limitIdx + 1] ? parseInt(argv[limitIdx + 1], 10) : 0;
  return { dryRun, limit: Number.isFinite(limit) && limit > 0 ? limit : 0 };
}

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Defina ${name} no .env`);
  return v;
}

function absolutize(url) {
  if (!url) return null;
  const u = url.trim().split("?")[0].split("#")[0];
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("http")) return u;
  if (u.startsWith("/")) return `${BASE}${u}`;
  return `${BASE}/${u}`;
}

function uploadsRelativeFromAbsolute(fullUrl) {
  const abs = absolutize(fullUrl);
  if (!abs) return null;
  const idx = abs.indexOf("/wp-content/uploads/");
  if (idx === -1) return null;
  return abs.slice(idx);
}

/** Ignora logo, favicon e ícones de plugin no critério de “foto da matéria”. */
function isNoiseSrc(src, tag) {
  const s = src.toLowerCase();
  if (!s.includes("/wp-content/uploads/")) return true;
  if (/logo-guia-chapada|guia-chapada-dos-veadeiros-favicon|standard-logo|payment_cards|placeholder\.png|sb-instagram|fusion-styles\/|cadastur-guia-chapada-dos-veadeiros/i.test(s))
    return true;
  if (/class="[^"]*fusion-standard-logo/i.test(tag)) return true;
  return false;
}

/** Lista ordenada de candidatos; o download tenta um por um até funcionar. */
function pickImageCandidates(html) {
  const candidates = [];
  const seen = new Set();
  const push = (u) => {
    const a = absolutize(u);
    if (!a || seen.has(a)) return;
    if (!uploadsRelativeFromAbsolute(a)) return;
    seen.add(a);
    candidates.push(a);
  };

  const og = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  const ogW = html.match(/<meta\s+property=["']og:image:width["']\s+content=["'](\d+)["']/i);
  const ogWidth = ogW ? parseInt(ogW[1], 10) : 0;
  if (og && ogWidth >= 400 && !isNoiseSrc(og[1], "")) push(og[1]);

  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)];
  const scored = [];
  for (const m of imgTags) {
    const tag = m[0];
    const srcM = tag.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcM) continue;
    const src = srcM[1];
    if (isNoiseSrc(src, tag)) continue;
    const w = parseInt(tag.match(/\bwidth=["'](\d+)["']/i)?.[1] || "0", 10);
    const high = /fetchpriority=["']high["']/i.test(tag);
    let score = w;
    if (high) score += 800;
    scored.push({ src: absolutize(src), score });
  }
  scored.sort((a, b) => b.score - a.score);
  for (const { src } of scored) push(src);

  if (og && !isNoiseSrc(og[1], "")) push(og[1]);

  return candidates;
}

/**
 * URLs /gcv-home/* no site ao vivo retornam 404; usa o arquivo já em public/imagens quando existir.
 */
async function resolveGcvHomeFromImagensRepo(url) {
  const abs = absolutize(url);
  if (!abs) return null;
  const m = abs.match(/\/wp-content\/uploads\/gcv-home\/([^?#]+)$/i);
  if (!m) return null;
  const base = m[1];
  const src = path.join(PUBLIC, "imagens", base);
  if (!(await fileExists(src))) return null;
  return `/imagens/${base}`;
}

async function tryDownloadFirstWorking(candidates) {
  for (const url of candidates) {
    const rel = uploadsRelativeFromAbsolute(url);
    if (!rel) continue;
    const dest = path.join(PUBLIC, "imagens", path.basename(rel));
    const flatRel = `/imagens/${path.basename(rel)}`;
    if (await fileExists(dest)) return flatRel;
    const saved = await downloadImage(url);
    if (saved) return saved;
    const gcv = await resolveGcvHomeFromImagensRepo(url);
    if (gcv) return gcv;
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) return null;
  return res.text();
}

async function downloadImage(fullUrl) {
  const rel = uploadsRelativeFromAbsolute(fullUrl);
  if (!rel) return null;
  const flatRel = `/imagens/${path.basename(rel)}`;
  const dest = path.join(PUBLIC, "imagens", path.basename(rel));
  if (await fileExists(dest)) {
    return flatRel;
  }
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(absolutize(fullUrl), { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) {
    console.warn(`  download falhou ${res.status}: ${absolutize(fullUrl)}`);
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  return flatRel;
}

async function main() {
  const { dryRun, limit } = parseArgs();
  const connection = await mysql.createConnection(required("DATABASE_URL"));

  if (process.env.SCRAPE_RESET_CADASTR === "1") {
    const pattern = "%cadastur-guia-chapada-dos-veadeiros%";
    const [rp] = await connection.execute(`update pages set featured_image = null where featured_image like ?`, [pattern]);
    const [rs] = await connection.execute(`update posts set featured_image = null where featured_image like ?`, [pattern]);
    console.log(
      `SCRAPE_RESET_CADASTR: páginas afetadas=${(rp && rp.affectedRows) ?? 0}, posts=${(rs && rs.affectedRows) ?? 0}\n`,
    );
  }

  const [pages] = await connection.query(
    `select slug, 'page' as kind from pages where status = 'PUBLISHED' order by slug`,
  );
  const [posts] = await connection.query(
    `select slug, 'post' as kind from posts where status = 'PUBLISHED' order by slug`,
  );

  let rows = [...pages, ...posts];
  if (limit) rows = rows.slice(0, limit);

  console.log(`Base ao vivo: ${BASE}`);
  console.log(`Itens: ${rows.length}${dryRun ? " (dry-run)" : ""}\n`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < rows.length; i++) {
    const { slug, kind } = rows[i];
    const pageUrl = `${BASE}/${encodeURI(slug)}/`;

    process.stdout.write(`[${i + 1}/${rows.length}] ${kind} ${slug} ... `);

    const html = await fetchText(pageUrl);
    if (!html) {
      console.log("página não carregou");
      fail += 1;
      await sleep(450);
      continue;
    }

    const candidates = pickImageCandidates(html);
    if (candidates.length === 0) {
      console.log("sem imagem detectada");
      skip += 1;
      await sleep(450);
      continue;
    }

    if (dryRun) {
      const first = uploadsRelativeFromAbsolute(candidates[0]);
      console.log(first ? `→ /imagens/${path.basename(first)}` : "URL fora de uploads");
      ok += 1;
      await sleep(450);
      continue;
    }

    const saved = await tryDownloadFirstWorking(candidates);
    if (!saved) {
      fail += 1;
      await sleep(450);
      continue;
    }

    const table = kind === "page" ? "pages" : "posts";
    await connection.execute(`update ${table} set featured_image = ? where slug = ?`, [saved, slug]);
    console.log(`ok ${saved}`);
    ok += 1;
    await sleep(450);
  }

  await connection.end();
  console.log(`\nConcluído. ok=${ok} skip=${skip} fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
