import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonPt from "./locales/pt/common.json";
import commonEn from "./locales/en/common.json";
import commonEs from "./locales/es/common.json";

void i18n.use(initReactI18next).init({
  resources: {
    pt: { common: commonPt },
    en: { common: commonEn },
    es: { common: commonEs },
  },
  lng: "pt",
  fallbackLng: "pt",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
