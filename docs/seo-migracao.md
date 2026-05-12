# SEO e migracao WordPress

## Principios

- Nao alterar o WordPress atual durante a migracao.
- Preservar slugs, URLs, categorias, tags, ALT tags e metadados Yoast.
- Manter redirects 301 para qualquer URL antiga que nao puder ser servida exatamente igual.
- Manter caminhos antigos de midia quando possivel, principalmente `/wp-content/uploads/...`.

## Rotas preservadas

```text
/
/blog
/blog/:slug
/:slug
/categoria/:slug
/passeios/:slug
```

## Metadados

Cada pagina publica deve renderizar:

- `title`
- `meta description`
- `canonical`
- Open Graph
- Twitter Cards
- JSON-LD
- Breadcrumb Schema
- Article Schema para posts
- FAQ Schema para paginas de perguntas frequentes

## Sitemap e robots

Gerar com:

```powershell
node scripts/generate-sitemap.mjs
```

O sitemap usa `DATABASE_URL` quando disponivel e gera arquivos em `frontend/cliente/public`.

## Checklist antes do go-live

- Exportar lista de URLs indexadas do Google Search Console.
- Comparar URLs do WordPress com URLs geradas no novo banco.
- Testar 301 em massa.
- Validar dados estruturados no Rich Results Test.
- Validar Core Web Vitals em paginas principais.
- Confirmar que imagens antigas continuam acessiveis.
