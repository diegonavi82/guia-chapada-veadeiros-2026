import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const siteUrl = (process.env.CLIENTE_BASE_URL ?? "https://guiadachapadaveadeiros.com").replace(/\/$/, "");
const staticRoutes = ["/", "/blog", "/atrativos", "/faq", "/contato", "/busca"];
const publicDir = path.resolve("frontend/cliente/public");

async function getDynamicRoutes() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [posts] = await connection.query("select slug, updated_at from posts where status = 'PUBLISHED'");
  const [pages] = await connection.query("select slug, updated_at from pages where status = 'PUBLISHED'");
  const [products] = await connection.query("select slug, updated_at from products where status = 'PUBLISHED'");
  await connection.end();

  return [
    ...posts.map((item) => ({ loc: `/blog/${item.slug}`, lastmod: item.updated_at })),
    ...pages.map((item) => ({ loc: `/${item.slug}`, lastmod: item.updated_at })),
    ...products.map((item) => ({ loc: `/passeios/${item.slug}`, lastmod: item.updated_at })),
  ];
}

const dynamicRoutes = await getDynamicRoutes();
const urls = [
  ...staticRoutes.map((loc) => ({ loc })),
  ...dynamicRoutes,
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${siteUrl}${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await fs.mkdir(publicDir, { recursive: true });
await fs.writeFile(path.join(publicDir, "sitemap.xml"), xml);
await fs.writeFile(
  path.join(publicDir, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

console.log(`Sitemap gerado com ${urls.length} URLs.`);
