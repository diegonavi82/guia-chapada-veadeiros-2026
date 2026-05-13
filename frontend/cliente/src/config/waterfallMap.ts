import {
  WATERFALL_MAP_HOTSPOTS,
  pageSlugHasWaterfallMap as pageSlugHasWaterfallMapShared,
  type MapBox,
} from "@guia/shared";
import { wpUploadsAssets as Wp } from "./wpUploadsAssets";

export const WATERFALL_MAP_IMAGE_URL = Wp.mapaCachoeiras2022;

export type WaterfallMapHotspot = {
  label: string;
  href: string;
  box: MapBox;
};

/**
 * Hotspots espelhando https://www.guiachapadaveadeiros.com/ (`#image-map`).
 */
export const waterfallMapHotspots: WaterfallMapHotspot[] = WATERFALL_MAP_HOTSPOTS.map((h) => ({
  label: h.label,
  href: `/${h.slug}`,
  box: h.box,
}));

/** Páginas que têm `<area>` no mapa oficial — exibir mapa no rodapé do guia. */
export function pageSlugHasWaterfallMap(slug: string): boolean {
  return pageSlugHasWaterfallMapShared(slug);
}
