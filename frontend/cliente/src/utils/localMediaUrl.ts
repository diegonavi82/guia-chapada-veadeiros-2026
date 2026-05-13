/**
 * Converte URLs absolutas de mídia migradas (WordPress, /imagens, R2) em caminhos
 * servidos pelo próprio site em `public/` (`/wp-content/uploads/...` ou `/imagens/...`).
 */
export function toPublicAssetUrl(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== "string") {
    return undefined;
  }

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
  } catch {
    /* não é URL absoluta válida */
  }

  return trimmed;
}

/** Reescreve `src` de tags <img> no HTML para caminhos locais quando aplicável. */
export function rewriteHtmlMediaUrls(html: string): string {
  if (!html) {
    return html;
  }

  return html.replace(/\bsrc=(["'])([^"']+)\1/gi, (_full, quote: string, src: string) => {
    const next = toPublicAssetUrl(src);

    return next && next !== src ? `src=${quote}${next}${quote}` : `src=${quote}${src}${quote}`;
  });
}
