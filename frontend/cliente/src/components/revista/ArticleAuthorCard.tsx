import type { ReactNode } from "react";
import { wpUploadsAssets } from "../../config/wpUploadsAssets";

const DEFAULT_ALT =
  "Diego Navi, condutor de ecoturismo credenciado Cadastur na Chapada dos Veadeiros, com lenço verde, óculos espelhados azuis e mochila de trilha";

type ArticleAuthorCardProps = {
  children: ReactNode;
  fotoSrc?: string;
  fotoAlt?: string;
};

export function ArticleAuthorCard({
  children,
  fotoSrc = wpUploadsAssets.articleAuthorDiegoPortrait,
  fotoAlt = DEFAULT_ALT,
}: ArticleAuthorCardProps) {
  return (
    <div className="gcv-post-autor">
      <div className="gcv-post-autor-avatar">
        <img src={fotoSrc} alt={fotoAlt} width={276} height={368} decoding="async" loading="lazy" />
      </div>
      <div className="gcv-post-autor-info">{children}</div>
    </div>
  );
}
