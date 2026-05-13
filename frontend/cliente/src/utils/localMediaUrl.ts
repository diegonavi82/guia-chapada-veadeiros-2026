/**
 * Converte URLs de mídia migradas (WordPress, /imagens, R2) em caminhos sob
 * `public/` (`/wp-content/uploads/...` ou `/imagens/...`).
 *
 * Opcional: `VITE_PUBLIC_MEDIA_BASE` (ex.: https://www.guiachapadaveadeiros.com)
 * prefixa esses caminhos quando os arquivos ainda não foram copiados para `public/`.
 */

const mediaBase = (import.meta.env.VITE_PUBLIC_MEDIA_BASE ?? "").replace(/\/$/, "");

function shouldPrefixWithMediaBase(path: string): boolean {
  return path.startsWith("/imagens/") || path.startsWith("/wp-content/");
}

function applyMediaBase(path: string): string {
  if (!mediaBase || !shouldPrefixWithMediaBase(path)) {
    return path;
  }

  return `${mediaBase}${path}`;
}

function normalizeToLocalPath(url: string): string {
  const trimmed = url.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  const uploadsIdx = trimmed.indexOf("/wp-content/uploads/");
  if (uploadsIdx !== -1) {
    return trimmed.slice(uploadsIdx);
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
      return wpPath[1]!;
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

  const local = normalizeToLocalPath(url.trim());

  return applyMediaBase(local);
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
