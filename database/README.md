# Database

O schema oficial fica em `api/prisma/schema.prisma`.

## Tabelas principais

- `users`
- `posts`
- `pages`
- `products`
- `categories`
- `tags`
- `media`
- `seo_metadata`
- `redirects`
- `settings`

## Comandos

```powershell
npm run db:generate
npm run db:migrate
npm run seed
```

Use um banco MySQL novo e limpo. Nao aponte `DATABASE_URL` para o banco WordPress.
