import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArticleAuthorCard } from "../../components/revista/ArticleAuthorCard";
import { ArticleShareBar } from "../../components/revista/ArticleShareBar";
import { Seo } from "../../seo/Seo";
import { wpUploadsAssets } from "../../config/wpUploadsAssets";
import { formatPublicationDatePt } from "../../utils/formatPublicationDatePt";
import "../../styles/gcv-post.css";

const ARTICLE_PUBLISHED_ISO = "2026-05-13T12:00:00-03:00";
const SITE_ORIGIN =
  (typeof import.meta.env.VITE_SITE_ORIGIN === "string" && import.meta.env.VITE_SITE_ORIGIN.replace(/\/$/, "")) ||
  "https://www.guiachapadaveadeiros.com";

const REVISTA_ARTICLE_PATH = "/revista/contratar-guia-local-chapada-veadeiros";

/** Fotos reais do passeio — coloque os PNG/JPG nesta pasta (nomes estáveis para SEO e cache). */
const ARTICLE_IMAGES = "/uploads/revista/contratar-guia-artigo" as const;

/** Foto principal do artigo + mesma obra na sequência editorial (sem duplicar no corpo). */
const IMG_GRUPO_CACHOEIRA_MONUMENTAL = `${ARTICLE_IMAGES}/grupo-cachoeira-monumental-guia-chapada-veadeiros.png`;

const IMGS = {
  hero: IMG_GRUPO_CACHOEIRA_MONUMENTAL,
  /** Vista de cima — turista em poça triangular nas Cataratas dos Couros (`public/imagens/`). */
  fotoTuristaTrianguloCouros: "/imagens/turista-relaxando-triangulo-guia-chapada-veadeiros.jpeg",
  foto4: `${ARTICLE_IMAGES}/cataratas-couros-selfie-guia-turistas-chapada-veadeiros.png`,
  foto5: `${ARTICLE_IMAGES}/mirante-plataforma-grupo-familias-chapada-veadeiros.png`,
  trioA: `${ARTICLE_IMAGES}/selfie-rio-cachoeira-fundo-guia-chapada-veadeiros.png`,
  trioB: `${ARTICLE_IMAGES}/grupo-selfie-cachoeira-multinivel-chapada-veadeiros.png`,
  trioC: "/imagens/cachoeira-macaco-chapada-veadeiros-macacao-4.jpg",
  /** Mesma obra que `foto4` — legenda distinta na secção “Novas amizades”. */
  foto6: `${ARTICLE_IMAGES}/cataratas-couros-selfie-guia-turistas-chapada-veadeiros.png`,
  /** Família em poça natural — secção “O lado humano” (substitui o antigo duplicado no strip de 3 fotos). */
  foto7: `${ARTICLE_IMAGES}/familia-piscina-natural-rochas-guia-chapada-veadeiros.png`,
} as const;

const CAPTION_FOTO4 =
  "Cataratas dos Couros — uma das formações mais impressionantes da Chapada. Um guia local conhece cada detalhe dessa trilha e os melhores horários.";
const CAPTION_FOTO5 =
  "Parque Nacional e mirantes: o guia adapta o ritmo para cada perfil. Com famílias e grupos de terceira idade nas plataformas de observação, o cuidado é redobrado.";
const CAPTION_TRIO_A =
  "Guia e turistas em selfie à beira do rio, com cachoeira ao fundo na Chapada dos Veadeiros — registro espontâneo do passeio guiado.";
const CAPTION_TRIO_B =
  "Grupo numeroso na base da queda d’água: com guia todos chegam juntos aos ângulos mais marcantes com segurança.";
const CAPTION_TRIO_C =
  "Passeios guiados com roteiros do lado B da Chapada que te levam a lugares fora do eixo comercial, sem aglomerações";
const CAPTION_FOTO6 =
  "Cataratas dos Couros — trechos de piscina natural e encontro do grupo só ficam tão seguros e memoráveis com condutor credenciado que conhece o local.";
const CAPTION_FOTO7 =
  "Proximidade e confiança entre guia e grupo: o lado humano que diferencia um passeio com guia local na Chapada dos Veadeiros de um roteiro genérico.";
const CAPTION_TURISTA_TRIANGULO_COUROS =
  "Turista relaxando em local secreto nas Cataratas dos Couros";

const ALT_FOTO2 =
  "Grupo de turistas posando na base de cachoeira monumental na Chapada dos Veadeiros, Goiás, em passeio com guia credenciado Cadastur";
const ALT_FOTO4 =
  "Selfie de grupo com guia local às Cataratas dos Couros na Chapada dos Veadeiros, Alto Paraíso de Goiás";
const ALT_FOTO5 =
  "Grupo multigeracional com guia em mirante de madeira sobre canyon e trecho de rio na Chapada dos Veadeiros";
const ALT_TRIO_A =
  "Guia e turistas em selfie à beira de rio com cachoeira ao fundo na Chapada dos Veadeiros";
const ALT_TRIO_B =
  "Grupo de turistas em selfie na base de cachoeira em degraus na Chapada dos Veadeiros com guia Cadastur";
const ALT_TRIO_C =
  "Topo da Cachoeira Catedral no complexo Macaco Macacão na Chapada dos Veadeiros — roteiros guiados fora do eixo comercial";
const ALT_FOTO6 =
  "Turistas com guia nas Cataratas dos Couros, Chapada dos Veadeiros — piscinas naturais e quedas d’água do cerrado";
const ALT_FOTO7 =
  "Guia e família em poça natural entre rochas na Chapada dos Veadeiros — experiência humana do turismo com condutor local";
const ALT_TURISTA_TRIANGULO_COUROS =
  "Turista deitado sobre rochas ao lado de uma poça triangular que reflete o céu nas Cataratas dos Couros, Chapada dos Veadeiros";

const WHATSAPP =
  "https://api.whatsapp.com/send?phone=5562982506891&text=Quero%20contratar%20um%20guia%20para%20a%20Chapada%20dos%20Veadeiros";

const SEO_TITLE = "Por que contratar um guia de turismo em trilhas e natureza? | Chapada dos Veadeiros";

const SEO_DESCRIPTION =
  "Segurança, aproveitamento máximo, fotos incríveis e novas amizades: descubra por que contratar um guia de turismo credenciado na Chapada dos Veadeiros, com acesso seguro a piscinas naturais e cenários únicos só o condutor local conhece bem.";

const OG_DESCRIPTION =
  "Segurança, fotos marcantes e roteiro completo na Chapada dos Veadeiros, incluindo piscinas naturais entre rochas. Um credenciado transforma qualquer passeio.";

const KEYWORDS =
  "contratar guia chapada dos veadeiros, guia de turismo chapada veadeiros, condutor de visitantes chapada, por que contratar guia trilhas, passeios guiados alto paraíso, guia local chapada veadeiros, Diego Navi guia chapada, contratar guia natureza, piscina natural chapada dos veadeiros, Diego Navi Chapada dos Veadeiros, reflexo do céu poça natural cerrado, guia local fotos Chapada";

const canonicalUrl = `${SITE_ORIGIN}${REVISTA_ARTICLE_PATH}`;
const heroAbsolute = `${SITE_ORIGIN}${IMGS.hero}`;

const articleImagesAbsolute = [
  IMGS.hero,
  IMGS.fotoTuristaTrianguloCouros,
  IMGS.foto4,
  IMGS.foto5,
  IMGS.trioA,
  IMGS.trioB,
  IMGS.trioC,
].map((path) => `${SITE_ORIGIN}${path}`);

const jsonLdArticle = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Por que é tão importante contratar um guia em passeios por trilhas e natureza?",
  description:
    "Por que um guia credenciado na Chapada dos Veadeiros: segurança, fotos marcantes em piscinas naturais e roteiros que só o condutor local conhece bem.",
  image: articleImagesAbsolute,
  author: {
    "@type": "Person",
    name: "Diego Navi",
    url: `${SITE_ORIGIN}/`,
    jobTitle: "Analista de sistemas e condutor de ecoturismo credenciado (Cadastur)",
    image: `${SITE_ORIGIN}${wpUploadsAssets.articleAuthorDiegoPortrait}`,
  },
  publisher: {
    "@type": "Organization",
    name: "Guia Chapada dos Veadeiros",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/imagens/mapa.jpg`,
    },
  },
  datePublished: "2026-05-13",
  dateModified: "2026-05-13",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": canonicalUrl,
  },
  keywords: [
    "contratar guia chapada dos veadeiros",
    "guia de turismo chapada veadeiros",
    "condutor de visitantes",
    "por que contratar guia trilhas",
    "passeios natureza chapada veadeiros",
    "guia local alto paraíso de goiás",
    "piscina natural chapada dos veadeiros",
    "Diego Navi Chapada dos Veadeiros",
    "reflexo do céu poça natural cerrado",
  ],
  inLanguage: "pt-BR",
};

const SHARE_TITLE = "Por que contratar um guia na Chapada dos Veadeiros?";

export function ContratarGuiaArtigo() {
  return (
    <>
      <Seo
        title={SEO_TITLE}
        description={SEO_DESCRIPTION}
        canonical={REVISTA_ARTICLE_PATH}
        keywords={KEYWORDS}
        ogImage={heroAbsolute}
        ogTitle={SEO_TITLE}
        ogDescription={OG_DESCRIPTION}
        robots="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        type="article"
        breadcrumbs={[
          { name: "Início", url: "/" },
          { name: "Revista", url: "/revista" },
          { name: "Por que contratar um guia?", url: REVISTA_ARTICLE_PATH },
        ]}
        jsonLd={jsonLdArticle}
      />

      <Helmet>
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image:width" content="900" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:image:alt" content={ALT_FOTO2} />
        <meta property="article:author" content="Diego Navi" />
        <meta property="article:published_time" content="2026-05-13T00:00:00-03:00" />
        <meta property="article:modified_time" content="2026-05-13T00:00:00-03:00" />
        <meta property="article:section" content="Dicas" />
        <meta property="article:tag" content="contratar guia chapada dos veadeiros" />
        <meta property="article:tag" content="guia de turismo" />
        <meta property="article:tag" content="Diego Navi guia Chapada dos Veadeiros" />
      </Helmet>

      <div className="gcv-post-page">
        <div className="gcv-post-shell">
          <nav className="gcv-post-breadcrumb" aria-label="Caminho de navegação">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <Link to="/revista">Revista</Link>
            <span className="sep">›</span>
            <Link to="/revista">Dicas</Link>
            <span className="sep">›</span>
            <span>Por que contratar um guia?</span>
          </nav>

          <header className="gcv-post-hero">
            <img
              src={IMGS.hero}
              alt={ALT_FOTO2}
              width={900}
              height={1200}
              fetchPriority="high"
              decoding="async"
            />
            <div className="gcv-post-hero-overlay">
              <Link to="/revista" className="gcv-post-category">
                Dicas de viagem
              </Link>
              <h1>Por que é tão importante contratar um guia em passeios por trilhas e natureza?</h1>
            </div>
          </header>

          <div className="gcv-post-meta">
            <span className="autor">Diego Navi</span>
            <span className="dot">·</span>
            <time dateTime="2026-05-13">{formatPublicationDatePt(ARTICLE_PUBLISHED_ISO)}</time>
            <span className="dot">·</span>
            <span>8 min de leitura</span>
            <span className="dot">·</span>
            <span className="tag">Contratar guia</span>
            <span className="tag">Segurança</span>
            <span className="tag">Chapada dos Veadeiros</span>
          </div>

          <ArticleShareBar pageUrl={canonicalUrl} shareTitle={SHARE_TITLE} placement="afterHero" />

          <p className="gcv-post-lead">
            Contratar um guia de turismo não é um luxo. É a diferença entre um passeio seguro, rico em experiências e
            cheio de memórias inesquecíveis, e uma aventura que pode terminar mal. Neste artigo você vai entender todos
            os motivos pelos quais um condutor credenciado é indispensável em qualquer trilha ou passeio na natureza,
            especialmente na <strong>Chapada dos Veadeiros</strong>.
          </p>

          <div className="gcv-post-body">
            <p>
              A Chapada dos Veadeiros é um dos destinos de ecoturismo mais extraordinários do Brasil. Cachoeiras de
              águas cristalinas, trilhas no cerrado nativo, poços de cor esmeralda e formações rochosas com mais de um
              bilhão de anos. É também um ambiente selvagem, que exige respeito, preparo e, acima de tudo,{" "}
              <strong>conhecimento local</strong>.
            </p>
            <p>
              É aqui que entra o papel insubstituível do guia de turismo credenciado. Mais do que apontar o caminho, o
              condutor transforma cada passeio numa experiência completa: segura, emocionante, bem registrada em fotos e
              repleta de descobertas que você jamais faria sozinho.
            </p>

            <h2>
              <span className="ico" aria-hidden>
                🛡️
              </span>{" "}
              Segurança: o benefício mais importante
            </h2>

            <p>
              A Chapada dos Veadeiros é linda, e exatamente por isso não deve ser subestimada. Trilhas sem sinalização,
              rios com variação de correnteza, animais peçonhentos como serpentes, aranhas e escorpiões, e o risco real de{" "}
              <strong>cabeça d&apos;água</strong> (cheia repentina nos rios) são realidades que quem não conhece a região
              tende a ignorar.
            </p>
            <p>
              Os condutores de ecoturismo passam por um <strong>curso de 160 horas</strong> que inclui técnicas de
              primeiros socorros, resgate aquático e estágio presencial em cada atrativo. São treinados anualmente pelo
              Corpo de Bombeiros e atuam como salvavidas, com atenção redobrada quando há crianças, idosos ou
              iniciantes no grupo.
            </p>

            <div className="gcv-post-alert">
              <div className="gcv-post-alert-title">⚠️ Riscos reais de ir sem guia</div>
              <ul>
                <li>
                  <strong>Se perder nas trilhas</strong>: muitas sem sinalização adequada, especialmente fora do parque
                  nacional
                </li>
                <li>
                  <strong>Encontro perigoso com animais</strong>: jararaca, cascavel, escorpiões e aranhas são comuns no
                  cerrado
                </li>
                <li>
                  <strong>Acidentes em corredeiras e quedas</strong>: pedras lisas e correnteza traiçoeira sem o
                  conhecimento do terreno
                </li>
                <li>
                  <strong>Cabeça d&apos;água</strong>: enchentes repentinas, especialmente no período de chuvas
                </li>
                <li>
                  <strong>Emergência sem suporte</strong>: sem sinal de celular, sem kit de primeiros socorros e sem saber
                  o que fazer
                </li>
                <li>
                  <strong>Risco ampliado para crianças e idosos</strong>: sem apoio especializado em terreno irregular e
                  percursos longos
                </li>
                <li>
                  <strong>Correntezas ocultas e armadilhas invisíveis</strong>: alguns dos pontos mais bonitos da
                  Chapada escondem correntes subaquâneas traiçoeiras que não se percebem olhando para a superfície.
                </li>
              </ul>
            </div>

            <h2>
              <span className="ico" aria-hidden>
                📸
              </span>{" "}
              Fotos que viram memórias para a vida toda
            </h2>

            <p>
              Cada atrativo da Chapada tem ângulos privilegiados que só quem conhece o local de cor sabe encontrar. O
              guia leva o grupo exatamente até esses pontos, e ainda registra os momentos com o olhar de quem já
              fotografou centenas de grupos naquele mesmo cenário.
            </p>
            <p>
              Sem guia, você fotografa o que enxerga. Com guia, você fotografa o que a Chapada realmente tem para
              mostrar.{" "}
              <strong>As fotos que você vai guardar para sempre são as que o guia torna possíveis.</strong>
            </p>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.fotoTuristaTrianguloCouros}
                alt={ALT_TURISTA_TRIANGULO_COUROS}
                width={1200}
                height={1200}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{CAPTION_TURISTA_TRIANGULO_COUROS}</figcaption>
            </figure>

            <h2>
              <span className="ico" aria-hidden>
                🌿
              </span>{" "}
              Aproveitamento de 100%: nenhum atrativo desperdiçado
            </h2>

            <p>
              Cada atrativo esconde lugares que não aparecem em nenhum mapa turístico comum: piscinas naturais
              escondidas, trilhas secundárias com pontos de vista inacreditáveis, horários certos para evitar multidões.{" "}
              <strong>O guia conhece todos esses segredos</strong> porque os vivencia diariamente.
            </p>

            <div className="gcv-post-highlight">
              <div className="lbl">Sabia disso?</div>
              <p>
                Grupos sem guia visitam em média apenas 40% dos pontos mais bonitos de cada atrativo. Com um condutor
                experiente, o aproveitamento chega a 100%, incluindo mirantes secretos, poços de banho e atalhos que a
                maioria dos turistas nunca descobre.
              </p>
            </div>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.foto4}
                alt={ALT_FOTO4}
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{CAPTION_FOTO4}</figcaption>
            </figure>

            <h2>
              <span className="ico" aria-hidden>
                👨‍👩‍👧‍👦
              </span>{" "}
              Atenção especial para famílias, crianças e idosos
            </h2>

            <p>
              Trilhar com crianças pequenas ou com pessoas da terceira idade exige planejamento diferente: ritmo adaptado,
              paradas estratégicas, atenção constante ao nível de esforço e, principalmente, um olho sempre atento
              perto da água.
            </p>
            <p>
              <strong>O guia adapta o roteiro para cada perfil de grupo.</strong> Para famílias com crianças,
              priorizamos trilhas mais curtas com recompensas incríveis ao final. Para grupos de terceira idade,
              escolhemos percursos com sombra, boa estrutura e paradas confortáveis. Ninguém fica para trás.
            </p>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.foto5}
                alt={ALT_FOTO5}
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{CAPTION_FOTO5}</figcaption>
            </figure>

            <div className="gcv-post-img-strip">
              <figure className="gcv-post-figure">
                <img
                  src={IMGS.trioA}
                  alt={ALT_TRIO_A}
                  width={900}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{CAPTION_TRIO_A}</figcaption>
              </figure>
              <figure className="gcv-post-figure">
                <img
                  src={IMGS.trioB}
                  alt={ALT_TRIO_B}
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{CAPTION_TRIO_B}</figcaption>
              </figure>
              <figure className="gcv-post-figure">
                <img
                  src={IMGS.trioC}
                  alt={ALT_TRIO_C}
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{CAPTION_TRIO_C}</figcaption>
              </figure>
            </div>

            <h2>
              <span className="ico" aria-hidden>
                🤝
              </span>{" "}
              Novas amizades e experiências compartilhadas
            </h2>

            <p>
              Passeios em grupos compartilhados são uma das experiências mais ricas que a Chapada pode oferecer. Você
              chega como desconhecido e volta para casa com novos amigos, pessoas de diferentes cidades, histórias e
              perspectivas que se unem pela mesma paixão pela natureza.
            </p>
            <p>
              O guia é também o facilitador dessas conexões. Conhece cada membro do grupo pelo nome, cria um ambiente de
              confiança e transforma estranhos em companheiros de aventura.{" "}
              <strong>Muitas das amizades feitas nas trilhas duram para a vida toda.</strong>
            </p>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.foto6}
                alt={ALT_FOTO6}
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{CAPTION_FOTO6}</figcaption>
            </figure>

            <h2>
              <span className="ico" aria-hidden>
                📚
              </span>{" "}
              Conhecimento local: história, biodiversidade e cultura
            </h2>

            <p>
              A formação do condutor de ecoturismo vai muito além do percurso físico. O guia conhece a história da
              região, a biodiversidade do cerrado, as lendas locais, inclusive aquelas sobre OVNIs avistados na
              Chapada, e as características geológicas únicas das rochas com mais de um bilhão de anos.
            </p>
            <p>
              Cada parada se transforma numa aula viva. Você aprende a identificar plantas medicinais do cerrado, entende
              por que a água das cachoeiras tem essa cor única e descobre por que a NASA considera esta região{" "}
              <strong>o lugar mais iluminado do mundo</strong>.
            </p>

            <h2>
              <span className="ico" aria-hidden>
                ❤️
              </span>{" "}
              O lado humano que faz toda a diferença
            </h2>

            <p>
              Conduzir grupos pela Chapada dos Veadeiros não é apenas um trabalho. É uma vocação. Cada passeio carrega
              uma história. Cada turista chega com uma expectativa e o guia tem o compromisso de superá-la.
            </p>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.foto7}
                alt={ALT_FOTO7}
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{CAPTION_FOTO7}</figcaption>
            </figure>

            <p>
              Em um dia especial, Diego levou o filho para conhecer o trabalho do pai. Os turistas adoraram. Essa
              espontaneidade, essa humanidade, é exatamente o que diferencia um guia local credenciado de qualquer
              aplicativo de navegação ou roteiro impresso.
            </p>

            <h2>
              <span className="ico" aria-hidden>
                ✅
              </span>{" "}
              Resumo: tudo o que você ganha com um guia
            </h2>

            <div className="gcv-post-benefit-grid">
              {[
                {
                  ico: "🛡️",
                  titulo: "Segurança total",
                  texto: "Primeiros socorros, resgate aquático e prevenção de acidentes em trilhas.",
                },
                {
                  ico: "📸",
                  titulo: "Fotos incríveis",
                  texto: "Ângulos privilegiados e registros que você não conseguiria sozinho.",
                },
                {
                  ico: "🌿",
                  titulo: "100% de aproveitamento",
                  texto: "Pontos secretos, mirantes exclusivos e nenhum atrativo desperdiçado.",
                },
                {
                  ico: "🧭",
                  titulo: "Nunca se perder",
                  texto: "Trilhas sem sinalização têm muitos caminhos errados. O guia conhece cada desvio.",
                },
                {
                  ico: "📚",
                  titulo: "Conhecimento vivo",
                  texto: "História, geologia, biodiversidade e cultura contadas por quem nasceu aqui.",
                },
                {
                  ico: "👨‍👩‍👧",
                  titulo: "Foco em família",
                  texto: "Ritmo adaptado, rotas seguras e atenção especial para crianças e idosos.",
                },
                {
                  ico: "🤝",
                  titulo: "Novas amizades",
                  texto: "Grupos compartilhados reúnem pessoas incríveis com a mesma paixão pela natureza.",
                },
                {
                  ico: "⚡",
                  titulo: "Eficiência máxima",
                  texto: "Sem perda de tempo, sem caminhos errados, sem decepções. Só o melhor.",
                },
              ].map((b) => (
                <div key={b.titulo} className="gcv-post-benefit-card">
                  <span className="ico" aria-hidden>
                    {b.ico}
                  </span>
                  <h4>{b.titulo}</h4>
                  <p>{b.texto}</p>
                </div>
              ))}
            </div>

            <h2>
              <span className="ico" aria-hidden>
                ⚖️
              </span>{" "}
              É obrigatório contratar um guia na Chapada?
            </h2>

            <p>
              Em alguns atrativos, sim. O Parque Nacional da Chapada dos Veadeiros exige guia para trilhas noturnas e
              para visitantes que chegam após as 13h, horário limite de entrada, a partir do qual há risco real de
              retorno fora do encerramento do parque. Proprietários de atrativos particulares também costumam exigir a
              presença de um condutor credenciado para garantir a segurança de seus visitantes.
            </p>
            <p>
              Nos demais atrativos, mesmo onde não é obrigatório, o guia é essencial. Alguns inclusive oferecem
              desconto na entrada para grupos acompanhados de guia local. Um fato permanece em qualquer caso: guia é
              sinônimo de segurança, e segurança não tem preço.
            </p>

            <div className="gcv-post-cta">
              <h3>Pronto para viver a Chapada do jeito certo?</h3>
              <p>
                Fale agora com a Guia Chapada Veadeiros e planeje seu passeio com segurança, aproveitamento máximo e fotos que você
                vai guardar para sempre.
              </p>
              <a href={WHATSAPP} className="gcv-post-cta-btn" target="_blank" rel="noopener noreferrer">
                💬 Falar no WhatsApp
              </a>
            </div>

            <ArticleAuthorCard>
              <p>
                Brasileiro, pai, nascido no Rio de Janeiro, cidadão italiano por descendência, analista de sistemas pela
                PUC-RIO, <strong>Diego Navi</strong> trocou o escritório pelo cerrado e fundou a Guia Chapada Veadeiros em 2017. Fluente
                em inglês e espanhol, conduziu centenas de grupos com segurança pela Chapada dos Veadeiros em todas as
                épocas do ano e conhece cada cachoeira, cada trilha e cada cantinho deste portal da Terra desde 2009.
              </p>
            </ArticleAuthorCard>

            <ArticleShareBar pageUrl={canonicalUrl} shareTitle={SHARE_TITLE} placement="footer" />
          </div>
        </div>
      </div>
    </>
  );
}
