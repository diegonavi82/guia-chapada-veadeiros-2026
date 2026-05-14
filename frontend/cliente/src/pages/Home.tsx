import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LangLink } from "../i18n/LangLink";
import { SITE_ORIGIN } from "../config/siteOrigin";
import { useSiteLocale } from "../i18n/siteLocale";
import { withLocalePrefix } from "../i18n/paths";
import { WATERFALL_MAP_IMAGE_URL, waterfallMapHotspots } from "../config/waterfallMap";
import { wpUploadsAssets as Wp } from "../config/wpUploadsAssets";
import { WaitlistModal } from "../components/WaitlistModal";
import { LatestRevistaLayouts } from "../components/revista/LatestRevistaLayouts";
import type { RevistaTeaserPost } from "../components/revista/types";
import { mergeRevistaTeaserPosts } from "../data/mergeRevistaTeaserPosts";
import { REVISTA_FALLBACK_POSTS } from "../data/revistaFallbackPosts";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";

const mapImageUrl = WATERFALL_MAP_IMAGE_URL;
const whatsappUrl =
  "https://api.whatsapp.com/send?phone=5562982506891&text=*Quero%20montar%20um%20roteiro%20na%20Chapada*";

type HeroCta =
  | { kind: "whatsapp"; label: string }
  | { kind: "router"; to: string; label: string }
  | { kind: "waitlist"; label: string };

type HeroSlideCopy = {
  badge: string;
  title: string;
  lead: string;
  sub: string;
  cta: HeroCta;
};

type HeroSlide = HeroSlideCopy & { image: string };

const HERO_SLIDE_COUNT = 2;
const HERO_DRAG_THRESHOLD_PX = 52;
const HERO_DRAG_LOCK_MIN_PX = 14;

function pickRandomHeroSlideIndex(length: number) {
  return Math.floor(Math.random() * length);
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

function shuffleReviews() {
  return [...reviews].sort(() => Math.random() - 0.5);
}

export function Home() {
  const locale = useSiteLocale();
  const homePath = withLocalePrefix("/", locale);
  const homeUrl = `${SITE_ORIGIN}${homePath}`;
  const searchActionTarget = `${SITE_ORIGIN}${withLocalePrefix("/busca", locale)}?q={search_term_string}`;
  const { t } = useTranslation();
  const heroSlides = useMemo(
    (): HeroSlide[] => [
      {
        image: Wp.heroSlideGuiasLocais,
        badge: t("hero.slide1.badge"),
        title: t("hero.slide1.title"),
        lead: t("hero.slide1.lead"),
        sub: t("hero.slide1.sub"),
        cta: { kind: "whatsapp", label: t("hero.slide1.ctaWhatsApp") },
      },
      {
        image: Wp.heroSlideEmBreve,
        badge: t("hero.slide2.badge"),
        title: t("hero.slide2.title"),
        lead: t("hero.slide2.lead"),
        sub: t("hero.slide2.sub"),
        cta: { kind: "waitlist", label: t("hero.slide2.ctaWaitlist") },
      },
    ],
    [t],
  );
  const [reviewPage, setReviewPage] = useState(0);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [instagramPhotos, setInstagramPhotos] = useState<InstagramMediaItem[]>([]);
  const [isInstagramLoading, setIsInstagramLoading] = useState(true);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  const [revistaLatest, setRevistaLatest] = useState<RevistaTeaserPost[]>([]);
  const [revistaLoading, setRevistaLoading] = useState(true);
  const [revistaError, setRevistaError] = useState<string | null>(null);
  const [heroImageIndex, setHeroImageIndex] = useState(() => pickRandomHeroSlideIndex(HERO_SLIDE_COUNT));
  const heroPointerDragRef = useRef({ pointerId: -1, startX: 0, locked: false });
  const shuffledReviews = useMemo(() => shuffleReviews(), []);
  const totalReviewPages = Math.ceil(shuffledReviews.length / reviewsPerPage);
  const visibleReviews = Array.from({ length: reviewsPerPage }, (_, index) => {
    const reviewIndex = (reviewPage * reviewsPerPage + index) % shuffledReviews.length;

    return shuffledReviews[reviewIndex];
  });

  useEffect(() => {
    let isMounted = true;

    apiGet<{ items: RevistaTeaserPost[] }>("/posts/latest?take=8")
      .then((payload) => {
        if (isMounted) {
          const extra =
            payload.items.length < REVISTA_FALLBACK_POSTS.length ? REVISTA_FALLBACK_POSTS : [];
          setRevistaLatest(mergeRevistaTeaserPosts(payload.items, extra));
          setRevistaError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRevistaLatest(mergeRevistaTeaserPosts([], REVISTA_FALLBACK_POSTS));
          setRevistaError(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setRevistaLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
    setHeroImageIndex((index) => (index - 1 + heroSlides.length) % heroSlides.length);
  }

  function goToNextHeroImage() {
    setHeroImageIndex((index) => (index + 1) % heroSlides.length);
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

  const heroSlide = heroSlides[heroImageIndex];
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
        canonical={homePath}
        ogImage={mapImageUrl}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${homeUrl}#page`,
              url: homeUrl,
              name: "Guia Chapada Veadeiros",
              description:
                "Cachoeiras, passeios, eventos, gastronomia, hospedagem, terapias holísticas, arte e muito mais. Um guia completo na Chapada dos Veadeiros.",
            },
            {
              "@type": "WebSite",
              "@id": `${homeUrl}#website`,
              url: homeUrl,
              name: "Guia Chapada Veadeiros",
              description:
                "Cachoeiras, atrativos naturais, eventos, trilhas, hospedagem, gastronomia, lojas e muito mais sobre a Chapada dos Veadeiros.",
              potentialAction: {
                "@type": "SearchAction",
                target: searchActionTarget,
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />
      <section className="official-home-shell px-3 pb-14 pt-7 sm:px-4 sm:pb-16 sm:pt-9">
        <div className="mx-auto max-w-[1180px]">
          <div
            className="relative w-full cursor-grab touch-pan-y overflow-hidden rounded-[1.8rem] bg-[#0f2420] shadow-2xl active:cursor-grabbing max-sm:aspect-none max-sm:min-h-[460px] sm:aspect-video sm:min-h-[340px]"
            role="region"
            aria-roledescription="Carrossel"
            aria-label={`Destaque ${heroImageIndex + 1} de ${heroSlides.length}`}
            onPointerCancel={handleHeroPointerEnd}
            onPointerDown={handleHeroPointerDown}
            onPointerMove={handleHeroPointerMove}
            onPointerUp={handleHeroPointerEnd}
          >
            <img
              src={heroSlide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover brightness-[0.8]"
              loading="eager"
              decoding="async"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#0a1814]/92 via-[#0f2420]/78 to-[#163d33]/70"
              aria-hidden
            />
            <div className="gcv-hero-overlay-text absolute inset-0 z-[1] flex flex-col justify-center overflow-hidden px-16 py-10 text-white max-sm:justify-start max-sm:pb-[3.25rem] max-sm:pt-10 sm:py-14 md:px-20 md:py-20 lg:py-24">
              <button
                type="button"
                className="absolute left-2 top-1/2 z-[2] grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/18 sm:left-4 sm:h-9 sm:w-9"
                onClick={goToPreviousHeroImage}
                aria-label="Imagem anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 z-[2] grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/18 sm:right-4 sm:h-9 sm:w-9"
                onClick={goToNextHeroImage}
                aria-label="Próxima imagem"
              >
                ›
              </button>
              <div key={heroImageIndex}>
                <span
                  className={`gcv-hero-line gcv-hero-badge mt-1 inline-flex max-w-[calc(100%-0.25rem)] rounded-full bg-[#e58b55] px-3 py-1.5 text-[10px] font-black uppercase leading-tight tracking-wide text-white max-sm:break-words sm:mt-0 sm:px-4 sm:py-2 sm:text-xs sm:text-[11px] ${
                    heroSlide.cta.kind === "waitlist" || heroSlide.cta.kind === "whatsapp"
                      ? "gcv-hero-plain-chip"
                      : "shadow-lg"
                  }`}
                  style={{ animationDelay: `${heroAnim.badgeMs}ms` }}
                >
                  {heroSlide.badge}
                </span>
                <h1 className="mt-3 max-w-full text-balance text-[clamp(1.45rem,4.85vw,1.85rem)] font-black leading-[1.14] tracking-tight sm:mt-5 sm:max-w-4xl sm:text-4xl sm:leading-[1.08] md:text-5xl lg:text-6xl xl:text-7xl">
                  <StaggeredWords
                    text={heroSlide.title}
                    startAtMs={heroAnim.titleStartMs}
                    stepMs={HERO_TITLE_STEP_MS}
                  />
                </h1>
                <p className="mt-3 max-w-full text-sm font-medium leading-snug text-white/92 max-sm:text-balance sm:mt-5 sm:max-w-3xl sm:text-base sm:leading-relaxed md:text-lg md:leading-relaxed">
                  <StaggeredWords
                    text={heroSlide.lead}
                    startAtMs={heroAnim.leadStartMs}
                    stepMs={HERO_BODY_WORD_STEP_MS}
                  />
                </p>
                {heroSlide.sub.trim() ? (
                  <p className="mt-3 max-w-full text-[13px] font-medium leading-snug text-white/88 max-sm:text-balance sm:mt-4 sm:max-w-2xl sm:text-sm md:text-base md:leading-relaxed">
                    <StaggeredWords
                      text={heroSlide.sub}
                      startAtMs={heroAnim.subStartMs}
                      stepMs={HERO_BODY_WORD_STEP_MS}
                    />
                  </p>
                ) : null}
                {heroSlide.cta.kind === "whatsapp" ? (
                  <a
                    className="gcv-hero-line gcv-hero-plain-chip mt-5 inline-flex items-center gap-2 rounded-full bg-[#e58b55] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#d97941] max-sm:max-w-full max-sm:break-words max-sm:text-center max-sm:[text-wrap:balance] sm:mt-7 sm:w-auto sm:px-6 sm:py-3.5 sm:text-xs sm:tracking-[0.12em] md:text-sm"
                    href={whatsappUrl}
                    rel="noreferrer"
                    target="_blank"
                    style={{ animationDelay: `${heroAnim.ctaStartMs}ms` }}
                  >
                    <WhatsAppGlyph className="h-5 w-5 shrink-0" />
                    {heroSlide.cta.label}
                  </a>
                ) : heroSlide.cta.kind === "waitlist" ? (
                  <button
                    type="button"
                    className="gcv-hero-line gcv-hero-plain-chip mt-5 inline-flex items-center justify-center rounded-full bg-[#e58b55] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#d97941] max-sm:max-w-full max-sm:break-words max-sm:text-center max-sm:[text-wrap:balance] sm:mt-7 sm:w-auto sm:px-6 sm:py-3.5 sm:text-xs sm:tracking-[0.12em] md:text-sm"
                    style={{ animationDelay: `${heroAnim.ctaStartMs}ms` }}
                    onClick={() => setWaitlistOpen(true)}
                  >
                    {heroSlide.cta.label}
                  </button>
                ) : (
                  <LangLink
                    className="gcv-hero-line mt-5 inline-flex items-center justify-center rounded-full bg-[#e58b55] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white shadow-xl shadow-orange-950/40 transition hover:bg-[#d97941] max-sm:max-w-full max-sm:break-words max-sm:text-center max-sm:[text-wrap:balance] sm:mt-7 sm:w-auto sm:px-6 sm:py-3.5 sm:text-xs sm:tracking-[0.12em] md:text-sm"
                    to={heroSlide.cta.to}
                    style={{ animationDelay: `${heroAnim.ctaStartMs}ms` }}
                  >
                    {heroSlide.cta.label}
                  </LangLink>
                )}
              </div>
            </div>
            <div
              className="absolute bottom-3 left-0 right-0 z-[3] flex justify-center px-4 sm:bottom-4"
              role="tablist"
              aria-label="Navegação dos destaques"
            >
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === heroImageIndex}
                  aria-label={`Destaque ${index + 1} de ${heroSlides.length}`}
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
                <h2 className="mt-3 max-w-full text-balance text-[clamp(1.12rem,4.1vw,1.4rem)] font-black leading-[1.15] text-slate-900 sm:max-w-[20ch] sm:text-2xl md:text-4xl lg:text-[2.65rem]">
                  Cachoeiras e trilhas mais buscadas
                </h2>
              </div>
              <LangLink
                className="shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-cerrado-700 transition hover:text-[#df8350]"
                to="/atrativos"
              >
                Ver Todas
              </LangLink>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {featuredAttractions.map((item) => (
                <LangLink
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
                </LangLink>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-[1.75rem] border border-white/40 bg-white/90 p-5 shadow-xl shadow-slate-400/15 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="max-w-full text-balance text-[clamp(1.12rem,4.05vw,1.36rem)] font-black leading-[1.15] text-slate-900 sm:max-w-none sm:text-2xl md:text-4xl">
                  Últimas notícias da Chapada dos Veadeiros
                </h2>
              </div>
              <LangLink
                className="shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-cerrado-700 transition hover:text-[#df8350]"
                to="/revista"
              >
                Ver tudo
              </LangLink>
            </div>
            {revistaLoading ? <p className="mt-6 text-sm text-slate-600">Carregando matérias…</p> : null}
            {revistaError ? <p className="mt-6 text-sm text-amber-800">{revistaError}</p> : null}
            {!revistaLoading && !revistaError && revistaLatest.length === 0 ? (
              <p className="mt-6 text-sm text-slate-600">Em breve novas matérias na Revista.</p>
            ) : null}
            {!revistaLoading && !revistaError && revistaLatest.length > 0 ? (
              <div className="mt-6">
                <LatestRevistaLayouts posts={revistaLatest} />
              </div>
            ) : null}
          </section>

          <section className="mt-5 grid gap-8 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#142a52] via-[#172f59] to-[#0f203f] p-6 text-white shadow-xl shadow-slate-950/25 md:grid-cols-[0.85fr_1.15fr] md:p-8">
            <div>
              <span className="inline-flex rounded-full bg-[#e58b55] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-[11px]">
                Mapa interativo
              </span>
              <h2 className="mt-4 max-w-full text-balance text-[clamp(1.12rem,4.05vw,1.38rem)] font-black leading-[1.14] md:max-w-none md:text-4xl lg:text-5xl">
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
                      <div className="gcv-map-lightbox__hotspots">
                        {waterfallMapHotspots.map((spot) => (
                          <LangLink
                            key={spot.href}
                            aria-label={spot.label}
                            className="gcv-map-lightbox__hotspot"
                            style={{
                              height: `${spot.box.h}%`,
                              left: `${spot.box.l}%`,
                              top: `${spot.box.t}%`,
                              width: `${spot.box.w}%`,
                            }}
                            title={spot.label}
                            to={spot.href}
                            onClick={() => setIsMapOpen(false)}
                          />
                        ))}
                      </div>
                    </figure>
                    <p className="gcv-map-lightbox__mode">
                      Toque ou clique no nome do atrativo no mapa para abrir o guia.
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

          <WaitlistModal onClose={() => setWaitlistOpen(false)} open={waitlistOpen} />

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
