import { createContext, useContext } from "react";
import type { SiteLocale } from "./types";

export const SiteLocaleContext = createContext<SiteLocale>("pt");

export function useSiteLocale(): SiteLocale {
  return useContext(SiteLocaleContext);
}
