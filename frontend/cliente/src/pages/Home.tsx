import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { wpUploadsAssets as Wp } from "../config/wpUploadsAssets";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";

const mapImageUrl = Wp.mapaCachoeiras2020;
const whatsappUrl =
  "https://api.whatsapp.com/send?phone=5562982506891&text=*Quero%20montar%20um%20roteiro%20na%20Chapada*";

type HeroCta =
  | { kind: "whatsapp"; label: string }
  | { kind: "router"; to: string; label: string };

type HeroSlideCopy = {
  badge: string;
  title: string;
  lead: string;
  sub: string;
  cta: HeroCta;
};

type HeroSlide = HeroSlideCopy & { image: string };

/** Apenas dois slides principais: guias locais · em breve plataforma. */
const HERO_SLIDES: HeroSlide[] = [
  {
    image: Wp.valeLua,
    badge: "Chapada dos Veadeiros",
    title: "Passeios com guias locais",
    lead:
      "Contamos com uma equipe de guias parceiros na Chapada dos Veadeiros para realização de passeios exclusivos ou em excursões com grupos diversos",
    sub: "Faça seu roteiro ou entre na próxima excursão",
    cta: { kind: "whatsapp", label: "Whatsapp" },
  },
  {
    image: Wp.almecegas,
    badge: "Em breve",
    title: "Sua expedição começa na tela",
    lead:
      "Preparamos a plataforma de vendas do Guia Chapada Veadeiros para você escolher roteiros, datas e experiências com o mesmo olhar local — tudo em um fluxo digital limpo, seguro e pensado para quem viaja com intensidade.",
    sub: "Seja avisado em primeira mão quando abrirmos as reservas e garanta prioridade para montar seu itinerário.",
    cta: { kind: "router", to: "/contato", label: "Quero entrar na lista" },
  },
];

const HERO_DRAG_THRESHOLD_PX = 52;
const HERO_DRAG_LOCK_MIN_PX = 14;

function pickRandomHeroSlideIndex() {
  return Math.floor(Math.random() * HERO_SLIDES.length);
}

const HERO_TITLE_STEP_MS = 72;
const HERO_BODY_WORD_STEP_MS = 42;
const HERO_BLOCK_GAP_MS = 140;

function buildHeroAnim(title: string, lead: string, sub: string) {
  const titleWords = title.trim().split(/\s+/).filter(Boolean).length;
  const leadWords = lead.trim().split(/\s+/).filter(Boolean).length;
  const subTrim = sub.trim();
  const subWords = subTrim ? subTrim.split(/\s+/).filter(Boolean).length : 0;

  const badgeMs = 40;
  const titleStartMs = 120;
  const leadStartMs = titleStartMs + titleWords * HERO_TITLE_STEP_MS + HERO_BLOCK_GAP_MS;
  const subStartMs = leadStartMs + leadWords * HERO_BODY_WORD_STEP_MS + HERO_BLOCK_GAP_MS;
  const afterBodyMs =
    subWords > 0 ? subStartMs + subWords * HERO_BODY_WORD_STEP_MS : leadStartMs + leadWords * HERO_BODY_WORD_STEP_MS;
  const ctaStartMs = afterBodyMs + HERO_BLOCK_GAP_MS + 160;

  return { badgeMs, titleStartMs, leadStartMs, subStartMs, ctaStartMs };
}

function StaggeredWords({
  text,
  startAtMs,
  stepMs,
  lineClassName,
  wordClassName,
}: {
  text: string;
  startAtMs: number;
  stepMs: number;
  lineClassName?: string;
  wordClassName?: string;
}) {
  const words = text.trim().split(/\s+/);

  return (
    <span className={lineClassName}>
      {words.map((word, index) => (
        <span
          key={`${index}-${word}`}
          className={`gcv-hero-word ${wordClassName ?? ""}`}
          style={{
            animationDelay: `${startAtMs + index * stepMs}ms`,
          }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </span>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.718 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
    image: Wp.almecegas,
  },
  {
    label: "Sao Jorge",
    title: "Vale da Lua",
    meta: "Trilha facil · 32 km",
    href: "/vale-lua-guia-chapada-veadeiros-sao-jorge",
    image: Wp.valeLua,
  },
  {
    label: "Aventura",
    title: "Cataratas dos Couros",
    meta: "Trilha dificil · guia recomendado",
    href: "/cataratas-dos-couros-guia-chapada-veadeiros-alto-paraiso",
    image: Wp.couros,
  },
  {
    label: "Cavalcante",
    title: "Cachoeira Santa Barbara",
    meta: "Trilha mediana · 130 km",
    href: "/cachoeira-santa-barbara-guia-chapada-veadeiros-cavalcante",
    image: Wp.santaBarbara,
  },
  {
    label: "Sao Jorge",
    title: "Cachoeira do Segredo",
    meta: "Trilha mediana · 56 km",
    href: "/cachoeira-segredo-guia-chapada-veadeiros-sao-jorge",
    image: Wp.segredo,
  },
  {
    label: "Alto Paraiso",
    title: "Cachoeira dos Cristais",
    meta: "Acesso facil · familia",
    href: "/cachoeira-cristais-guia-chapada-veadeiros-alto-paraiso",
    image: Wp.cristais,
  },
  {
    label: "Teresina de Goias",
    title: "Poco Encantado",
    meta: "Trilha facil · 53 km",
    href: "/cachoeira-poco-encantado-guia-chapada-veadeiros-teresina-de-goias",
    image: Wp.pocoEncantado,
  },
  {
    label: "Sao Joao",
    title: "Macaquinhos",
    meta: "Trilha dificil · 44 km",
    href: "/cachoeira-macaquinhos-guia-chapada-veadeiros-sao-joao-alianca",
    image: Wp.macaquinhos,
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
    image: Wp.valeLua,
    quote:
      "Diego é um guia incrível! Sempre com as melhores dicas de passeio, muito conhecimento local e super solícito com os grupos. Recomendo demais!",
  },
  {
    name: "Mayla Santos",
    city: "Avaliação Google · 5 estrelas",
    tour: "Pontualidade e trilhas",
    image: Wp.parqueNacionalSalto,
    quote:
      "O Diego é um guia muito atencioso, solícito, com uma energia incrível! É extremamente pontual — não teve um dia sequer que chegou além do horário combinado —, dirige super bem, conhece a região e os caminhos das cachoeiras, o que facilitou muito cada dia.",
  },
  {
    name: "Paula Altenfelder",
    city: "Avaliação Google · 5 estrelas",
    tour: "Transporte + passeio",
    image: Wp.couros,
    quote:
      "O Diego é um excelente guia, espirituoso, solícito, parceiro, extremamente pontual (sempre estava no horário combinado para o passeio), bem humorado, responsável, ótimo motorista. Um dos poucos guias da Chapada que fazem o pacote completo de transporte e passeio. Nota 10! Recomendo de olhos fechados.",
  },
  {
    name: "Tatiana Lopes",
    city: "Avaliação Google · 5 estrelas",
    tour: "Roteiro com guia",
    image: Wp.cristais,
    quote:
      "O Guia Diego da agência foi excelente guia! Super simpático, solícito e demonstrou ser mil conhecedor da região. Nos ajudou com o roteiro, boas dicas e sugeriu vários passeios! Super indico!",
  },
  {
    name: "Frederico Augusto Lobo",
    city: "Avaliação Google · 5 estrelas",
    tour: "Preço justo e trilhas",
    image: Wp.santaBarbara,
    quote:
      "Muito bom serviço, preço justo, recomendo. O guia Diego foi muito bom, passa total segurança nas trilhas e tem todo o conhecimento dos lugares.",
  },
  {
    name: "Priscila Navi",
    city: "Avaliação Google · 5 estrelas",
    tour: "Roteiro sob medida",
    image: Wp.segredo,
    quote:
      "Guia Diego da agência muito simpático e conhecedor da região. Nos ajudou com o nosso roteiro e sugeriu passeios de acordo com as nossas necessidades. Nota dez!",
  },
  {
    name: "Gabriel Landa Noronha",
    city: "Avaliação Google · 5 estrelas",
    tour: "Guia local",
    image: Wp.almecegas,
    quote:
      "Se vc vai à Chapada, tem que conhecer o Diogo. Guia super honesto, bacana, bem humorado e conhecedor nato da chapada.",
  },
  {
    name: "Francis Lima",
    city: "Avaliação Google · 5 estrelas",
    tour: "Viagem com guia",
    image: Wp.pocoEncantado,
    quote: "Com certeza o guia Diego fez toda diferença na viagem! Indico mto!",
  },
  {
    name: "Alan Braz",
    city: "Avaliação Google · 5 estrelas",
    tour: "Recomendação",
    image: Wp.macaquinhos,
    quote:
      "Eu não usei o serviço, mas indico sempre pra quem tem pouco aptidão física para caminhada e subir em obstáculos, pois aqui é necessário.",
  },
  {
    name: "RudolphCarla",
    city: "Avaliação Google · 5 estrelas",
    tour: "Organização dos passeios",
    image: Wp.valeLua,
    quote: "Ótimo para ajudar o turista a se organizar nos passeios.",
  },
  {
    name: "Kaique Rodrigues Vieira",
    city: "Avaliação Google · 5 estrelas",
    tour: "Energia e equipe",
    image: Wp.parqueNacionalSalto,
    quote: "Lugar muito legal, com pessoas incríveis de energia muito da hora.",
  },
  {
    name: "Daniel Klein",
    city: "Avaliação Google · 5 estrelas",
    tour: "Indicação",
    image: Wp.couros,
    quote: "Excelente! Recomendo demais, só vão!",
  },
  {
    name: "Felipe Spingola",
    city: "Avaliação Google · 5 estrelas",
    tour: "Agência na Chapada",
    image: Wp.cristais,
    quote: "Melhor agência da Chapada. Recomendo!!!!",
  },
  {
    name: "Humberto Sousa",
    city: "Avaliação Google · 5 estrelas",
    tour: "Dicas e roteiros",
    image: Wp.santaBarbara,
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
  const [heroImageIndex, setHeroImageIndex] = useState(() => pickRandomHeroSlideIndex());
  const heroPointerDragRef = useRef({ pointerId: -1, startX: 0, locked: false });
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

  function goToPreviousHeroImage() {
    setHeroImageIndex((index) => (index - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  function goToNextHeroImage() {
    setHeroImageIndex((index) => (index + 1) % HERO_SLIDES.length);
  }

  function handleHeroPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, [role='tab']")) {
      return;
    }

    heroPointerDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      locked: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleHeroPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = heroPointerDragRef.current;
    if (drag.pointerId !== event.pointerId) {
      return;
    }

    if (!drag.locked && Math.abs(event.clientX - drag.startX) >= HERO_DRAG_LOCK_MIN_PX) {
      drag.locked = true;
    }
  }

  function handleHeroPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const drag = heroPointerDragRef.current;
    if (drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }

    heroPointerDragRef.current = { pointerId: -1, startX: 0, locked: false };

    if (drag.locked && Math.abs(dx) >= HERO_DRAG_THRESHOLD_PX) {
      if (dx < 0) {
        goToNextHeroImage();
      } else {
        goToPreviousHeroImage();
      }
    }
  }

  const heroSlide = HERO_SLIDES[heroImageIndex];
  const heroAnim = useMemo(
    () => buildHeroAnim(heroSlide.title, heroSlide.lead, heroSlide.sub),
    [heroSlide.title, heroSlide.lead, heroSlide.sub],
  );

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
            className="relative cursor-grab touch-pan-y overflow-hidden rounded-[1.8rem] bg-[#0f2420] shadow-2xl active:cursor-grabbing"
            role="region"
            aria-roledescription="Carrossel"
            aria-label={`Destaque ${heroImageIndex + 1} de ${HERO_SLIDES.length}`}
            onPointerCancel={handleHeroPointerEnd}
            onPointerDown={handleHeroPointerDown}
            onPointerMove={handleHeroPointerMove}
            onPointerUp={handleHeroPointerEnd}
          >
            <img
              src={heroSlide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#0a1814]/92 via-[#0f2420]/78 to-[#163d33]/70"
              aria-hidden
            />
            <div
              className="gcv-hero-overlay-text relative z-[1] px-5 py-16 text-white sm:px-8 md:px-12 md:py-24 lg:py-28"
            >
              <button
                type="button"
                className="absolute left-4 top-1/2 z-[2] grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/18"
                onClick={goToPreviousHeroImage}
                aria-label="Imagem anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 z-[2] grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/18"
                onClick={goToNextHeroImage}
                aria-label="Próxima imagem"
              >
                ›
              </button>
              <div key={heroImageIndex}>
                <span
                  className="gcv-hero-line gcv-hero-badge inline-flex rounded-full bg-[#e58b55] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-lg sm:text-[11px]"
                  style={{ animationDelay: `${heroAnim.badgeMs}ms` }}
                >
                  {heroSlide.badge}
                </span>
                <h1 className="mt-5 max-w-4xl text-balance text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                  <StaggeredWords
                    text={heroSlide.title}
                    startAtMs={heroAnim.titleStartMs}
                    stepMs={HERO_TITLE_STEP_MS}
                  />
                </h1>
                <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-white/92 md:text-lg md:leading-relaxed">
                  <StaggeredWords
                    text={heroSlide.lead}
                    startAtMs={heroAnim.leadStartMs}
                    stepMs={HERO_BODY_WORD_STEP_MS}
                  />
                </p>
                {heroSlide.sub.trim() ? (
                  <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/88 md:text-base">
                    <StaggeredWords
                      text={heroSlide.sub}
                      startAtMs={heroAnim.subStartMs}
                      stepMs={HERO_BODY_WORD_STEP_MS}
                    />
                  </p>
                ) : null}
                {heroSlide.cta.kind === "whatsapp" ? (
                  <a
                    className="gcv-hero-line mt-7 inline-flex items-center gap-2 rounded-full bg-[#e58b55] px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-xl shadow-orange-950/40 transition hover:bg-[#d97941] md:text-sm"
                    href={whatsappUrl}
                    rel="noreferrer"
                    target="_blank"
                    style={{ animationDelay: `${heroAnim.ctaStartMs}ms` }}
                  >
                    <WhatsAppGlyph className="h-5 w-5 shrink-0" />
                    {heroSlide.cta.label}
                  </a>
                ) : (
                  <Link
                    className="gcv-hero-line mt-7 inline-flex items-center justify-center rounded-full bg-[#e58b55] px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-xl shadow-orange-950/40 transition hover:bg-[#d97941] md:text-sm"
                    to={heroSlide.cta.to}
                    style={{ animationDelay: `${heroAnim.ctaStartMs}ms` }}
                  >
                    {heroSlide.cta.label}
                  </Link>
                )}
              </div>
            </div>
            <div
              className="absolute bottom-3 left-0 right-0 z-[3] flex justify-center px-4 sm:bottom-4"
              role="tablist"
              aria-label="Navegação dos destaques"
            >
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === heroImageIndex}
                  aria-label={`Destaque ${index + 1} de ${HERO_SLIDES.length}`}
                  className={
                    index === heroImageIndex
                      ? "mx-1.5 h-2 w-10 shrink-0 rounded-full bg-white shadow-sm transition-all duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      : "mx-1.5 h-2 w-2 shrink-0 rounded-full bg-white/40 transition-all duration-300 ease-out hover:bg-white/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  }
                  onClick={() => setHeroImageIndex(index)}
                />
              ))}
            </div>
          </div>

          <section className="mt-12 rounded-[1.75rem] border border-white/40 bg-white/90 p-5 shadow-xl shadow-slate-400/15 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-[11px]">
                  Atrações imperdíveis
                </span>
                <h2 className="mt-3 max-w-[20ch] text-balance text-2xl font-black leading-[1.12] text-slate-900 sm:max-w-none md:text-4xl lg:text-[2.65rem]">
                  Cachoeiras e trilhas mais buscadas
                </h2>
              </div>
              <Link
                className="shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-cerrado-700 transition hover:text-[#df8350]"
                to="/cachoeiras-chapada-dos-veadeiros"
              >
                Ver Todas
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {featuredAttractions.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group relative h-72 overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-black/5 transition hover:shadow-2xl"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/25 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] text-slate-900 shadow-md sm:text-[10px]">
                    {item.label}
                  </span>
                  <h3 className="gcv-card-photo-text absolute bottom-5 left-4 right-4 text-balance text-base font-black leading-snug text-white sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="gcv-card-photo-text absolute bottom-2 left-4 right-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/85">
                    {item.meta}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-[1.75rem] border border-white/40 bg-white/90 p-5 shadow-xl shadow-slate-400/15 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-[11px]">
                  Blog da Chapada dos Veadeiros
                </span>
                <h2 className="mt-3 max-w-[18ch] text-balance text-2xl font-black leading-[1.12] text-slate-900 sm:max-w-none md:text-4xl">
                  Últimas Notícias da Chapada dos Veadeiros
                </h2>
              </div>
              <Link
                className="shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-cerrado-700 transition hover:text-[#df8350]"
                to="/blog"
              >
                Ver Todos
              </Link>
            </div>
            <div className="mt-6 divide-y divide-slate-200">
              {latestPosts.map((post) => (
                <Link key={post.href} to={post.href} className="block py-4 transition first:pt-1 hover:bg-slate-50/80">
                  <h3 className="text-lg font-bold normal-case leading-snug tracking-tight text-slate-900">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-8 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#142a52] via-[#172f59] to-[#0f203f] p-6 text-white shadow-xl shadow-slate-950/25 md:grid-cols-[0.85fr_1.15fr] md:p-8">
            <div>
              <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-[11px]">
                Mapa interativo
              </span>
              <h2 className="mt-4 max-w-[20ch] text-balance text-2xl font-black leading-[1.12] md:max-w-none md:text-4xl lg:text-5xl">
                Explore a Chapada dos Veadeiros pelo mapa interativo
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/85 md:text-[0.95rem]">
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

          <section className="mt-10 rounded-[1.75rem] border border-white/40 bg-white/90 p-5 shadow-xl shadow-slate-400/15 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-[11px]">
                  Instagram
                </span>
              </div>
              <a
                className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#c4744a] transition hover:text-[#a85a38]"
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
                    className="mt-4 inline-flex rounded-full bg-[#df8350] px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-xl shadow-orange-200/80 transition hover:bg-[#c96a3a]"
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

          <section className="mt-12 px-1 text-center sm:px-2">
            <span className="inline-flex rounded-full bg-[#168f7a] px-4 py-2 text-[10px] text-white sm:text-[11px]">
              Ecoturismo
            </span>
            <h2 className="mt-4 text-2xl font-black text-slate-800 normal-case tracking-tight md:text-4xl">
              <span className="text-[#e5a12d]" aria-hidden>
                ★
              </span>{" "}
              Avaliações dos viajantes
            </h2>
            <p className="mt-2 text-sm text-slate-600">Experiências reais de quem viveu a Chapada dos Veadeiros.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                aria-label="Avaliações anteriores"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-emerald-600/30 bg-white text-xl font-bold text-emerald-700 shadow-sm transition hover:border-[#df8350] hover:text-[#df8350]"
                type="button"
                onClick={goToPreviousReviewPage}
              >
                ‹
              </button>
              <span className="max-w-full rounded-full bg-white px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 shadow-sm md:text-xs">
                {reviewPage + 1} / {totalReviewPages} · 3 avaliações por vez
              </span>
              <button
                aria-label="Próximas avaliações"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-emerald-600/30 bg-white text-xl font-bold text-emerald-700 shadow-sm transition hover:border-[#df8350] hover:text-[#df8350]"
                type="button"
                onClick={goToNextReviewPage}
              >
                ›
              </button>
            </div>
            <div className="mt-8 grid auto-rows-[440px] gap-5 md:grid-cols-3">
              {visibleReviews.map((review) => (
                <article
                  key={review.name}
                  className="flex h-[440px] flex-col rounded-2xl border border-slate-100 bg-white p-7 text-left shadow-lg shadow-slate-200/90 md:p-8"
                >
                  <div className="flex min-h-[112px] items-center gap-4">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="h-20 w-20 rounded-full object-cover shadow-lg shadow-emerald-100/80 ring-2 ring-white"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-[#caa24b]">★★★★★</p>
                      <h3 className="mt-1 text-lg font-bold normal-case tracking-tight text-slate-800">{review.name}</h3>
                      <p className="text-xs font-semibold text-slate-600">{review.city}</p>
                      <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-2 text-[9px] text-cerrado-700">
                        {review.tour}
                      </span>
                    </div>
                  </div>
                  <blockquote className="mt-8 flex-1 overflow-y-auto border-l-4 border-emerald-500 bg-slate-50/90 p-5 text-sm not-italic leading-7 text-slate-700">
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
