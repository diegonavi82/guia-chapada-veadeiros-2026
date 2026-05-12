import { Helmet } from "react-helmet-async";
import type { BreadcrumbItem, SeoMetadata } from "@guia/shared";

type SeoProps = SeoMetadata & {
  type?: "website" | "article";
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown>;
};

const siteName = "Guia Chapada dos Veadeiros";

export function Seo({
  title,
  description,
  canonical,
  ogImage,
  robots = "index,follow",
  type = "website",
  breadcrumbs,
  jsonLd,
}: SeoProps) {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
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
      <meta name="robots" content={robots} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {breadcrumbSchema ? (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      ) : null}
      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
}
