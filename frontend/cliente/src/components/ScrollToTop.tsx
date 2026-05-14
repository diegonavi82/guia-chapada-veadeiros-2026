import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Em SPA, o browser não recarrega a página — sem isto, ao abrir um artigo a rolagem
 * fica na mesma posição da página anterior.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
