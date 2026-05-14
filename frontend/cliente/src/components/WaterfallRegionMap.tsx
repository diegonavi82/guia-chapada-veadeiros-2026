import { Link } from "react-router-dom";
import { WATERFALL_MAP_IMAGE_URL, waterfallMapHotspots } from "../config/waterfallMap";

type Props = {
  /** Caminho com barra inicial, ex.: `/cataratas-dos-couros-...` — marca o atrativo atual. */
  activePath?: string;
  /** Apenas figura + hotspots; para embutir em outro cartão que já tem título próprio. */
  embedded?: boolean;
};

export function WaterfallRegionMap({ activePath = "", embedded = false }: Props) {
  const figure = (
    <figure className="gcv-detail-region-map__figure">
      <img
        src={WATERFALL_MAP_IMAGE_URL}
        alt="Mapa ilustrado da Chapada dos Veadeiros com cachoeiras e núcleos urbanos."
        loading="lazy"
        decoding="async"
      />
      <div className="gcv-detail-region-map__hotspots">
        {waterfallMapHotspots.map((spot) => {
          const isCurrent = activePath === spot.href;

          return (
            <Link
              key={spot.href}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={spot.label}
              className={
                isCurrent
                  ? "gcv-detail-region-map__hotspot gcv-detail-region-map__hotspot--current"
                  : "gcv-detail-region-map__hotspot"
              }
              style={{
                height: `${spot.box.h}%`,
                left: `${spot.box.l}%`,
                top: `${spot.box.t}%`,
                width: `${spot.box.w}%`,
              }}
              title={spot.label}
              to={spot.href}
            />
          );
        })}
      </div>
    </figure>
  );

  if (embedded) {
    return figure;
  }

  return (
    <section
      className="gcv-detail-region-map"
      aria-labelledby="gcv-detail-region-map-title"
    >
      <h2 id="gcv-detail-region-map-title" className="gcv-detail-region-map__title">
        Mapa interativo
      </h2>
      <p className="gcv-detail-region-map__lead">
        Localização dos principais atrativos na região. Clique em outro ponto do mapa para abrir o
        guia correspondente.
      </p>
      {figure}
    </section>
  );
}
