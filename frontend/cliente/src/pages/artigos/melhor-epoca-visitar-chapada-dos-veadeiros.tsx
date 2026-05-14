import { Helmet } from "react-helmet-async";
import { LangLink } from "../../i18n/LangLink";
import { ArticleAuthorCard } from "../../components/revista/ArticleAuthorCard";
import { ArticleShareBar } from "../../components/revista/ArticleShareBar";
import { wpUploadsAssets } from "../../config/wpUploadsAssets";
import { Seo } from "../../seo/Seo";
import { formatPublicationDatePt } from "../../utils/formatPublicationDatePt";
import "../../styles/gcv-post.css";

const ARTICLE_PUBLISHED_ISO = "2026-05-13T12:00:00-03:00";
const SITE_ORIGIN =
  (typeof import.meta.env.VITE_SITE_ORIGIN === "string" && import.meta.env.VITE_SITE_ORIGIN.replace(/\/$/, "")) ||
  "https://www.guiachapadaveadeiros.com";

const REVISTA_ARTICLE_PATH = "/revista/melhor-epoca-visitar-chapada-dos-veadeiros";

const BASE = "/uploads/artigos/melhor-epoca";
const IMGS = {
  hero: `${BASE}/guia-diego-navi-palipalan-via-lactea-chapada-veadeiros.png`,
  f2: `${BASE}/poco-sol-cachoeira-loquinhas-chapada-veadeiros-periodo-chuva.jpg`,
  f3: `${BASE}/palipalan-chuveirinho-cerrado-chapada-veadeiros-floracao.jpg`,
  f4: `${BASE}/cachoeira-cordovil-poco-esmeralda-chapada-veadeiros-seca.jpg`,
  f5: `${BASE}/cachoeira-segredo-sao-jorge-chapada-veadeiros-seca-cristalina.jpg`,
  f6: `${BASE}/cachoeira-segredo-sao-jorge-chapada-veadeiros-chuva-vazao-maxima.jpg`,
  f7: `${BASE}/cachoeira-santa-barbara-cavalcante-chapada-veadeiros.jpg`,
  f8: `${BASE}/cachoeira-segredo-poco-verde-esmeralda-sao-jorge-chapada.jpg`,
};

const WA =
  "https://api.whatsapp.com/send?phone=5562982506891&text=Quero%20planejar%20minha%20visita%20%C3%A0%20Chapada%20dos%20Veadeiros";

const MESES = [
  {
    mes: "Janeiro",
    ico: "🌧️",
    badge: "rain",
    badgeLabel: "Chuva",
    stars: 4,
    texto: "Calor intenso, chuvas diárias. Rios no volume máximo. Vegetação exuberante.",
  },
  {
    mes: "Fevereiro",
    ico: "🌧️",
    badge: "rain",
    badgeLabel: "Chuva",
    stars: 3,
    texto:
      "Chuvas torrentiais mais frequentes. Invernadas possíveis assim como veranicos. Clima imprevisível.",
  },
  {
    mes: "Março",
    ico: "🌦️",
    badge: "rain",
    badgeLabel: "Chuva",
    stars: 4,
    texto:
      "Parecido com Fevereiro. Rios ainda cheios. Início do fim da estação úmida. Temperatura mais amena.",
  },
  {
    mes: "Abril",
    ico: "🌤️",
    badge: "transition",
    badgeLabel: "Transição",
    stars: 5,
    texto: "Rios cheios, chuveirinhos surgindo, pôr do sol com arco íris alaranjados.",
  },
  {
    mes: "Maio",
    ico: "⭐",
    badge: "best",
    badgeLabel: "Melhor mês",
    stars: 5,
    texto: "Volume ideal, água não tão fria, chuveirinhos, céu estrelado, baixa temporada.",
  },
  {
    mes: "Junho",
    ico: "☀️",
    badge: "dry",
    badgeLabel: "Seca",
    stars: 5,
    texto: "Inverno seco, noites frias, sol constante, clima estável.",
  },
  {
    mes: "Julho",
    ico: "🎉",
    badge: "high",
    badgeLabel: "Alta temp.",
    stars: 4,
    texto: "Festas, eventos culturais, Encontro de Culturas. Mesmo clima de junho.",
  },
  {
    mes: "Agosto",
    ico: "🔥",
    badge: "intense-dry",
    badgeLabel: "Seca intensa",
    stars: 4,
    texto:
      "Piscinas cristalinas e temperatura da água amena. Calor extremo e poeira; atenção para queimadas e cachoeiras sazonais secas.",
  },
  {
    mes: "Setembro",
    ico: "🔥",
    badge: "intense-dry",
    badgeLabel: "Seca intensa",
    stars: 4,
    texto:
      "Similar a agosto: piscinas cristalinas e temperatura da água amena; algumas cachoeiras sazonais sem água.",
  },
  {
    mes: "Outubro",
    ico: "🌦️",
    badge: "transition",
    badgeLabel: "Transição",
    stars: 4,
    texto: "Início das chuvas. Rios voltam a encher. Vegetação renascendo.",
  },
  {
    mes: "Novembro",
    ico: "🌧️",
    badge: "rain",
    badgeLabel: "Chuva",
    stars: 3,
    texto: "Chuvas torrencias setorizadas, vazão aumentando progressivamente.",
  },
  {
    mes: "Dezembro",
    ico: "🌧️",
    badge: "rain",
    badgeLabel: "Chuva",
    stars: 4,
    texto: "Verão úmido. Fluxo turístico aumenta. Paisagem exuberante.",
  },
];

const FAQS = [
  {
    q: "Posso visitar a Chapada dos Veadeiros em qualquer época do ano?",
    a: "Sim. O melhor dia para conhecer a Chapada é aquele em que você pode vir. Cada período tem suas belezas e particularidades. Um guia local experiente adapta o roteiro para aproveitar 100% da época em que você está visitando.",
  },
  {
    q: "Posso visitar no verão (dezembro/janeiro)?",
    a: "Sim! O verão úmido tem charme único: verde exuberante, cachoeiras poderosas e clima agradável. Redobre a atenção com chuvas e seja criterioso ao contratar um guia credenciado para atrativos com acesso a rios.",
  },
  {
    q: "Qual a temperatura da água das cachoeiras na seca?",
    a: "No período de seca, especialmente em junho e julho, a água pode estar bem fria, entre 16°C e 20°C em alguns pontos. Em agosto e setembro tende a esquentar um pouco com o calor intenso do dia.",
  },
  {
    q: "Quais cachoeiras podem estar secas em agosto e setembro?",
    a: "A Cachoeira Cordovil (Poço Esmeralda) é um exemplo que pode secar nesse período. Por isso é essencial consultar um guia local antes de montar o roteiro. Ele saberá o estado atual de cada atrativo.",
  },
  {
    q: "Quando florescem os chuveirinhos do cerrado?",
    a: "O Paepalanthus speciosus (chuveirinho) floresce entre abril e julho, com pico em maio. É uma das experiências mais únicas e fotogênicas da Chapada dos Veadeiros.",
  },
  {
    q: "Preciso de carro 4x4 no período de chuvas?",
    a: "Para alguns atrativos fora das estradas principais, sim. Uma alternativa é contratar o translado com o guia, que já inclui veículo adequado para as condições da estrada na época.",
  },
];

const SEO_TITLE = "Melhor época para visitar a Chapada dos Veadeiros: guia mês a mês";
const SEO_DESCRIPTION =
  "Descubra a melhor época para visitar a Chapada dos Veadeiros: período de chuvas x seca, melhores meses, floração do cerrado (chuveirinhos), temperatura da água, cachoeiras sazonais e dicas de segurança.";
const KEYWORDS =
  "melhor época para visitar chapada dos veadeiros, melhor mês chapada dos veadeiros, quando visitar chapada dos veadeiros, período de chuvas chapada veadeiros, período de seca chapada veadeiros, clima chapada dos veadeiros, quando ir chapada veadeiros, chapada veadeiros qual época do ano, chuveirinho cerrado chapada, palipalan chapada veadeiros, floração cerrado chapada, temperatura água chapada veadeiros, cachoeiras sazonais chapada veadeiros, invernada chapada veadeiros";

const SHARE_TITLE =
  "Melhor época para visitar a Chapada dos Veadeiros: guia completo mês a mês";

const canonicalUrl = `${SITE_ORIGIN}${REVISTA_ARTICLE_PATH}`;
const heroAbsolute = `${SITE_ORIGIN}${IMGS.hero}`;

const articleImagesAbsolute = Object.values(IMGS).map((path) => `${SITE_ORIGIN}${path}`);

const jsonLdArticle = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Melhor época para visitar a Chapada dos Veadeiros: guia completo mês a mês",
  description: SEO_DESCRIPTION,
  image: articleImagesAbsolute,
  author: {
    "@type": "Person",
    name: "Diego Navi",
    jobTitle: "Analista de sistemas e condutor de ecoturismo credenciado (Cadastur)",
    image: `${SITE_ORIGIN}${wpUploadsAssets.articleAuthorDiegoPortrait}`,
  },
  publisher: {
    "@type": "Organization",
    name: "Guia Chapada Veadeiros",
    logo: {
      "@type": "ImageObject",
      url: "https://www.guiachapadaveadeiros.com/wp-content/uploads/2024/05/Logo-Guia-Chapada-Veadeiros-2024.jpg",
    },
  },
  datePublished: "2026-05-13",
  dateModified: "2026-05-13",
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  keywords: [
    "melhor época chapada dos veadeiros",
    "quando visitar chapada dos veadeiros",
    "período de chuvas seca chapada",
    "chuveirinho cerrado chapada",
    "palipalan chapada veadeiros",
  ],
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ArtigoMelhorEpoca() {
  return (
    <>
      <Seo
        title={SEO_TITLE}
        description={SEO_DESCRIPTION}
        canonical={REVISTA_ARTICLE_PATH}
        keywords={KEYWORDS}
        ogImage={heroAbsolute}
        ogTitle="Melhor época para visitar a Chapada dos Veadeiros: guia mês a mês"
        ogDescription="Período de chuvas ou seca? Chuveirinhos, temperatura da água e cachoeiras sazonais para planejar sua visita perfeita à Chapada dos Veadeiros."
        robots="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        type="article"
        breadcrumbs={[
          { name: "Início", url: "/" },
          { name: "Revista", url: "/revista" },
          { name: SEO_TITLE, url: REVISTA_ARTICLE_PATH },
        ]}
        jsonLd={jsonLdArticle}
      />

      <Helmet>
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="800" />
        <meta
          property="og:image:alt"
          content="Guia Diego Navi entre chuveirinhos do cerrado sob a Via Láctea na Chapada dos Veadeiros"
        />
        <meta property="article:author" content="Diego Navi" />
        <meta property="article:published_time" content="2026-05-13T00:00:00-03:00" />
        <meta property="article:modified_time" content="2026-05-13T00:00:00-03:00" />
        <meta property="article:section" content="Dicas" />
        <meta property="article:tag" content="melhor época chapada dos veadeiros" />
        <meta property="article:tag" content="quando visitar chapada veadeiros" />
        <meta property="article:tag" content="período de chuvas seca chapada" />
        <script type="application/ld+json">{JSON.stringify(jsonLdFaq)}</script>
      </Helmet>

      <div className="gcv-post-page">
        <div className="gcv-post-shell">
          <nav className="gcv-post-breadcrumb" aria-label="Caminho de navegação">
            <LangLink to="/">Home</LangLink>
            <span className="sep">›</span>
            <LangLink to="/revista">Revista</LangLink>
            <span className="sep">›</span>
            <LangLink to="/revista">Dicas</LangLink>
            <span className="sep">›</span>
            <span>Melhor Época para Visitar a Chapada</span>
          </nav>

          <header className="gcv-post-hero">
            <img
              src={IMGS.hero}
              alt="Diego Navi em trilha noturna entre chuveirinhos do cerrado (Paepalanthus) e a Via Láctea na Chapada dos Veadeiros, foto de Márcio Cabral"
              width={1200}
              height={800}
              fetchPriority="high"
              decoding="async"
            />
            <div className="gcv-post-hero-overlay">
              <LangLink to="/revista" className="gcv-post-category">
                Planejamento de Viagem
              </LangLink>
              <h1>Melhor época para visitar a Chapada dos Veadeiros: guia completo mês a mês</h1>
            </div>
          </header>

          <div className="gcv-post-meta">
            <span className="autor">Diego Navi</span>
            <span className="dot">·</span>
            <time dateTime="2026-05-13">{formatPublicationDatePt(ARTICLE_PUBLISHED_ISO)}</time>
            <span className="dot">·</span>
            <span>10 min de leitura</span>
            <span className="dot">·</span>
            <span className="tag">Melhor Época</span>
            <span className="tag">Planejamento</span>
            <span className="tag">Clima</span>
          </div>

          <ArticleShareBar pageUrl={canonicalUrl} shareTitle={SHARE_TITLE} placement="afterHero" />

          <p className="gcv-post-lead">
            Essa é a pergunta que mais recebo antes de cada viagem: <strong>“Qual a melhor época para conhecer a Chapada dos Veadeiros?”</strong> A resposta honesta é que cada período tem sua própria
            magia; mas sim, existem meses que se destacam. Aqui você vai entender as diferenças entre o período de chuvas e o de seca, o que acontece em cada mês do ano, e qual a melhor época para o{" "}
            <em>seu</em> perfil de viagem.
          </p>

          <div className="gcv-post-body">
            <h2>
              <span className="ico">🌍</span> O cerrado tem duas estações: chuva e seca
            </h2>

            <p>
              Diferente de outros biomas, o cerrado da Chapada dos Veadeiros não segue as quatro estações do calendário convencional. Aqui o que define tudo são{" "}
              <strong>dois grandes períodos: o das chuvas e o da seca</strong>, com dois meses de transição em cada extremo que pertencem aos dois mundos ao mesmo tempo.
            </p>

            <div className="gcv-post-period-grid">
              <div className="gcv-post-period-card gcv-post-period-card--rain">
                <span className="card-ico">🌧️</span>
                <strong>Período de Chuvas de outubro a abril</strong>
                <p>Vegetação exuberante, rios cheios, clima ameno, verde intenso. Cachoeiras no auge da sua força e beleza.</p>
              </div>
              <div className="gcv-post-period-card gcv-post-period-card--dry">
                <span className="card-ico">☀️</span>
                <strong>Período de Seca de abril a outubro</strong>
                <p>Clima árido, noites frias, dias quentes, piscinas cristalinas. Céu limpo e perfeito para observação de estrelas.</p>
              </div>
            </div>

            <p>
              <strong>Abril e outubro são os meses de transição</strong> e são frequentemente os mais surpreendentes para os visitantes, pois reúnem características dos dois períodos simultaneamente.
            </p>

            <h2>
              <span className="ico">🌧️</span> Período de chuvas: outubro a abril
            </h2>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.f6}
                alt="Cachoeira do Segredo em São Jorge na Chapada dos Veadeiros durante o período de chuvas, com vazão máxima e água branca descendo pela parede de rocha coberta de vegetação verde"
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                A Cachoeira do Segredo no período de chuvas: força bruta, vazão máxima e verde por todo lado. Um espetáculo completamente
                diferente do período de seca.
              </figcaption>
            </figure>

            <p>
              O período de chuvas transforma a Chapada num paraíso de verde intenso. A vegetação do cerrado desperta com toda a força, os rios atingem sua{" "}
              <strong>capacidade máxima de vazão</strong> e as cachoeiras ganham volume impressionante. A temperatura da água fica mais agradável ao toque e o clima é
              ameno, com sol pela manhã, nuvens ao longo do dia e chuvas ocasionais à tarde.
            </p>

            <div className="gcv-post-highlight">
              <div className="lbl">Como são as chuvas na Chapada?</div>
              <p>
                Ao contrário do que muitos pensam, <strong>não chove o tempo inteiro</strong>. As precipitações costumam ser setorizadas; pode estar chovendo numa
                cachoeira enquanto outra, a poucos quilômetros, está com sol. Chuvas longas e contínuas são menos comuns, mas acontecem. Nos dias de{" "}
                <strong>invernada</strong>, o céu fica com neblina baixa e chuvisco fino, numa atmosfera mística e única que só a Chapada proporciona.
              </p>
            </div>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.f2}
                alt="Turistas no Poço do Sol da Cachoeira Loquinhas na Chapada dos Veadeiros durante o período de chuvas, com água esverdeada entre rochas e mata fechada"
                width={1366}
                height={768}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                Poço do Sol da Cachoeira Loquinhas. Esse acesso só existe no período de chuvas, quando a água está no volume máximo. Um lugar secreto que a maioria
                dos turistas nunca encontra sem guia.
              </figcaption>
            </figure>

            <div className="gcv-post-alert">
              <div className="gcv-post-alert-title">⚠️ Atenção redobrada no período de chuvas</div>
              <ul>
                <li>
                  <strong>Risco de cabeça d&apos;água</strong>: enchentes repentinas nos rios após chuvas na cabeceira. Sempre com guia em atrativos aquáticos.
                </li>
                <li>
                  <strong>Correntezas ocultas e armadilhas invisíveis</strong>: alguns dos pontos mais bonitos da Chapada
                  escondem correntes subaquâneas traiçoeiras que não se percebem olhando para a superfície.
                </li>
                <li>
                  <strong>Pedras molhadas e escorregadias</strong>: risco de queda é maior. Calçado com sola antiderrapante é essencial.
                </li>
                <li>
                  <strong>Atolamento de veículos</strong>: estradas de terra ficam perigosas. Prefira veículos 4x4 ou contrate translado com guia.
                </li>
                <li>
                  <strong>Trilhas com barro e lama</strong>: o guia conhece as condições do dia e adapta o roteiro.
                </li>
              </ul>
            </div>

            <h2>
              <span className="ico">☀️</span> Período de seca: abril a outubro
            </h2>

            <div className="gcv-post-compare-grid">
              <figure className="gcv-post-figure">
                <img
                  src={IMGS.f5}
                  alt="Cachoeira do Segredo em São Jorge na Chapada dos Veadeiros durante a seca, com paredão de rocha exposta e água cristalina no poço"
                  width={768}
                  height={1366}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Cachoeira do Segredo na seca</figcaption>
              </figure>
              <figure className="gcv-post-figure">
                <img
                  src={IMGS.f4}
                  alt="Cachoeira Cordovil na Chapada dos Veadeiros em junho, com água cristalina no poço"
                  width={1366}
                  height={768}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Cachoeira Cordovil em junho</figcaption>
              </figure>
            </div>

            <p>
              O período de seca traz um clima que lembra o de deserto: <strong>muito frio à noite e muito calor durante o dia</strong>. A amplitude térmica pode ser
              grande, com manhãs geladas abaixo de 10°C e tardes escaldantes acima de 35°C. Os ventos frios das serras chegam com o inverno e a vegetação adquire tons
              dourados e terrosos característicos do cerrado seco.
            </p>
            <p>
              Em compensação, as piscinas naturais ficam <strong>mais transparentes e cristalinas</strong>, com visibilidade total no fundo. As trilhas ficam mais firmes. O
              céu, sem nuvens, é perfeito para observação de estrelas. A poeira das estradas de terra é a principal desvantagem; prefira janelas fechadas nos
              translados.
            </p>

            <div className="gcv-post-highlight">
              <div className="lbl">⚠️ Cuidado em agosto e setembro</div>
              <p>
                A seca intensa pode fazer desaparecer completamente algumas cachoeiras sazonais, como a Cachoeira do Abismo.
                Além disso, o risco de <strong>queimadas</strong> é real nesse período. É fundamental consultar um guia local
                para saber quais atrativos estão acessíveis e seguros antes de sair.
              </p>
            </div>

            <h2>
              <span className="ico">🌸</span> A floração após a chuva: o espetáculo dos chuveirinhos
            </h2>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.f3}
                alt="Paepalanthus speciosus, o chuveirinho do cerrado, em floração na Chapada dos Veadeiros, planta típica dos campos rupestres que floresce entre abril e julho"
                width={768}
                height={1366}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                O chuveirinho do cerrado (Paepalanthus) em floração, um dos fenômenos mais belos e únicos da Chapada dos Veadeiros. Acontece entre abril e julho, com
                pico em maio.
              </figcaption>
            </figure>

            <p>
              Uma das experiências mais únicas da Chapada acontece na transição entre a chuva e a seca: a <strong>floração dos chuveirinhos do cerrado</strong>. O{" "}
              <em>Paepalanthus speciosus</em>, popularmente chamado de chuveirinho ou palipalan, transforma os campos rupestres num tapete de flores brancas entre{" "}
              <strong>abril e julho</strong>, com pico em maio.
            </p>
            <p>
              É nesse cenário que{" "}
              <a
                href="https://g1.globo.com/go/goias/noticia/2024/02/07/foto-da-chapada-dos-veadeiros-premiada-internacionalmente-levou-1-ano-para-ser-produzida-diz-fotografo.ghtml"
                target="_blank"
                rel="noopener noreferrer"
              >
                o fotógrafo Márcio Cabral foi premiado pela National Geographic Channel
              </a>
              , registrando uma das suas fotos mais icônicas: chuveirinhos iluminados sob o arco da Via Láctea. Uma imagem que
              resume a magia da Chapada nesse período e que você pode viver também.
            </p>

            <h2>
              <span className="ico">📅</span> Guia completo mês a mês
            </h2>

            <div className="gcv-post-table-responsive">
              <table className="gcv-post-months-table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Período</th>
                    <th>Nota</th>
                    <th>O que esperar</th>
                  </tr>
                </thead>
                <tbody>
                  {MESES.map((m) => (
                    <tr key={m.mes}>
                      <td>
                        {m.ico} {m.mes}
                      </td>
                      <td>
                        <span className={`gcv-post-period-badge gcv-post-period-badge--${m.badge}`}>{m.badgeLabel}</span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{"⭐".repeat(m.stars)}</td>
                      <td>{m.texto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>
              <span className="ico">⭐</span> Maio: o melhor mês para visitar a Chapada dos Veadeiros
            </h2>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.hero}
                alt="Diego Navi em trilha noturna entre chuveirinhos do cerrado e a Via Láctea na Chapada dos Veadeiros em maio, foto de Márcio Cabral"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                Diego Navi numa trilha noturna entre chuveirinhos e a via Láctea. Foto: Márcio Cabral.
              </figcaption>
            </figure>

            <p>
              Se você puder escolher apenas um mês, escolha <strong>maio</strong>. É quando tudo se alinha de forma perfeita:
            </p>

            <div className="gcv-post-benefit-grid">
              {[
                { ico: "💧", titulo: "Água na temperatura ideal", texto: "Rios com volume seguro e temperatura ainda não tão fria quanto no inverno pleno." },
                { ico: "🌸", titulo: "Chuveirinhos em plena floração", texto: "Os campos rupestres cobertos de Paepalanthus: espetáculo único no mundo." },
                { ico: "🌌", titulo: "Céu estrelado perfeito", texto: "Noites sem nuvens. A Via Láctea visível com clareza impressionante." },
                { ico: "🌈", titulo: "Pôr do sol com arco íris", texto: "Umidade residual cria arco íris dourados nas Cataratas dos Couros ao entardecer." },
                { ico: "👥", titulo: "Baixa temporada", texto: "Sem multidões, sem filas, preços acessíveis. Mais atenção do guia ao seu grupo." },
                { ico: "✅", titulo: "100% dos atrativos acessíveis", texto: "Volume ideal: atrativos de chuva E de seca funcionando simultaneamente." },
              ].map((b) => (
                <div key={b.titulo} className="gcv-post-benefit-card">
                  <span className="ico">{b.ico}</span>
                  <h4>{b.titulo}</h4>
                  <p>{b.texto}</p>
                </div>
              ))}
            </div>

            <h2>
              <span className="ico">🌤️</span> Abril e junho: os melhores vice campeões
            </h2>

            <p>
              <strong>Abril</strong> é o mês de transição da chuva para a seca. Os rios ainda estão com alto volume, a temperatura da água é agradável e os chuveirinhos
              começam a surgir. Os pôr do sol com arco íris alaranjados, violetas ou vermelhos são frequentes e deslumbrantes. Baixa temporada, tranquilidade.
            </p>
            <p>
              <strong>Junho</strong> é o inverno seco em sua plenitude: frio intenso à noite, sol constante durante o dia, clima completamente estável. As águas das
              cachoeiras ficam mais geladas, mas absolutamente cristalinas. Ideal para quem prefere trilhas sem calor excessivo e céu sempre limpo.
            </p>

            <h2>
              <span className="ico">🎉</span> Julho: alta temporada, festas e cultura
            </h2>

            <p>
              Julho tem o mesmo clima excepcional de junho, mas com um ingrediente extra: <strong>vida cultural intensa</strong>. O Encontro de Culturas de Alto Paraíso de
              Goiás acontece nesse período, reunindo artesãos, raizeiros, músicos e muita festa. A vila de São Jorge fervilha de energia. Se você quer sentir o
              pulso vivo da Chapada, julho é imperdível; só reserve tudo com bastante antecedência.
            </p>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.f7}
                alt="Poço azul turquesa da Cachoeira Santa Bárbara em Cavalcante na Chapada dos Veadeiros com cachoeira ao fundo"
                width={1366}
                height={768}
                loading="lazy"
                decoding="async"
              />
              <figcaption>Cachoeira Santa Bárbara em Cavalcante, um dos atrativos mais bonitos da Chapada em qualquer época do ano.</figcaption>
            </figure>

            <figure className="gcv-post-figure">
              <img
                src={IMGS.f8}
                alt="Poço verde esmeralda da Cachoeira do Segredo em São Jorge na Chapada dos Veadeiros, com reflexo das árvores na água calma e trilha de areia na margem"
                width={1366}
                height={768}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                O poço espelho da Cachoeira do Segredo tem água calma e reflexo perfeito. Melhor aproveitado em abril e maio, na transição entre chuva e seca.
              </figcaption>
            </figure>

            <h2>
              <span className="ico">💚</span> A verdade que todo guia sabe
            </h2>

            <div className="gcv-post-highlight">
              <div className="lbl">Filosofia do guia local</div>
              <p>
                <strong>O melhor dia para conhecer a Chapada dos Veadeiros é aquele em que você pode vir.</strong> Cada mês tem suas cachoeiras, suas flores, suas
                cores e sua personalidade. Um guia experiente adapta o roteiro para entregar o melhor do período em que você está: seja na força bruta das chuvas ou
                na transparência cristalina da seca.
              </p>
            </div>

            <h2>
              <span className="ico">❓</span> Perguntas frequentes
            </h2>

            {FAQS.map((f, i) => (
              <div key={i} className="gcv-post-faq-item">
                <p className="faq-q">{f.q}</p>
                <p className="faq-a">{f.a}</p>
              </div>
            ))}

            <div className="gcv-post-cta">
              <h3>Pronto para planejar sua visita?</h3>
              <p>
                Conte com a Guia Chapada Veadeiros para montar o roteiro ideal para a época em que você vai, seja na chuva, na seca
                ou na transição. Cada visita é única e você vai aproveitar 100%.
              </p>
              <a href={WA} className="gcv-post-cta-btn" target="_blank" rel="noopener noreferrer">
                💬 Planejar minha visita no WhatsApp
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
