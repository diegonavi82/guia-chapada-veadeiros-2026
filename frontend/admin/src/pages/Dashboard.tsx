import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { adminDelete, adminGet, adminPut } from "../services/api";

type SectionKey = "dashboard" | "posts" | "pages" | "products" | "media" | "redirects";

type DashboardStats = {
  posts: number;
  pages: number;
  products: number;
  media: number;
  redirects: number;
};

type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type ContentItem = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  description?: string;
  shortDescription?: string | null;
  price?: string | number | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  seoFocusKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  seoRobots?: string | null;
  status: PublishStatus;
  updatedAt?: string;
};

type MediaItem = {
  id: number;
  title?: string | null;
  url: string;
  mimeType: string;
  createdAt: string;
};

type RedirectItem = {
  id: number;
  oldUrl: string;
  newUrl: string;
  statusCode: number;
};

const menuItems: Array<{ key: SectionKey; title: string; description: string }> = [
  { key: "dashboard", title: "Dashboard", description: "Resumo geral do conteúdo" },
  { key: "posts", title: "Artigos", description: "Revista Chapada · matérias, capa & SEO obrigatório ao publicar" },
  { key: "pages", title: "Páginas", description: "URLs preservadas e editor SEO" },
  { key: "products", title: "Passeios", description: "Produtos migrados do WooCommerce" },
  { key: "media", title: "Mídia", description: "Uploads e imagens no R2" },
  { key: "redirects", title: "Redirects", description: "301 para preservar indexação" },
];

const editableSections = {
  posts: { endpoint: "/posts", label: "Artigos", bodyField: "content", excerptField: "excerpt" },
  pages: { endpoint: "/pages", label: "Páginas", bodyField: "content", excerptField: "excerpt" },
  products: {
    endpoint: "/products",
    label: "Passeios",
    bodyField: "description",
    excerptField: "shortDescription",
  },
} as const;

function formatDate(value?: string) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getReadableStatus(status: PublishStatus) {
  return {
    DRAFT: "Rascunho",
    PUBLISHED: "Publicado",
    ARCHIVED: "Arquivado",
  }[status];
}

function buildSeoAnalysis(item: ContentItem, section: SectionKey, fallbackFocusKeyword: string) {
  const rawContent = section === "products" ? (item.description ?? "") : (item.content ?? "");
  const excerpt = section === "products" ? (item.shortDescription ?? "") : (item.excerpt ?? "");
  const textContent = stripHtml(rawContent);
  const words = textContent ? textContent.split(/\s+/).length : 0;

  const focusSource =
    section === "posts" ? (item.seoFocusKeyword ?? "").trim() || fallbackFocusKeyword.trim() : fallbackFocusKeyword.trim();

  const keyword = normalize(focusSource);
  const title = item.seoTitle || item.title;
  const description = item.seoDescription || excerpt || "";
  const normalizedTitle = normalize(title);
  const normalizedDescription = normalize(description);
  const normalizedSlug = normalize(item.slug.replace(/-/g, " "));
  const normalizedContent = normalize(textContent);
  const keywordCount = keyword
    ? normalizedContent.split(keyword).length - 1
    : 0;

  const checks = [
    {
      label: "Título SEO",
      ok: title.length >= 35 && title.length <= 65,
      hint: `${title.length}/65 caracteres. Ideal entre 35 e 65.`,
    },
    {
      label: "Meta description",
      ok: description.length >= 120 && description.length <= 160,
      hint: `${description.length}/160 caracteres. Ideal entre 120 e 160.`,
    },
    {
      label: "Slug amigável",
      ok: item.slug.length > 0 && item.slug.length <= 80 && !/[A-Z_\s]/.test(item.slug),
      hint: "Use letras minúsculas, hífens e até 80 caracteres.",
    },
    {
      label: "Tamanho do conteúdo",
      ok: words >= 300,
      hint: `${words} palavras. Recomenda-se pelo menos 300.`,
    },
    {
      label: "Frase-chave no título",
      ok: keyword ? normalizedTitle.includes(keyword) : false,
      hint: keyword ? "A frase-chave deve aparecer no título SEO." : "Informe uma frase-chave foco.",
    },
    {
      label: "Frase-chave na descrição",
      ok: keyword ? normalizedDescription.includes(keyword) : false,
      hint: keyword ? "A frase-chave deve aparecer na meta description." : "Informe uma frase-chave foco.",
    },
    {
      label: "Frase-chave no slug",
      ok: keyword ? normalizedSlug.includes(keyword) : false,
      hint: keyword ? "A frase-chave deve aparecer no slug." : "Informe uma frase-chave foco.",
    },
    {
      label: "Densidade da frase-chave",
      ok: keyword ? keywordCount >= 2 : false,
      hint: keyword ? `${keywordCount} ocorrências no conteúdo.` : "Informe uma frase-chave foco.",
    },
    {
      label: "Subtítulos",
      ok: /<h2|<h3|^#{2,3}\s/im.test(rawContent),
      hint: "Use H2/H3 para dividir o conteúdo.",
    },
    {
      label: "Imagens com ALT",
      ok: !/<img\b/i.test(rawContent) || /<img\b[^>]*\balt=["'][^"']+["']/i.test(rawContent),
      hint: "Imagens devem ter texto alternativo.",
    },
  ];

  const passed = checks.filter((check) => check.ok).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    checks,
    description,
    keywordCount,
    passed,
    score,
    title,
    words,
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams();
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [redirects, setRedirects] = useState<RedirectItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [draft, setDraft] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [selectedPostIds, setSelectedPostIds] = useState<Set<number>>(() => new Set());

  const token = useMemo(() => localStorage.getItem("admin_token"), []);
  const isPostRoute = location.pathname === "/posts" || location.pathname.startsWith("/posts/");
  const isPostDetailRoute = Boolean(isPostRoute && postId);
  const activeEditableConfig =
    activeSection === "posts" || activeSection === "pages" || activeSection === "products"
      ? editableSections[activeSection]
      : null;
  const seoAnalysis = draft && activeEditableConfig
    ? buildSeoAnalysis(draft, activeSection, focusKeyword)
    : null;
  const itemStatusCounts = useMemo(
    () => ({
      all: items.length,
      drafts: items.filter((item) => item.status === "DRAFT").length,
      published: items.filter((item) => item.status === "PUBLISHED").length,
    }),
    [items],
  );
  const areAllPostsSelected = items.length > 0 && items.every((item) => selectedPostIds.has(item.id));
  const selectedPostCount = selectedPostIds.size;

  function togglePostSelection(itemId: number, isSelected: boolean) {
    setSelectedPostIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (isSelected) {
        nextIds.add(itemId);
      } else {
        nextIds.delete(itemId);
      }

      return nextIds;
    });
  }

  function toggleAllPostSelections(isSelected: boolean) {
    setSelectedPostIds(isSelected ? new Set(items.map((item) => item.id)) : new Set());
  }

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  useEffect(() => {
    if (isPostRoute) {
      setActiveSection("posts");
    } else if (location.pathname === "/" && activeSection === "posts") {
      setActiveSection("dashboard");
    }
  }, [activeSection, isPostRoute, location.pathname]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;
    const authToken = token;

    async function loadSection() {
      setIsLoading(true);
      setError("");
      setMessage("");

      try {
        if (activeSection === "dashboard") {
          const data = await adminGet<DashboardStats>("/dashboard", authToken);
          if (!ignore) {
            setStats(data);
          }
          return;
        }

        if (activeEditableConfig) {
          if (activeSection === "posts" && postId) {
            const data = await adminGet<ContentItem>(`${activeEditableConfig.endpoint}/${postId}`, authToken);
            if (!ignore) {
              setItems([]);
              setSelectedItem(data);
              setDraft(data);
              setFocusKeyword(data.seoFocusKeyword?.trim() || data.title.split(" ").slice(0, 4).join(" "));
            }
            return;
          }

          const data = await adminGet<ContentItem[]>(activeEditableConfig.endpoint, authToken);
          if (!ignore) {
            setItems(data);
            if (activeSection === "posts") {
              setSelectedItem(null);
              setDraft(null);
              setFocusKeyword("");
            } else {
              setSelectedItem(data[0] ?? null);
              setDraft(data[0] ?? null);
              setFocusKeyword(data[0]?.title.split(" ").slice(0, 4).join(" ") ?? "");
            }
          }
          return;
        }

        if (activeSection === "media") {
          const data = await adminGet<MediaItem[]>("/media", authToken);
          if (!ignore) {
            setMedia(data);
          }
          return;
        }

        const data = await adminGet<RedirectItem[]>("/redirects", authToken);
        if (!ignore) {
          setRedirects(data);
        }
      } catch {
        if (!ignore) {
          setError("Não consegui carregar esta área. Faça login novamente se a sessão expirou.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSection();

    return () => {
      ignore = true;
    };
  }, [activeEditableConfig, activeSection, postId, token]);

  function selectSection(section: SectionKey) {
    if (section === "posts") {
      navigate("/posts");
    } else {
      navigate("/");
    }

    setActiveSection(section);
    setSelectedItem(null);
    setDraft(null);
    setItems([]);
    setMedia([]);
    setRedirects([]);
  }

  function selectItem(item: ContentItem) {
    if (activeSection === "posts") {
      navigate(`/posts/${item.id}`);
      return;
    }

    setSelectedItem(item);
    setDraft(item);
    setFocusKeyword(item.title.split(" ").slice(0, 4).join(" "));
    setMessage("");
    setError("");
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();

    if (!token || !draft || !activeEditableConfig) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    let body:
      | {
          title: string;
          slug: string;
          shortDescription?: string | null;
          description?: string;
          price?: string | null;
          seoTitle?: string | null;
          seoDescription?: string | null;
          status: PublishStatus;
        }
      | {
          title: string;
          slug: string;
          excerpt: string | null | undefined;
          content: string;
          seoTitle?: string | null;
          seoDescription?: string | null;
          status: PublishStatus;
          featuredImage?: string | null;
          featuredImageAlt?: string | null;
          seoKeywords?: string | null;
          seoFocusKeyword?: string | null;
          ogTitle?: string | null;
          ogDescription?: string | null;
          seoRobots?: string | null;
        };

    if (activeSection === "products") {
      body = {
        title: draft.title,
        slug: draft.slug,
        shortDescription: draft.shortDescription ?? "",
        description: draft.description ?? "",
        price: draft.price ? String(draft.price) : null,
        seoTitle: draft.seoTitle ?? "",
        seoDescription: draft.seoDescription ?? "",
        status: draft.status,
      };
    } else if (activeSection === "posts") {
      body = {
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt ?? "",
        content: draft.content ?? "",
        featuredImage: draft.featuredImage ?? null,
        featuredImageAlt: draft.featuredImageAlt ?? null,
        seoTitle: draft.seoTitle ?? "",
        seoDescription: draft.seoDescription ?? "",
        seoKeywords: draft.seoKeywords ?? "",
        seoFocusKeyword: draft.seoFocusKeyword ?? "",
        ogTitle: draft.ogTitle ?? "",
        ogDescription: draft.ogDescription ?? "",
        seoRobots: draft.seoRobots ?? "",
        status: draft.status,
      };
    } else {
      body = {
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt ?? "",
        content: draft.content ?? "",
        seoTitle: draft.seoTitle ?? "",
        seoDescription: draft.seoDescription ?? "",
        status: draft.status,
      };
    }
    try {
      const saved = await adminPut<ContentItem>(
        `${activeEditableConfig.endpoint}/${draft.id}`,
        token,
        body,
      );
      setItems((currentItems) => currentItems.map((item) => (item.id === saved.id ? saved : item)));
      setSelectedItem(saved);
      setDraft(saved);
      setMessage("Alterações salvas com sucesso.");
    } catch (unknownErr: unknown) {
      const err = unknownErr as Error & {
        status?: number;
        details?: { issues?: unknown; error?: string };
      };
      const rawIssues = err.details?.issues;
      const issues =
        Array.isArray(rawIssues) && rawIssues.every((entry) => typeof entry === "string")
          ? (rawIssues as string[])
          : null;
      setError(
        issues && issues.length > 0
          ? issues.join(" · ")
          : "Não consegui salvar. Confira os campos obrigatórios e tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSelectedPosts() {
    if (!token || selectedPostIds.size === 0) {
      return;
    }

    const ids = Array.from(selectedPostIds);
    const confirmed = window.confirm(
      `Excluir ${ids.length} artigo(s) selecionado(s)? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");
    setMessage("");

    try {
      const result = await adminDelete<{ deleted: number }>("/posts/bulk", token, { ids });

      setItems((currentItems) => currentItems.filter((item) => !selectedPostIds.has(item.id)));
      setSelectedPostIds(new Set());
      setMessage(`${result.deleted} artigo(s) excluído(s) com sucesso.`);
    } catch {
      setError("Não consegui excluir os artigos selecionados. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-[#f0f0f1] text-[#1d2327]">
      <div className="sticky top-0 z-50 flex h-8 items-center justify-between bg-[#1d2327] px-3 text-xs text-white">
        <div className="flex items-center gap-4">
          <strong>Guia Chapada Veadeiros</strong>
          <span className="hidden text-white/70 md:inline">+ Novo</span>
          <span className="hidden text-white/70 md:inline">SEO</span>
          <span className="hidden text-white/70 md:inline">Analytics</span>
        </div>
        <button className="text-white/80 hover:text-white" type="button" onClick={logout}>
          Olá, Diego Marques · Sair
        </button>
      </div>

      <div className="grid min-h-[calc(100vh-2rem)] lg:grid-cols-[180px_1fr]">
        <aside className="bg-[#1d2327] text-[#c3c4c7]">
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#72aee6]">Admin</p>
            <h1 className="mt-1 text-lg font-semibold text-white">Painel</h1>
          </div>

          <nav className="py-2">
            {menuItems.map((item) => {
              const isActive = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition ${
                    isActive
                      ? "bg-[#2271b1] text-white"
                      : "hover:bg-[#2c3338] hover:text-white"
                  }`}
                  type="button"
                  onClick={() => selectSection(item.key)}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 p-4 lg:p-6">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-normal text-[#1d2327]">
                {activeSection === "posts" && isPostDetailRoute
                  ? "Editar artigo"
                  : activeEditableConfig
                    ? activeEditableConfig.label
                    : "Painel"}
              </h2>
              <p className="mt-1 text-sm text-[#646970]">
                {activeSection === "posts" && !isPostDetailRoute
                  ? "Dashboard com todos os artigos, como a listagem do WordPress."
                  : "Administração migrada do WordPress com edição de conteúdo e validação SEO."}
              </p>
            </div>
            {activeSection === "posts" && isPostDetailRoute ? (
              <Link
                className="rounded-sm border border-[#2271b1] bg-white px-3 py-1.5 text-sm font-medium text-[#2271b1] hover:bg-[#f6f7f7]"
                to="/posts"
              >
                Voltar para artigos
              </Link>
            ) : activeEditableConfig ? (
              <button
                className="rounded-sm border border-[#2271b1] bg-white px-3 py-1.5 text-sm font-medium text-[#2271b1] hover:bg-[#f6f7f7]"
                type="button"
              >
                Adicionar novo
              </button>
            ) : null}
          </header>

          {error ? (
            <div className="mb-4 border-l-4 border-[#d63638] bg-white p-3 text-sm text-[#1d2327] shadow-sm">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mb-4 border-l-4 border-[#00a32a] bg-white p-3 text-sm text-[#1d2327] shadow-sm">
              {message}
            </div>
          ) : null}

          {isLoading ? (
            <div className="border border-[#c3c4c7] bg-white p-4 text-sm text-[#646970] shadow-sm">
              Carregando dados...
            </div>
          ) : null}

          {!isLoading && activeSection === "dashboard" && stats ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                ["Artigos", stats.posts],
                ["Páginas", stats.pages],
                ["Passeios", stats.products],
                ["Mídia", stats.media],
                ["Redirects", stats.redirects],
              ].map(([title, total]) => (
                <article key={title} className="border border-[#c3c4c7] bg-white p-5 shadow-sm">
                  <p className="text-sm text-[#646970]">{title}</p>
                  <strong className="mt-2 block text-3xl font-normal text-[#1d2327]">{total}</strong>
                </article>
              ))}
            </section>
          ) : null}

          {!isLoading && activeSection === "posts" && !isPostDetailRoute ? (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#646970]">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Todos ({itemStatusCounts.all})</span>
                  <span>|</span>
                  <span>Publicados ({itemStatusCounts.published})</span>
                  <span>|</span>
                  <span>Rascunhos ({itemStatusCounts.drafts})</span>
                </div>

                <button
                  className="rounded-sm border border-[#b32d2e] bg-white px-3 py-1.5 text-sm font-medium text-[#b32d2e] disabled:cursor-not-allowed disabled:border-[#dcdcde] disabled:text-[#a7aaad] enabled:hover:bg-[#fcf0f1]"
                  disabled={selectedPostCount === 0 || isDeleting}
                  type="button"
                  onClick={handleDeleteSelectedPosts}
                >
                  {isDeleting ? "Excluindo..." : `Excluir selecionados (${selectedPostCount})`}
                </button>
              </div>

              <div className="overflow-hidden border border-[#c3c4c7] bg-white shadow-sm">
                <div className="grid grid-cols-[32px_minmax(220px,1fr)_160px_140px_96px] gap-3 border-b border-[#c3c4c7] bg-[#f6f7f7] px-3 py-2 text-xs font-semibold text-[#2c3338]">
                  <span>
                    <input
                      aria-label="Selecionar todos os artigos"
                      checked={areAllPostsSelected}
                      className="h-4 w-4 rounded-sm border border-[#8c8f94]"
                      disabled={items.length === 0}
                      type="checkbox"
                      onChange={(event) => toggleAllPostSelections(event.target.checked)}
                    />
                  </span>
                  <span>Título</span>
                  <span>Autor</span>
                  <span>Status</span>
                  <span>Data</span>
                </div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid w-full cursor-pointer grid-cols-[32px_minmax(220px,1fr)_160px_140px_96px] gap-3 border-b border-[#dcdcde] px-3 py-3 text-left text-sm transition hover:bg-[#f6f7f7]"
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/posts/${item.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/posts/${item.id}`);
                      }
                    }}
                  >
                    <span>
                      <input
                        aria-label={`Selecionar artigo ${item.title || "sem título"}`}
                        checked={selectedPostIds.has(item.id)}
                        className="h-4 w-4 rounded-sm border border-[#8c8f94]"
                        type="checkbox"
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => togglePostSelection(item.id, event.target.checked)}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-[#2271b1]">{item.title || "(sem título)"}</span>
                      <span className="mt-1 block truncate text-xs text-[#646970]">/{item.slug}</span>
                      <span className="mt-2 block text-xs text-[#2271b1]">Editar</span>
                    </span>
                    <span className="text-[#50575e]">Diego Marques</span>
                    <span className="text-[#50575e]">{getReadableStatus(item.status)}</span>
                    <span className="text-xs text-[#646970]">{formatDate(item.updatedAt)}</span>
                  </div>
                ))}
                {items.length === 0 ? <p className="p-4 text-sm text-[#646970]">Nenhum artigo encontrado.</p> : null}
              </div>
            </section>
          ) : null}

          {!isLoading && activeEditableConfig && (activeSection !== "posts" || isPostDetailRoute) ? (
            <section className={`grid gap-4 ${activeSection === "posts" ? "" : "xl:grid-cols-[320px_minmax(0,1fr)]"}`}>
              {activeSection !== "posts" ? (
              <div className="border border-[#c3c4c7] bg-white shadow-sm">
                <div className="border-b border-[#dcdcde] px-3 py-2">
                  <h3 className="font-semibold">{activeEditableConfig.label}</h3>
                  <p className="mt-1 text-xs text-[#646970]">Todos · Publicados · Rascunhos</p>
                </div>
                <div className="max-h-[calc(100vh-11rem)] overflow-auto">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full border-b border-[#dcdcde] p-3 text-left text-sm transition ${
                        selectedItem?.id === item.id
                          ? "bg-[#f0f6fc]"
                          : "hover:bg-[#f6f7f7]"
                      }`}
                      type="button"
                      onClick={() => selectItem(item)}
                    >
                      <span className="block font-semibold text-[#2271b1]">{item.title}</span>
                      <span className="mt-1 block truncate text-xs text-[#646970]">/{item.slug}</span>
                      <span className="mt-2 inline-flex text-xs text-[#646970]">
                        {getReadableStatus(item.status)} · {formatDate(item.updatedAt)}
                      </span>
                    </button>
                  ))}
                  {items.length === 0 ? <p className="p-3 text-sm text-[#646970]">Nenhum item encontrado.</p> : null}
                </div>
              </div>
              ) : null}

              {draft ? (
                <form onSubmit={handleSave} className="min-w-0">
                  <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="min-w-0 space-y-4">
                      <input
                        className="w-full border border-[#8c8f94] bg-white px-3 py-2 text-2xl text-[#1d2327] shadow-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                        placeholder="Adicionar título"
                        value={draft.title}
                        onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                      />

                      <div className="rounded-sm border border-[#c3c4c7] bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#dcdcde] px-3 py-2">
                          <strong>Editor clássico</strong>
                          <div className="flex gap-1 text-xs">
                            <span className="border border-[#c3c4c7] bg-[#f6f7f7] px-2 py-1">Visual</span>
                            <span className="border border-[#c3c4c7] bg-white px-2 py-1">Código</span>
                          </div>
                        </div>
                        <div className="border-b border-[#dcdcde] bg-[#f6f7f7] px-3 py-2 text-xs text-[#50575e]">
                          Parágrafo · B · I · listas · link · mídia
                        </div>
                        <textarea
                          className="min-h-[460px] w-full resize-y border-0 bg-white p-4 font-mono text-sm leading-6 text-[#1d2327] outline-none"
                          value={activeSection === "products" ? (draft.description ?? "") : (draft.content ?? "")}
                          onChange={(event) =>
                            setDraft(
                              activeSection === "products"
                                ? { ...draft, description: event.target.value }
                                : { ...draft, content: event.target.value },
                            )
                          }
                        />
                      </div>

                      <div className="rounded-sm border border-[#c3c4c7] bg-white shadow-sm">
                        <div className="border-b border-[#dcdcde] px-3 py-2">
                          <strong>Resumo</strong>
                        </div>
                        <textarea
                          className="min-h-24 w-full border-0 p-3 text-sm outline-none"
                          value={
                            activeSection === "products" ? (draft.shortDescription ?? "") : (draft.excerpt ?? "")
                          }
                          onChange={(event) =>
                            setDraft(
                              activeSection === "products"
                                ? { ...draft, shortDescription: event.target.value }
                                : { ...draft, excerpt: event.target.value },
                            )
                          }
                        />
                      </div>

                      {activeSection === "posts" ? (
                        <div className="rounded-sm border border-[#c3c4c7] bg-white shadow-sm">
                          <div className="border-b border-[#dcdcde] px-3 py-2">
                            <strong>Imagem destacada · Revista</strong>
                          </div>
                          <div className="space-y-3 p-3 text-sm">
                            <label className="block font-medium">
                              URL da foto de capa
                              <textarea
                                className="mt-1 min-h-[4.5rem] w-full border border-[#8c8f94] px-3 py-2 font-mono text-xs outline-none"
                                placeholder="/imagens/arquivo.jpg ou URL completa pública…"
                                value={draft.featuredImage ?? ""}
                                onChange={(event) =>
                                  setDraft({
                                    ...draft,
                                    featuredImage: event.target.value || null,
                                  })
                                }
                              />
                            </label>
                            <label className="block font-medium">
                              Texto ALT da capa <span className="text-[#646970]">(obrigatório ao publicar)</span>
                              <textarea
                                className="mt-1 min-h-[4rem] w-full border border-[#8c8f94] px-3 py-2 text-sm outline-none"
                                placeholder="Descrição acessível e rica para o Google Imagens."
                                value={draft.featuredImageAlt ?? ""}
                                onChange={(event) =>
                                  setDraft({
                                    ...draft,
                                    featuredImageAlt: event.target.value || null,
                                  })
                                }
                              />
                            </label>
                          </div>
                        </div>
                      ) : null}

                      {seoAnalysis ? (
                        <div className="rounded-sm border border-[#c3c4c7] bg-white shadow-sm">
                          <div className="flex items-center justify-between border-b border-[#dcdcde] px-3 py-2">
                            <strong>Yoast SEO</strong>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                                seoAnalysis.score >= 75
                                  ? "bg-[#00a32a]"
                                  : seoAnalysis.score >= 50
                                    ? "bg-[#dba617]"
                                    : "bg-[#d63638]"
                              }`}
                            >
                              {seoAnalysis.score}%
                            </span>
                          </div>
                          <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
                            <div className="space-y-3">
                              <label className="block text-sm font-medium">
                                Frase-chave foco
                                <input
                                  className="mt-1 w-full border border-[#8c8f94] px-3 py-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                  value={activeSection === "posts" ? (draft.seoFocusKeyword ?? "") : focusKeyword}
                                  onChange={(event) =>
                                    activeSection === "posts"
                                      ? setDraft({
                                          ...draft,
                                          seoFocusKeyword: event.target.value,
                                        })
                                      : setFocusKeyword(event.target.value)
                                  }
                                />
                              </label>
                              <label className="block text-sm font-medium">
                                Título SEO
                                <input
                                  className="mt-1 w-full border border-[#8c8f94] px-3 py-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                  value={draft.seoTitle ?? ""}
                                  onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })}
                                />
                              </label>
                              <label className="block text-sm font-medium">
                                Meta description
                                <textarea
                                  className="mt-1 min-h-20 w-full border border-[#8c8f94] px-3 py-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                  value={draft.seoDescription ?? ""}
                                  onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })}
                                />
                              </label>
                              {activeSection === "posts" ? (
                                <div className="space-y-3 border-t border-[#eef0f1] pt-3">
                                  <label className="block text-sm font-medium">
                                    Palavras-chave auxiliares <span className="text-[#646970]">(meta keywords)</span>
                                    <textarea
                                      className="mt-1 min-h-[4.5rem] w-full border border-[#8c8f94] px-3 py-2 text-xs outline-none"
                                      placeholder="chapada dos veadeiros, cachoeira, alto paraíso..."
                                      value={draft.seoKeywords ?? ""}
                                      onChange={(event) =>
                                        setDraft({
                                          ...draft,
                                          seoKeywords: event.target.value || null,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="block text-sm font-medium">
                                    Open Graph · título
                                    <input
                                      className="mt-1 w-full border border-[#8c8f94] px-3 py-2 text-sm outline-none"
                                      placeholder="Se vazio, usa o Título SEO"
                                      value={draft.ogTitle ?? ""}
                                      onChange={(event) =>
                                        setDraft({
                                          ...draft,
                                          ogTitle: event.target.value || null,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="block text-sm font-medium">
                                    Open Graph · descrição
                                    <textarea
                                      className="mt-1 min-h-16 w-full border border-[#8c8f94] px-3 py-2 text-sm outline-none"
                                      placeholder="Se vazio, usa a meta description"
                                      value={draft.ogDescription ?? ""}
                                      onChange={(event) =>
                                        setDraft({
                                          ...draft,
                                          ogDescription: event.target.value || null,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="block text-sm font-medium">
                                    Indexação · robots
                                    <select
                                      className="mt-1 w-full border border-[#8c8f94] px-2 py-1.5"
                                      value={(draft.seoRobots ?? "index,follow").includes("noindex") ? "ni" : "ix"}
                                      onChange={(event) =>
                                        setDraft({
                                          ...draft,
                                          seoRobots:
                                            event.target.value === "ni" ? "noindex,nofollow" : "index,follow",
                                        })
                                      }
                                    >
                                      <option value="ix">index,follow (padrão Google)</option>
                                      <option value="ni">noindex,nofollow (ocultar buscadores)</option>
                                    </select>
                                  </label>
                                </div>
                              ) : null}
                              <div className="rounded border border-[#dcdcde] bg-[#f6f7f7] p-3">
                                <p className="text-[#1a0dab]">{seoAnalysis.title || draft.title}</p>
                                <p className="text-xs text-[#006621]">
                                  {activeSection === "posts"
                                    ? `/revista/${draft.slug}`
                                    : activeSection === "products"
                                      ? `/passeios/${draft.slug}`
                                      : `/${draft.slug}`}
                                </p>
                                <p className="mt-1 text-sm text-[#545454]">{seoAnalysis.description || "Sem descrição SEO."}</p>
                              </div>
                            </div>
                            <div>
                              <p className="mb-2 text-sm font-semibold">Análise SEO</p>
                              <div className="space-y-2">
                                {seoAnalysis.checks.map((check) => (
                                  <div key={check.label} className="flex gap-2 text-xs">
                                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${check.ok ? "bg-[#00a32a]" : "bg-[#dba617]"}`} />
                                    <span>
                                      <strong className="block text-[#1d2327]">{check.label}</strong>
                                      <span className="text-[#646970]">{check.hint}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <aside className="space-y-4">
                      <div className="rounded-sm border border-[#c3c4c7] bg-white shadow-sm">
                        <div className="border-b border-[#dcdcde] px-3 py-2">
                          <strong>Publicar</strong>
                        </div>
                        <div className="space-y-3 p-3 text-sm">
                          <label className="block">
                            Status
                            <select
                              className="mt-1 w-full border border-[#8c8f94] px-2 py-1.5"
                              value={draft.status}
                              onChange={(event) => setDraft({ ...draft, status: event.target.value as PublishStatus })}
                            >
                              <option value="DRAFT">Rascunho</option>
                              <option value="PUBLISHED">Publicado</option>
                              <option value="ARCHIVED">Arquivado</option>
                            </select>
                          </label>
                          <label className="block">
                            Slug
                            <input
                              className="mt-1 w-full border border-[#8c8f94] px-2 py-1.5"
                              value={draft.slug}
                              onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                            />
                          </label>
                          {activeSection === "products" ? (
                            <label className="block">
                              Preço
                              <input
                                className="mt-1 w-full border border-[#8c8f94] px-2 py-1.5"
                                value={draft.price ?? ""}
                                onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                              />
                            </label>
                          ) : null}
                          <p className="text-xs text-[#646970]">Atualizado em {formatDate(draft.updatedAt)}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-[#dcdcde] bg-[#f6f7f7] p-3">
                          <button className="text-sm text-[#b32d2e]" type="button">Mover para lixeira</button>
                          <button
                            className="rounded-sm bg-[#2271b1] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                            disabled={isSaving}
                            type="submit"
                          >
                            {isSaving ? "Atualizando..." : "Atualizar"}
                          </button>
                        </div>
                      </div>

                      {seoAnalysis ? (
                        <div className="rounded-sm border border-[#c3c4c7] bg-white shadow-sm">
                          <div className="border-b border-[#dcdcde] px-3 py-2">
                            <strong>Legibilidade</strong>
                          </div>
                          <div className="space-y-2 p-3 text-sm text-[#50575e]">
                            <p>{seoAnalysis.words} palavras</p>
                            <p>{Math.max(1, Math.ceil(seoAnalysis.words / 220))} min de leitura</p>
                            <p>{seoAnalysis.passed}/{seoAnalysis.checks.length} verificações aprovadas</p>
                          </div>
                        </div>
                      ) : null}
                    </aside>
                  </div>
                </form>
              ) : (
                <div className="border border-[#c3c4c7] bg-white p-4 text-sm text-[#646970]">
                  Selecione um item na lista para editar.
                </div>
              )}
            </section>
          ) : null}

          {!isLoading && activeSection === "media" ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {media.map((item) => (
                <a
                  key={item.id}
                  className="border border-[#c3c4c7] bg-white p-4 shadow-sm hover:border-[#2271b1]"
                  href={item.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="block font-semibold text-[#2271b1]">{item.title || "Arquivo sem título"}</span>
                  <span className="mt-2 block text-sm text-[#646970]">{item.mimeType}</span>
                  <span className="mt-2 block truncate text-xs text-[#646970]">{item.url}</span>
                </a>
              ))}
              {media.length === 0 ? <p className="text-sm text-[#646970]">Nenhuma mídia encontrada.</p> : null}
            </section>
          ) : null}

          {!isLoading && activeSection === "redirects" ? (
            <section className="overflow-hidden border border-[#c3c4c7] bg-white shadow-sm">
              {redirects.map((item) => (
                <div key={item.id} className="grid gap-3 border-b border-[#dcdcde] p-4 text-sm md:grid-cols-[120px_1fr_1fr]">
                  <strong>{item.statusCode}</strong>
                  <span className="text-[#1d2327]">{item.oldUrl}</span>
                  <span className="text-[#646970]">{item.newUrl}</span>
                </div>
              ))}
              {redirects.length === 0 ? <p className="p-4 text-sm text-[#646970]">Nenhum redirect encontrado.</p> : null}
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
