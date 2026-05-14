/**
 * Converte URLs de mídia migradas (WordPress → pasta única, /imagens, R2) em caminhos sob
 * `public/` (`/imagens/<arquivo>`).
 *
 * Caminhos legados `/wp-content/uploads/ano/mês/arquivo` viram `/imagens/arquivo`.
 *
 * Os arquivos servidos pelo Vite ficam em `frontend/cliente/public/imagens/`. Evite
 * prefixar estes URLs com o domínio do WordPress: o PHP costuma não expor a mesma
 * árvore plana sob `/imagens/…`, pelo que esse padrão gera centenas de 404 no browser.
 */

/** Migração: uploads WP em árvore por ano → um único diretório público. */
function wpUploadsPathToImagens(localPath: string): string {
  const trimmed = localPath.trim();
  if (!trimmed.startsWith("/wp-content/uploads/")) {
    return trimmed;
  }

  const parts = trimmed.split("/").filter(Boolean);
  const file = parts[parts.length - 1];

  return file ? `/imagens/${file}` : trimmed;
}

function normalizeToLocalPath(url: string): string {
  const trimmed = url.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return wpUploadsPathToImagens(trimmed);
  }

  const uploadsIdx = trimmed.indexOf("/wp-content/uploads/");
  if (uploadsIdx !== -1) {
    return wpUploadsPathToImagens(trimmed.slice(uploadsIdx));
  }

  const imagensSlash = trimmed.match(/\/imagens\/([^?#]+)/i);
  if (imagensSlash) {
    return `/imagens/${imagensSlash[1]}`;
  }

  try {
    const hostPath = new URL(trimmed).pathname;
    const imagensPath = hostPath.match(/^\/imagens\/(.+)/i);
    if (imagensPath) {
      return `/imagens/${imagensPath[1]}`;
    }

    const wpPath = hostPath.match(/^(\/wp-content\/uploads\/.+)/i);
    if (wpPath) {
      return wpUploadsPathToImagens(wpPath[1]!);
    }
  } catch {
    /* não é URL absoluta válida */
  }

  return trimmed;
}

export function toPublicAssetUrl(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== "string") {
    return undefined;
  }

  return normalizeToLocalPath(url.trim());
}

function rewriteSrcsetList(value: string): string {
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) {
        return part;
      }

      const tokens = trimmed.split(/\s+/);
      const urlToken = tokens[0];
      if (!urlToken) {
        return part;
      }

      const descriptor = tokens.slice(1).join(" ");
      const mapped = toPublicAssetUrl(urlToken) ?? urlToken;

      return descriptor ? `${mapped} ${descriptor}` : mapped;
    })
    .join(", ");
}

function replaceHtmlAttr(html: string, attr: string, multival: boolean): string {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}=(["'])([^"']*)\\1`, "gi");

  return html.replace(re, (_full, quote: string, raw: string) => {
    const next = multival ? rewriteSrcsetList(raw) : toPublicAssetUrl(raw) ?? raw;

    return `${attr}=${quote}${next}${quote}`;
  });
}

/**
 * Atributos comuns de mídia no HTML migrado (incl. lazy-load do WordPress).
 * Ordem: nomes mais longos primeiro; `src` / `srcset` só com lookbehind para não
 * colidir com `data-src` etc.
 */
export function rewriteHtmlMediaUrls(html: string): string {
  if (!html) {
    return html;
  }

  let out = html;
  out = replaceHtmlAttr(out, "data-lazy-srcset", true);
  out = replaceHtmlAttr(out, "data-lazy-src", false);
  out = replaceHtmlAttr(out, "data-srcset", true);
  out = replaceHtmlAttr(out, "data-src", false);
  out = replaceHtmlAttr(out, "poster", false);

  out = out.replace(/(?<![\w-])srcset=(["'])([^"']*)\1/gi, (_full, quote: string, raw: string) => {
    const next = rewriteSrcsetList(raw);

    return `srcset=${quote}${next}${quote}`;
  });

  out = out.replace(/(?<![\w-])src=(["'])([^"']*)\1/gi, (_full, quote: string, raw: string) => {
    const next = toPublicAssetUrl(raw) ?? raw;

    return `src=${quote}${next}${quote}`;
  });

  return out;
}
