export {
  WATERFALL_MAP_HOTSPOTS,
  WATERFALL_MAP_PAGE_SLUGS,
  pageSlugHasWaterfallMap,
  type MapBox,
  type WaterfallMapHotspotDef,
} from "./waterfallMap";

export type SeoMetadata = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  robots?: string;
};

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type PublicPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
};

export type PublicProduct = {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  featuredImage?: string | null;
  price?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function absoluteUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}
