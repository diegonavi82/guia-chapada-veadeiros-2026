/**
 * Baixa as páginas públicas do guia no WordPress e extrai imagens das galerias Avada Fusion
 * (class fusion-gallery-image), preservando src, alt e title para SEO.
 *
 * Uso (raiz do repo): node scripts/scrape-fusion-galleries.mjs
 * Slugs vêm de shared/src/waterfallMap.ts (hotspots do mapa).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WATERFALL_TS = path.join(ROOT, "shared/src/waterfallMap.ts");
const OUT_JSON = path.join(ROOT, "frontend/cliente/src/data/attractionGalleries.json");

const LIVE_ORIGIN = "https://www.guiachapadaveadeiros.com";
const DELAY_MS = 450;

function readWaterfallSlugs() {
  const txt = fs.readFileSync(WATERFALL_TS, "utf8");
  const slugs = [...txt.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(slugs)];
  return unique;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractFusionGalleryImages(html) {
  const out = [];
  const seen = new Set();

  const blockRe = /<div[^>]*class="[^"]*\bfusion-gallery-image\b[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let m;

  while ((m = blockRe.exec(html)) !== null) {
    const inner = m[1];
    const imgMatch = inner.match(/<img\b([^>]*)\/?>/i);
    if (!imgMatch) {
      continue;
    }

    const attrs = imgMatch[1];
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!src || src.startsWith("data:")) {
      continue;
    }

    if (/cachoeiras-guia-chapada-veadeiros-2022/i.test(src)) {
      continue;
    }

    const alt = attrs.match(/\balt=["']([^"']*)["']/i)?.[1]?.trim() ?? "";
    const title = attrs.match(/\btitle=["']([^"']*)["']/i)?.[1]?.trim() ?? "";
    const aria = attrs.match(/\baria-label=["']([^"']*)["']/i)?.[1]?.trim() ?? "";

    const key = src.replace(/\?.*$/, "");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const altFinal = alt || aria;
    const titleFinal = title || aria;

    out.push({
      src: src.startsWith("http") ? src : `${LIVE_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`,
      alt: altFinal,
      title: titleFinal || undefined,
    });
  }

  return out;
}

async function fetchHtml(slug) {
  const url = `${LIVE_ORIGIN}/${slug.replace(/^\/+|\/+$/g, "")}/`;
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; GuiaChapadaGallerySync/1.0; +https://www.guiachapadaveadeiros.com)",
      "accept-language": "pt-BR,pt;q=0.9",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.text();
}

async function main() {
  const slugs = readWaterfallSlugs();
  /** @type {Record<string, { src: string; alt: string; title?: string }[]>} */
  const manifest = {};
  const errors = [];

  console.log(`${slugs.length} slugs do mapa.`);

  for (const slug of slugs) {
    process.stdout.write(`${slug} … `);

    try {
      const html = await fetchHtml(slug);
      const images = extractFusionGalleryImages(html);
      manifest[slug] = images;
      console.log(images.length ? `${images.length} fotos` : "sem galeria Fusion");
    } catch (e) {
      errors.push({ slug, message: String(e?.message ?? e) });
      manifest[slug] = [];
      console.log(`erro: ${e?.message ?? e}`);
    }

    await sleep(DELAY_MS);
  }

  const sortedManifest = Object.keys(manifest)
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .reduce((acc, slug) => {
      acc[slug] = manifest[slug];
      return acc;
    }, {});

  const output = {
    _meta: {
      source: LIVE_ORIGIN,
      generator: "scripts/scrape-fusion-galleries.mjs",
      note: "Campos alt/title preservados do HTML. Regenere após mudanças no site oficial.",
    },
    ...sortedManifest,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`\nEscrito: ${path.relative(ROOT, OUT_JSON)}`);

  if (errors.length) {
    console.warn("\nFalhas:", errors);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
