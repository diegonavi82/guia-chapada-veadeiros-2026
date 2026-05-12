import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { mediaPublicBase } from "../config/mediaPublic";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";

const mapImageUrl = `${mediaPublicBase}/mapa.jpg`;
const whatsappUrl =
  "https://api.whatsapp.com/send?phone=5562982506891&text=*Quero%20montar%20um%20roteiro%20na%20Chapada*";

type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  timestamp: string;
};

type InstagramMediaPayload = {
  items: InstagramMediaItem[];
};

const featuredAttractions = [
  {
    label: "Alto Paraiso",
    title: "Almecegas e Poco Sao Bento",
    meta: "Trilha facil · 8 km",
    href: "/cachoeira-almecegas-poco-sao-bento-guia-chapada-veadeiros",
    image: `${mediaPublicBase}/almecegas.jpg`,
  },
  {
    label: "Sao Jorge",
    title: "Vale da Lua",
    meta: "Trilha facil · 32 km",
    href: "/vale-lua-guia-chapada-veadeiros-sao-jorge",
    image: `${mediaPublicBase}/vale-lua.jpg`,
  },
  {
    label: "Aventura",
    title: "Cataratas dos Couros",
    meta: "Trilha dificil · guia recomendado",
    href: "/cataratas-dos-couros-guia-chapada-veadeiros-alto-paraiso",
    image: `${mediaPublicBase}/couros.jpg`,
  },
  {
    label: "Cavalcante",
    title: "Cachoeira Santa Barbara",
    meta: "Trilha mediana · 130 km",
    href: "/cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante",
    image: `${mediaPublicBase}/santa-barbara.jpg`,
  },
  {
    label: "Sao Jorge",
    title: "Cachoeira do Segredo",
    meta: "Trilha mediana · 56 km",
    href: "/cachoeira-segredo-guia-chapada-veadeiros-sao-jorge",
    image: `${mediaPublicBase}/segredo.jpg`,
  },
  {
    label: "Alto Paraiso",
    title: "Cachoeira dos Cristais",
    meta: "Acesso facil · familia",
    href: "/cachoeira-cristais-guia-chapada-veadeiros-alto-paraiso",
    image: `${mediaPublicBase}/cristais.jpg`,
  },
  {
    label: "Teresina de Goias",
    title: "Poco Encantado",
    meta: "Trilha facil · 53 km",
    href: "/cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-de-goias",
    image: `${mediaPublicBase}/poco-encantado.jpg`,
  },
  {
    label: "Sao Joao",
    title: "Macaquinhos",
    meta: "Trilha dificil · 44 km",
    href: "/cachoeira-macaquinhos-guia-chapada-veadeiros-sao-joao-alianca",
    image: `${mediaPublicBase}/macaquinhos.jpg`,
  },
];

const latestPosts = [
  {
    title: "Parque Nacional: trilhas clássicas e planejamento de dia inteiro",
    excerpt: "Ingressos, sal e cânions emblemáticos com respeito às normas da unidade.",
    href: "/gcv-artigo-demonstrativo-pjeszcvu",
  },
  {
    title: "Alto Paraíso de Goiás como base ecoturística",
    excerpt: "Hospedagem, restaurantes e acesso às atrações ao redor do núcleo urbano.",
    href: "/gcv-artigo-demonstrativo-akzqugs7",
  },
  {
    title: "São Jorge: ritmo de vila na sombra da Serra dos Cristais",
    excerpt: "Logística entre trilhas, artesanato local e passeios combinados ao Vale da Lua.",
    href: "/gcv-artigo-demonstrativo-dc9esyjo",
  },
  {
    title: "Por que Contratar um Guia Local na Chapada dos Veadeiros?”'",
    excerpt: "Veja mais no blog.",
    href: "/contratar-guia-local-chapada-veadeiros",
  },
];

const reviews = [
  {
    name: "Cintia Mariele",
    city: "Avaliação Google · 5 estrelas",
    tour: "Dicas de passeio na Chapada",
    image: `${mediaPublicBase}/vale-lua.jpg`,
    quote:
      "Diego é um guia incrível! Sempre com as melhores dicas de passeio, muito conhecimento local e super solícito com os grupos. Recomendo demais!",
  },
  {
    name: "Mayla Santos",
    city: "Avaliação Google · 5 estrelas",
    tour: "Pontualidade e trilhas",
    image: `${mediaPublicBase}/parque-nacional.jpg`,
    quote:
      "O Diego é um guia muito atencioso, solícito, com uma energia incrível! É extremamente pontual — não teve um dia sequer que chegou além do horário combinado —, dirige super bem, conhece a região e os caminhos das cachoeiras, o que facilitou muito cada dia.",
  },
  {
    name: "Paula Altenfelder",
    city: "Avaliação Google · 5 estrelas",
    tour: "Transporte + passeio",
    image: `${mediaPublicBase}/couros.jpg`,
    quote:
      "O Diego é um excelente guia, espirituoso, solícito, parceiro, extremamente pontual (sempre estava no horário combinado para o passeio), bem humorado, responsável, ótimo motorista. Um dos poucos guias da Chapada que fazem o pacote completo de transporte e passeio. Nota 10! Recomendo de olhos fechados.",
  },
  {
    name: "Tatiana Lopes",
    city: "Avaliação Google · 5 estrelas",
    tour: "Roteiro com guia",
    image: `${mediaPublicBase}/cristais.jpg`,
    quote:
      "O Guia Diego da agência foi excelente guia! Super simpático, solícito e demonstrou ser mil conhecedor da região. Nos ajudou com o roteiro, boas dicas e sugeriu vários passeios! Super indico!",
  },
  {
    name: "Frederico Augusto Lobo",
    city: "Avaliação Google · 5 estrelas",
    tour: "Preço justo e trilhas",
    image: `${mediaPublicBase}/santa-barbara.jpg`,
    quote:
      "Muito bom serviço, preço justo, recomendo. O guia Diego foi muito bom, passa total segurança nas trilhas e tem todo o conhecimento dos lugares.",
  },
  {
    name: "Priscila Navi",
    city: "Avaliação Google · 5 estrelas",
    tour: "Roteiro sob medida",
    image: `${mediaPublicBase}/segredo.jpg`,
    quote:
      "Guia Diego da agência muito simpático e conhecedor da região. Nos ajudou com o nosso roteiro e sugeriu passeios de acordo com as nossas necessidades. Nota dez!",
  },
  {
    name: "Gabriel Landa Noronha",
    city: "Avaliação Google · 5 estrelas",
    tour: "Guia local",
    image: `${mediaPublicBase}/almecegas.jpg`,
    quote:
      "Se vc vai à Chapada, tem que conhecer o Diogo. Guia super honesto, bacana, bem humorado e conhecedor nato da chapada.",
  },
  {
    name: "Francis Lima",
    city: "Avaliação Google · 5 estrelas",
    tour: "Viagem com guia",
    image: `${mediaPublicBase}/poco-encantado.jpg`,
    quote: "Com certeza o guia Diego fez toda diferença na viagem! Indico mto!",
  },
  {
    name: "Alan Braz",
    city: "Avaliação Google · 5 estrelas",
    tour: "Recomendação",
    image: `${mediaPublicBase}/macaquinhos.jpg`,
    quote:
      "Eu não usei o serviço, mas indico sempre pra quem tem pouco aptidão física para caminhada e subir em obstáculos, pois aqui é necessário.",
  },
  {
    name: "RudolphCarla",
    city: "Avaliação Google · 5 estrelas",
    tour: "Organização dos passeios",
    image: `${mediaPublicBase}/vale-lua.jpg`,
    quote: "Ótimo para ajudar o turista a se organizar nos passeios.",
  },
  {
    name: "Kaique Rodrigues Vieira",
    city: "Avaliação Google · 5 estrelas",
    tour: "Energia e equipe",
    image: `${mediaPublicBase}/parque-nacional.jpg`,
    quote: "Lugar muito legal, com pessoas incríveis de energia muito da hora.",
  },
  {
    name: "Daniel Klein",
    city: "Avaliação Google · 5 estrelas",
    tour: "Indicação",
    image: `${mediaPublicBase}/couros.jpg`,
    quote: "Excelente! Recomendo demais, só vão!",
  },
  {
    name: "Felipe Spingola",
    city: "Avaliação Google · 5 estrelas",
    tour: "Agência na Chapada",
    image: `${mediaPublicBase}/cristais.jpg`,
    quote: "Melhor agência da Chapada. Recomendo!!!!",
  },
  {
    name: "Humberto Sousa",
    city: "Avaliação Google · 5 estrelas",
    tour: "Dicas e roteiros",
    image: `${mediaPublicBase}/santa-barbara.jpg`,
    quote: "Excelente opção para descobrir as dicas da Chapada.",
  },
];

const reviewsPerPage = 3;

type MapViewport = "mobile" | "notebook" | "desktop";

type MapBox = {
  l: number;
  t: number;
  w: number;
  h: number;
};

type MapHotspot = {
  label: string;
  href: string;
  notebook: MapBox;
  desktop: MapBox;
};

const mapHotspots: MapHotspot[] = [
  {
    label: "Parque Nacional da Chapada dos Veadeiros",
    href: "/parque-nacional-chapada-veadeiros-saltos-rio-preto-sao-jorge",
    notebook: { l: 43, t: 42, w: 18, h: 12 },
    desktop: { l: 43, t: 42, w: 18, h: 12 },
  },
  {
    label: "Complexo de Cachoeiras do Rio da Prata",
    href: "/cachoeira-complexo-rio-prata-guia-chapada-veadeiros-cavalcante",
    notebook: { l: 26, t: 6, w: 9, h: 5 },
    desktop: { l: 26, t: 6, w: 9, h: 5 },
  },
  {
    label: "Mirante da Janela e Cachoeira do Abismo",
    href: "/mirante-janela-cachoeira-abismo-guia-chapada-veadeiros-sao-jorge",
    notebook: { l: 20, t: 58, w: 10, h: 5 },
    desktop: { l: 20, t: 58, w: 10, h: 5 },
  },
  {
    label: "Parque Nacional da Chapada dos Veadeiros - Saltos do Rio Preto",
    href: "/parque-nacional-chapada-veadeiros-saltos-rio-preto-sao-jorge",
    notebook: { l: 26, t: 45, w: 10, h: 6 },
    desktop: { l: 26, t: 45, w: 10, h: 6 },
  },
  {
    label: "Parque Nacional da Chapada dos Veadeiros - Cânions e Cariocas",
    href: "/parque-nacional-chapada-veadeiros-canions-carioquinhas-sao-jorge",
    notebook: { l: 37, t: 50, w: 11, h: 6 },
    desktop: { l: 37, t: 50, w: 11, h: 6 },
  },
  {
    label: "Vale da Lua",
    href: "/vale-lua-guia-chapada-veadeiros-sao-jorge",
    notebook: { l: 36, t: 63, w: 8, h: 5 },
    desktop: { l: 36, t: 63, w: 8, h: 5 },
  },
  {
    label: "Cataratas dos Couros",
    href: "/cataratas-dos-couros-guia-chapada-veadeiros-alto-paraiso",
    notebook: { l: 35, t: 72, w: 10, h: 5 },
    desktop: { l: 35, t: 72, w: 10, h: 5 },
  },
  {
    label: "Cachoeira do Segredo",
    href: "/cachoeira-segredo-guia-chapada-veadeiros-sao-jorge",
    notebook: { l: 28, t: 86, w: 8, h: 5 },
    desktop: { l: 28, t: 86, w: 8, h: 5 },
  },
  {
    label: "Cachoeira Santa Bárbara",
    href: "/cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante",
    notebook: { l: 51, t: 10, w: 8, h: 5 },
    desktop: { l: 51, t: 10, w: 8, h: 5 },
  },
  {
    label: "Cachoeira das Loquinhas",
    href: "/cachoeira-loquinhas-guia-chapada-veadeiros-alto-paraiso",
    notebook: { l: 62, t: 51, w: 8, h: 5 },
    desktop: { l: 62, t: 51, w: 8, h: 5 },
  },
  {
    label: "Cachoeira Poço Encantado",
    href: "/cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-de-goias",
    notebook: { l: 72, t: 39, w: 10, h: 5 },
    desktop: { l: 72, t: 39, w: 10, h: 5 },
  },
  {
    label: "Cachoeiras Almécegas e Poço São Bento",
    href: "/cachoeira-almecegas-poco-sao-bento-guia-chapada-veadeiros",
    notebook: { l: 49, t: 62, w: 11, h: 5 },
    desktop: { l: 49, t: 62, w: 11, h: 5 },
  },
  {
    label: "Cachoeira Anjos e Arcanjos",
    href: "/cachoeira-anjos-arcanjos-guia-chapada-veadeiros-alto-paraiso",
    notebook: { l: 77, t: 46, w: 10, h: 5 },
    desktop: { l: 77, t: 46, w: 10, h: 5 },
  },
  {
    label: "Cachoeira dos Cristais",
    href: "/cachoeira-cristais-guia-chapada-veadeiros-alto-paraiso",
    notebook: { l: 60, t: 46, w: 8, h: 5 },
    desktop: { l: 60, t: 46, w: 8, h: 5 },
  },
  {
    label: "Cachoeira Cordovil e Poço Esmeralda",
    href: "/cachoeira-cordovil-poco-esmeralda-guia-chapada-veadeiros",
    notebook: { l: 42, t: 59, w: 8, h: 5 },
    desktop: { l: 42, t: 59, w: 8, h: 5 },
  },
  {
    label: "Cachoeiras dos Macaquinhos",
    href: "/cachoeira-macaquinhos-guia-chapada-veadeiros-sao-joao-alianca",
    notebook: { l: 86, t: 66, w: 10, h: 5 },
    desktop: { l: 86, t: 66, w: 10, h: 5 },
  },
  {
    label: "Cachoeira do Macaco",
    href: "/cachoeira-macacao-guia-chapada-veadeiros-sao-joao-alianca",
    notebook: { l: 78, t: 57, w: 8, h: 5 },
    desktop: { l: 78, t: 57, w: 8, h: 5 },
  },
  {
    label: "Cachoeira do Label",
    href: "/cachoeira-label-guia-chapada-veadeiros-sao-joao-alianca",
    notebook: { l: 80, t: 76, w: 7, h: 5 },
    desktop: { l: 80, t: 76, w: 7, h: 5 },
  },
];

function shuffleReviews() {
  return [...reviews].sort(() => Math.random() - 0.5);
}

function getMapViewport(): MapViewport {
  if (typeof window === "undefined") {
    return "desktop";
  }

  if (window.matchMedia("(max-width: 767px)").matches) {
    return "mobile";
  }

  if (window.matchMedia("(min-width: 1280px)").matches) {
    return "desktop";
  }

  return "notebook";
}

export function Home() {
  const [reviewPage, setReviewPage] = useState(0);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapViewport, setMapViewport] = useState<MapViewport>(() => getMapViewport());
  const [instagramPhotos, setInstagramPhotos] = useState<InstagramMediaItem[]>([]);
  const [isInstagramLoading, setIsInstagramLoading] = useState(true);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  const shuffledReviews = useMemo(() => shuffleReviews(), []);
  const totalReviewPages = Math.ceil(shuffledReviews.length / reviewsPerPage);
  const visibleMapHotspots = mapViewport === "mobile" ? [] : mapHotspots;
  const visibleReviews = Array.from({ length: reviewsPerPage }, (_, index) => {
    const reviewIndex = (reviewPage * reviewsPerPage + index) % shuffledReviews.length;

    return shuffledReviews[reviewIndex];
  });

  useEffect(() => {
    let isMounted = true;

    apiGet<InstagramMediaPayload>("/instagram/media")
      .then((payload) => {
        if (!isMounted) {
          return;
        }

        setInstagramPhotos(payload.items.slice(0, 12));
        setInstagramError(null);
      })
      .catch(() => {
        if (isMounted) {
          setInstagramError("Não foi possível carregar as fotos do Instagram agora.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInstagramLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setReviewPage((currentPage) => (currentPage + 1) % totalReviewPages);
    }, 7500);

    return () => window.clearInterval(intervalId);
  }, [totalReviewPages]);

  useEffect(() => {
    function handleResize() {
      setMapViewport(getMapViewport());
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMapOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMapOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMapOpen]);

  function goToPreviousReviewPage() {
    setReviewPage((currentPage) => (currentPage - 1 + totalReviewPages) % totalReviewPages);
  }

  function goToNextReviewPage() {
    setReviewPage((currentPage) => (currentPage + 1) % totalReviewPages);
  }

  return (
    <>
      <Seo
        title="Guia Chapada Veadeiros"
        description="Cachoeiras, passeios, eventos, gastronomia, hospedagem, terapias holísticas, arte e muito mais. Um guia completo na Chapada dos Veadeiros."
        canonical="/"
        ogImage={mapImageUrl}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "/",
              url: "/",
              name: "Guia Chapada Veadeiros",
              description:
                "Cachoeiras, passeios, eventos, gastronomia, hospedagem, terapias holísticas, arte e muito mais. Um guia completo na Chapada dos Veadeiros.",
            },
            {
              "@type": "WebSite",
              "@id": "/#website",
              url: "/",
              name: "Guia Chapada Veadeiros",
              description:
                "Cachoeiras, atrativos naturais, eventos, trilhas, hospedagem, gastronomia, lojas e muito mais sobre a Chapada dos Veadeiros.",
              potentialAction: {
                "@type": "SearchAction",
                target: "/busca?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />
      <section className="official-home-shell px-4 pb-16 pt-9">
        <div className="mx-auto max-w-[1180px]">
          <div
            className="relative overflow-hidden rounded-[1.8rem] px-10 py-20 text-white shadow-2xl md:px-12 md:py-28"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(9, 43, 52, 0.92), rgba(7, 91, 79, 0.58)), url(${mediaPublicBase}/parque-nacional.jpg)`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <button className="absolute left-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-white/10 text-white">
              ‹
            </button>
            <button className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-white/10 text-white">
              ›
            </button>
            <span className="inline-flex rounded-full bg-[#e58b55] px-4 py-2 text-xs font-black uppercase tracking-wide shadow-lg">
              Chapada dos Veadeiros
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.96] tracking-tight md:text-6xl">
              Passeios com guias especializados locais
            </h1>
            <p className="mt-5 text-lg text-white/90">
              Faça seu roteiro ou entre na próxima excursão
            </p>
            <a
              className="mt-6 inline-flex rounded-full bg-[#e58b55] px-6 py-3 text-sm font-black text-white shadow-xl shadow-orange-900/30 transition hover:bg-[#d97941]"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              Montar meu roteiro
            </a>
          </div>

          <section className="mt-12 rounded-[1.75rem] bg-white p-5 shadow-xl shadow-slate-200/80 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                  Atrações imperdíveis
                </span>
                <h2 className="mt-3 text-2xl font-medium tracking-tight text-slate-900 md:text-4xl">
                  Cachoeiras e trilhas mais buscadas
                </h2>
              </div>
              <Link className="text-sm font-black text-cerrado-700" to="/cachoeiras-chapada-dos-veadeiros">
                Ver Todas
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {featuredAttractions.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group relative h-72 overflow-hidden rounded-2xl bg-slate-900 shadow-md"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase text-slate-900">
                    {item.label}
                  </span>
                  <h3 className="absolute bottom-4 left-4 right-4 text-lg font-black leading-tight text-white">
                    {item.title}
                  </h3>
                  <p className="absolute bottom-1 left-4 right-4 text-xs font-semibold text-white/80">{item.meta}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-[1.75rem] bg-white p-5 shadow-xl shadow-slate-200/80 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                  Blog da Chapada dos Veadeiros
                </span>
                <h2 className="mt-3 text-2xl font-medium tracking-tight text-slate-900 md:text-4xl">
                  Últimas Notícias da Chapada dos Veadeiros
                </h2>
              </div>
              <Link className="text-sm font-black text-cerrado-700" to="/blog">
                Ver Todos
              </Link>
            </div>
            <div className="mt-6 divide-y divide-slate-200">
              {latestPosts.map((post) => (
                <Link key={post.href} to={post.href} className="block py-4">
                  <h3 className="font-black text-slate-900">{post.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-8 rounded-[1.75rem] bg-[#172f59] p-6 text-white shadow-xl shadow-slate-200/80 md:grid-cols-[0.85fr_1.15fr] md:p-8">
            <div>
              <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                Mapa interativo
              </span>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight md:text-5xl">
                Explore a Chapada dos Veadeiros pelo mapa interativo
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/85">
                Compare trilhas, nível de dificuldade, distâncias, regiões e combine os melhores roteiros para planejar sua experiência antes da reserva.
              </p>
            </div>
            <button
              aria-label="Abrir mapa interativo da Chapada dos Veadeiros"
              className="gcv-map-trigger min-h-56 w-full"
              type="button"
              onClick={() => setIsMapOpen(true)}
            >
              <img
                src={mapImageUrl}
                alt="Mapa de cachoeiras da Chapada dos Veadeiros"
                className="h-full min-h-56 rounded-2xl object-cover"
                loading="lazy"
              />
            </button>
          </section>

          {isMapOpen
            ? createPortal(
                <div
                  aria-label="Mapa ampliado da Chapada dos Veadeiros"
                  aria-modal="true"
                  className="gcv-map-lightbox"
                  role="dialog"
                >
                  <button
                    aria-label="Fechar mapa"
                    className="gcv-map-lightbox__backdrop"
                    type="button"
                    onClick={() => setIsMapOpen(false)}
                  />
                  <div className="gcv-map-lightbox__inner">
                    <figure className="gcv-map-lightbox__figure">
                      <img src={mapImageUrl} alt="Mapa de cachoeiras da Chapada dos Veadeiros" />
                      {visibleMapHotspots.length > 0 ? (
                        <div className="gcv-map-lightbox__hotspots">
                          {visibleMapHotspots.map((spot) => {
                            const box = spot[mapViewport === "desktop" ? "desktop" : "notebook"];

                            return (
                              <Link
                                key={`${spot.label}-${mapViewport}`}
                                aria-label={spot.label}
                                className="gcv-map-lightbox__hotspot"
                                style={{
                                  height: `${box.h}%`,
                                  left: `${box.l}%`,
                                  top: `${box.t}%`,
                                  width: `${box.w}%`,
                                }}
                                title={spot.label}
                                to={spot.href}
                                onClick={() => setIsMapOpen(false)}
                              />
                            );
                          })}
                        </div>
                      ) : null}
                    </figure>
                    <p className="gcv-map-lightbox__mode">
                      {mapViewport === "mobile"
                        ? "Mapa ampliado. Links desativados no celular."
                        : `Mapa em modo ${mapViewport === "desktop" ? "desktop" : "notebook"}. Clique no nome da cachoeira.`}
                    </p>
                  </div>
                  <button
                    aria-label="Fechar mapa"
                    className="gcv-map-lightbox__close"
                    type="button"
                    onClick={() => setIsMapOpen(false)}
                  >
                    ×
                  </button>
                </div>,
                document.body,
              )
            : null}

          <section className="mt-10 rounded-[1.75rem] bg-white p-5 shadow-xl shadow-slate-200/80 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                  Instagram
                </span>
              </div>
              <a
                className="text-sm font-black text-[#c4744a]"
                href="https://www.instagram.com/guiachapadaveadeiros/"
                rel="noreferrer"
                target="_blank"
              >
                @guiachapadaveadeiros
              </a>
            </div>
            {isInstagramLoading ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 12 }, (_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-2xl bg-gradient-to-br from-[#fff8f4] to-[#f1ded3]"
                  />
                ))}
              </div>
            ) : instagramPhotos.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {instagramPhotos.map((photo, index) => (
                  <a
                    key={photo.id}
                    className="group relative block aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm"
                    href={photo.permalink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <img
                      alt={photo.caption ?? `Foto recente ${index + 1} do Instagram do Guia Chapada Veadeiros`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                      src={photo.media_url}
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid min-h-28 place-items-center rounded-2xl border border-[#f1ded3] bg-gradient-to-r from-white via-[#fff8f4] to-white px-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {instagramError ?? "As fotos do Instagram ainda não estão disponíveis."}
                  </p>
                  <a
                    className="mt-4 inline-flex rounded-full bg-[#df8350] px-6 py-3 text-sm font-black text-white shadow-xl shadow-orange-200"
                    href="https://www.instagram.com/guiachapadaveadeiros/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Ver publicações no Instagram
                  </a>
                </div>
              </div>
            )}
          </section>

          <section className="mt-12 text-center">
            <span className="inline-flex rounded-full bg-[#168f7a] px-4 py-2 text-[11px] font-black uppercase tracking-wide text-white">
              Ecoturismo
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-slate-800">
              <span className="text-[#e5a12d]">★</span> Avaliações dos viajantes
            </h2>
            <p className="mt-2 text-sm text-slate-600">Experiências reais de quem viveu a Chapada dos Veadeiros.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                aria-label="Avaliações anteriores"
                className="grid h-11 w-11 place-items-center rounded-full border-2 border-emerald-600/30 bg-white text-xl font-black text-emerald-700 shadow-sm transition hover:border-[#df8350] hover:text-[#df8350]"
                type="button"
                onClick={goToPreviousReviewPage}
              >
                ‹
              </button>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
                {reviewPage + 1} / {totalReviewPages} · 3 avaliações por vez
              </span>
              <button
                aria-label="Próximas avaliações"
                className="grid h-11 w-11 place-items-center rounded-full border-2 border-emerald-600/30 bg-white text-xl font-black text-emerald-700 shadow-sm transition hover:border-[#df8350] hover:text-[#df8350]"
                type="button"
                onClick={goToNextReviewPage}
              >
                ›
              </button>
            </div>
            <div className="mt-8 grid auto-rows-[440px] gap-5 md:grid-cols-3">
              {visibleReviews.map((review) => (
                <article key={review.name} className="flex h-[440px] flex-col rounded-2xl bg-white p-8 text-left shadow-lg shadow-slate-200/80">
                  <div className="flex min-h-[112px] items-center gap-4">
                    <img src={review.image} alt={review.name} className="h-20 w-20 rounded-full object-cover shadow-xl shadow-emerald-100" loading="lazy" />
                    <div>
                      <p className="text-sm text-[#caa24b]">★★★★★</p>
                      <h3 className="mt-1 text-lg font-medium text-slate-800">{review.name}</h3>
                      <p className="text-xs font-bold text-slate-600">{review.city}</p>
                      <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-cerrado-700">
                        {review.tour}
                      </span>
                    </div>
                  </div>
                  <blockquote className="mt-8 flex-1 overflow-y-auto border-l-4 border-emerald-500 bg-slate-50 p-5 text-sm italic leading-7 text-slate-700">
                    “{review.quote}”
                  </blockquote>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
