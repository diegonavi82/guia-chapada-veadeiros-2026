import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPublicAssetUrl } from "../utils/localMediaUrl";

export type AttractionGalleryItem = {
  src: string;
  alt?: string;
  title?: string;
};

/** Remove sufixo de miniatura típico do WordPress (-460x295 etc.) para pedir o arquivo principal. */
function wpPreferOriginalSrc(url: string) {
  return url.replace(/-\d+x\d+(?=\.(?:jpg|jpeg|png|webp)(?:\?|$))/i, "");
}

type PreparedItem = {
  src: string;
  alt: string;
  caption: string;
};

type Props = {
  items: AttractionGalleryItem[];
  pageTitle: string;
};

export function AttractionPhotoGallery({ items, pageTitle }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const prepared = useMemo<PreparedItem[]>(() => {
    return items.map((item, index) => {
      const raw = wpPreferOriginalSrc(item.src.trim());
      const src = toPublicAssetUrl(raw) ?? raw;
      const caption = (item.alt?.trim() || item.title?.trim() || "").trim();
      const alt =
        caption ||
        (pageTitle ? `${pageTitle} — foto ${index + 1}` : `Foto ${index + 1} da galeria`);

      return { src, alt, caption };
    });
  }, [items, pageTitle]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || prepared.length === 0) return null;
      return (i - 1 + prepared.length) % prepared.length;
    });
  }, [prepared.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || prepared.length === 0) return null;
      return (i + 1) % prepared.length;
    });
  }, [prepared.length]);

  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    prevFocusRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      prevFocusRef.current?.focus?.();
    };
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  if (!prepared.length) {
    return null;
  }

  const lightboxItem = lightboxIndex !== null ? prepared[lightboxIndex] : null;

  const lightbox =
    lightboxItem !== null && lightboxIndex !== null ? (
      <div
        className="gcv-photo-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`Galeria de fotos — imagem ${lightboxIndex + 1} de ${prepared.length}`}
      >
        <button
          type="button"
          className="gcv-photo-lightbox__backdrop"
          aria-label="Fechar galeria"
          onClick={closeLightbox}
        />
        <div className="gcv-photo-lightbox__inner">
          <button
            ref={closeBtnRef}
            type="button"
            className="gcv-photo-lightbox__close"
            aria-label="Fechar"
            onClick={closeLightbox}
          >
            ×
          </button>

          {prepared.length > 1 ? (
            <button
              type="button"
              className="gcv-photo-lightbox__nav gcv-photo-lightbox__nav--prev"
              aria-label="Foto anterior"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              ‹
            </button>
          ) : null}

          {prepared.length > 1 ? (
            <button
              type="button"
              className="gcv-photo-lightbox__nav gcv-photo-lightbox__nav--next"
              aria-label="Próxima foto"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              ›
            </button>
          ) : null}

          <figure className="gcv-photo-lightbox__figure" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxItem.src}
              alt={lightboxItem.alt}
              className="gcv-photo-lightbox__img"
              decoding="async"
            />
            {lightboxItem.caption ? (
              <figcaption className="gcv-photo-lightbox__caption">{lightboxItem.caption}</figcaption>
            ) : null}
          </figure>

          <p className="gcv-photo-lightbox__counter">
            {lightboxIndex + 1} / {prepared.length}
          </p>
        </div>
      </div>
    ) : null;

  return (
    <section className="gcv-attract-gallery" aria-labelledby="gcv-attract-gallery-title">
      <h2 id="gcv-attract-gallery-title" className="gcv-attract-gallery__title">
        Galeria de fotos
      </h2>

      <div className="gcv-attract-gallery__grid">
        {prepared.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            type="button"
            className="gcv-attract-gallery__tile"
            aria-label={
              item.caption
                ? `Ampliar: ${item.caption}`
                : `Ampliar foto ${index + 1} de ${prepared.length}`
            }
            onClick={() => setLightboxIndex(index)}
          >
            <span className="gcv-attract-gallery__thumb">
              <img
                src={item.src}
                alt={item.alt}
                className="gcv-attract-gallery__img"
                loading="lazy"
                decoding="async"
              />
              {item.caption ? (
                <span className="gcv-attract-gallery__overlay" aria-hidden="true">
                  <span className="gcv-attract-gallery__overlay-text">{item.caption}</span>
                </span>
              ) : (
                <span className="gcv-attract-gallery__overlay gcv-attract-gallery__overlay--hint" aria-hidden="true">
                  <span className="gcv-attract-gallery__overlay-hint">Ver em tela cheia</span>
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {typeof document !== "undefined" && lightbox ? createPortal(lightbox, document.body) : null}
    </section>
  );
}
