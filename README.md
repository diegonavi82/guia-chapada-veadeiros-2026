# Guia Chapada Veadeiros 2026

Nova plataforma para substituir o frontend WordPress atual sem alterar o site existente durante a migracao.

## Stack

- Frontend cliente: React, Vite, TypeScript, TailwindCSS e React Router
- Frontend admin: React, Vite, TypeScript, TailwindCSS e React Router
- API: Node.js, Fastify, Prisma e MySQL
- Storage: Cloudflare R2
- Imagens: Sharp, WebP e AVIF
- SEO: metadados dinamicos, canonical, Open Graph, Twitter Cards, JSON-LD, sitemap, robots e redirects 301

## Estrutura

```text
frontend/
  cliente/
  admin/
api/
database/
shared/
scripts/
uploads/
docs/
```

## Primeiros passos

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run dev
```

Antes de rodar migracoes reais, preencha `DATABASE_URL`, `WP_DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`.

## R2

As credenciais do Cloudflare R2 ficam em `.env`. O arquivo `.env.example` contem apenas placeholders para segredos.

Teste:

```powershell
npm run r2:test
```

## SEO e migracao

O objetivo e preservar URLs, slugs, categorias, tags, ALT tags, imagens indexadas e metadados SEO do WordPress. A nova aplicacao deve respeitar as rotas existentes, por exemplo:

```text
/vale-da-lua
/cachoeira-santa-barbara
/blog/slug-artigo
```

Nenhum script deve modificar o WordPress atual. A leitura do banco WordPress e dos uploads deve ser somente leitura.
