import { LangLink } from "../../i18n/LangLink";
import { revistaListOverridesBySlug } from "../../config/wpUploadsAssets";
import { useSiteLocale } from "../../i18n/siteLocale";
import type { RevistaTeaserPost } from "./types";
import { formatPublicationDatePt } from "../../utils/formatPublicationDatePt";
import { toPublicAssetUrl } from "../../utils/localMediaUrl";

type Variant = "capa" | "destaque" | "lista" | "compacto";

export function RevistaTeaserCard({
  post,
  variant,
}: {
  post: RevistaTeaserPost;
  variant: Variant;
}) {
  const locale = useSiteLocale();
  const ov = revistaListOverridesBySlug[post.slug];
  const cat = post.categories?.[0]?.name;
  const dek = post.excerpt || post.seoDescription || "";
  const title = locale === "pt" && ov?.title ? ov.title : post.title;
  const fromApi = post.featuredImage ? (toPublicAssetUrl(post.featuredImage) ?? post.featuredImage) : null;
  const fromOverride = ov?.featuredImage ? (toPublicAssetUrl(ov.featuredImage) ?? ov.featuredImage) : null;
  const img = fromApi ?? fromOverride;
  const dateLabel = formatPublicationDatePt(post.publishedAt);

  if (variant === "capa") {
    return (
      <LangLink to={`/revista/${post.slug}`} className="group Revista-teaser Revista-teaser--capa">
        <div className="Revista-teaser__media Revista-teaser__media--wide">
          {img ? (
                <img src={img} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400 text-slate-600">
              Chapada dos Veadeiros
            </div>
          )}
        </div>
        <div className="Revista-teaser__body Revista-teaser__body--capa">
          {cat ? <span className="Revista-chip Revista-chip--live">{cat}</span> : <span className="Revista-chip Revista-chip--live">Revista</span>}
          <h3 className="Revista-teaser__title-lg">{title}</h3>
          {dek ? <p className="Revista-teaser__dek">{dek}</p> : null}
          {dateLabel ? <p className="Revista-teaser__meta">{dateLabel}</p> : null}
        </div>
      </LangLink>
    );
  }

  const titleCls =
    variant === "destaque"
      ? "Revista-teaser__title-md"
      : variant === "compacto"
        ? "Revista-teaser__title-sm"
        : "Revista-teaser__title-sm";

  return (
    <LangLink to={`/revista/${post.slug}`} className={`group Revista-teaser Revista-teaser--${variant}`}>
      {img ? (
        <div className="Revista-teaser__media">
          <img src={img} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
        </div>
      ) : (
        <div className="Revista-teaser__media Revista-teaser__media--empty" />
      )}
      <div className="Revista-teaser__body">
        {cat ? <span className="Revista-chip">{cat}</span> : <span className="Revista-chip">Matéria</span>}
        <h3 className={titleCls}>{title}</h3>
        {variant !== "compacto" && dek ? <p className="Revista-teaser__dek Revista-teaser__dek--short">{dek}</p> : null}
        {dateLabel ? <p className="Revista-teaser__meta">{dateLabel}</p> : null}
      </div>
    </LangLink>
  );
}
