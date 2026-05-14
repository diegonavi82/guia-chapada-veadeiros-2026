import { Helmet } from "react-helmet-async";
import type { BreadcrumbItem, SeoMetadata } from "@guia/shared";

type SeoProps = SeoMetadata & {
  type?: "website" | "article";
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown>;
  /** Quando diferente da tag <title>; preenche og:title / twitter:title. */
  ogTitle?: string;
  /** Sobrescreve og:description e twitter:description quando preenchido. */
  ogDescription?: string;
};

const siteName = "Guia Chapada dos Veadeiros";

export function Seo({
  title,
  description,
  canonical,
  ogImage,
  robots = "index,follow",
  keywords,
  type = "website",
  breadcrumbs,
  jsonLd,
  ogTitle,
  ogDescription,
}: SeoProps) {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const socialTitle =
    ogTitle && ogTitle.trim().length > 0
      ? ogTitle.includes(siteName)
        ? ogTitle
        : `${ogTitle} | ${siteName}`
      : fullTitle;
  const trimmedOg = ogDescription?.trim();
  const ogDesc = trimmedOg ? trimmedOg : description;
  const breadcrumbSchema = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
    : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robots} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={socialTitle} />
      <meta property="og:description" content={ogDesc} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={socialTitle} />
      <meta name="twitter:description" content={ogDesc} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {breadcrumbSchema ? (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      ) : null}
      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
}
