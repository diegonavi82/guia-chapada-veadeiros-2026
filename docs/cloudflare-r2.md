# Cloudflare R2

## Configuracao atual

- `R2_ACCOUNT_ID=f193477484803ad81916e60d6b2e1ea1`
- `R2_ENDPOINT=https://f193477484803ad81916e60d6b2e1ea1.r2.cloudflarestorage.com`
- `R2_BUCKET_ENDPOINT=https://f193477484803ad81916e60d6b2e1ea1.r2.cloudflarestorage.com/guia-chapada-veadeiros`
- `R2_BUCKET=guia-chapada-veadeiros`
- `R2_PUBLIC_URL=https://pub-bc1746f210fa412fa702c716c5137680.r2.dev`

## Teste

```powershell
npm run r2:test
```

## Estrategia de imagens

Durante a migracao, os arquivos devem ser copiados para o R2 preservando a chave antiga:

```text
wp-content/uploads/2024/01/exemplo.jpg
```

Assim podemos manter compatibilidade com imagens indexadas e criar redirects/rewrite no CDN quando necessario.

## Producao

Antes do deploy final, trocar o dominio `r2.dev` por um subdominio proprio, por exemplo:

```text
https://media.guiadachapadaveadeiros.com
```

Como a chave foi compartilhada durante configuracao, gere uma nova chave para producao e atualize apenas o `.env` do servidor.
