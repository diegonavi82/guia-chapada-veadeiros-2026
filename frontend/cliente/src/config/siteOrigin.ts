export const SITE_ORIGIN =
  (typeof import.meta.env.VITE_SITE_ORIGIN === "string" && import.meta.env.VITE_SITE_ORIGIN.replace(/\/$/, "")) ||
  "https://www.guiachapadaveadeiros.com";
