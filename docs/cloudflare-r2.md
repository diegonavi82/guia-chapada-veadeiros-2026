# Cloudflare R2

## Configuracao

Preencha no `.env` local (nao versionado), por exemplo:

- `R2_ACCOUNT_ID` — ID da conta Cloudflare
- `R2_ENDPOINT` — endpoint S3-compatible do R2
- `R2_BUCKET` — nome do bucket
- `R2_PUBLIC_URL` — URL publica de leitura (ex.: subdominio r2.dev ou custom domain)

## Teste

```powershell
npm run r2:test
```

## Estrategia de imagens

Durante a migracao, os arquivos podem ser copiados para o R2 preservando a chave antiga:

```text
wp-content/uploads/2024/01/exemplo.jpg
```

Assim mantemos compatibilidade com imagens indexadas e redirects/rewrite no CDN quando necessario.

## Producao

Antes do deploy final, prefira um subdominio proprio para midia, por exemplo:

```text
https://media.seudominio.com
```

Gire as chaves de acesso periodicamente e nunca commite o `.env`.
