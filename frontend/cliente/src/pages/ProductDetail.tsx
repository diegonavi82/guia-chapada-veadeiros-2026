import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";
import { rewriteHtmlMediaUrls, toPublicAssetUrl } from "../utils/localMediaUrl";
import { wpUploadsAssets } from "../config/wpUploadsAssets";

type Category = { id: number; name: string; slug: string };

type ProductData = {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  featuredImage?: string | null;
  price?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categories: Category[];
};

function formatPrice(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = Number(value);
  if (Number.isNaN(n)) {
    return null;
  }
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

const whatsappBase = "https://api.whatsapp.com/send?phone=5562982506891&text=";

export function ProductDetail() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }
    setLoading(true);
    setError("");
    apiGet<ProductData>(`/products/${slug}`)
      .then(setProduct)
      .catch(() => setError("Passeio não encontrado ou API indisponível."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-slate-600">Carregando passeio...</main>;
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <Seo title="Passeio não encontrado" description="Este passeio não foi encontrado." robots="noindex,follow" />
        <h1 className="text-4xl font-black text-cerrado-900">Passeio não encontrado</h1>
        <p className="mt-4 text-slate-600">{error}</p>
        <Link className="mt-6 inline-block font-semibold text-[#df8350] underline" to="/atrativos">
          Ver todos os atrativos
        </Link>
      </main>
    );
  }

  const priceLabel = formatPrice(product.price);
  const hero = toPublicAssetUrl(product.featuredImage) ?? product.featuredImage ?? wpUploadsAssets.parqueNacionalSalto;
  const mainHtml = rewriteHtmlMediaUrls(product.description);
  const text = `Olá! Quero informações sobre o passeio "${product.title}"`;
  const wa = `${whatsappBase}${encodeURIComponent(text)}`;

  return (
    <article className="gcv-detail-page bg-[#f4f6fb] px-4 py-8 md:py-10">
      <Seo
        title={product.seoTitle || product.title}
        description={product.seoDescription || product.shortDescription || `Passeio ${product.title}`}
        canonical={`/passeios/${product.slug}`}
        ogImage={toPublicAssetUrl(product.featuredImage) ?? product.featuredImage ?? undefined}
      />
      <div className="mx-auto max-w-[1180px]">
        <p className="mb-6 text-sm">
          <Link className="font-semibold text-[#df8350] transition hover:text-cerrado-700" to="/atrativos">
            ← Todos os atrativos
          </Link>
        </p>
        <header className="gcv-detail-title">
          <h1>{product.title}</h1>
        </header>

        <section className="gcv-detail-layout">
          <aside className="gcv-detail-sidebar">
            <img src={hero} alt={product.title} className="gcv-detail-main-image" loading="eager" />
            {priceLabel ? (
              <div className="gcv-detail-info mt-4">
                <p className="gcv-detail-info-heading">Valor</p>
                <p className="text-lg font-bold text-slate-900">{priceLabel}</p>
                <p className="mt-4 text-xs text-slate-600">
                  Consulte disponibilidade e condições — valores podem variar.
                </p>
              </div>
            ) : null}
            {product.categories.length > 0 ? (
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-cerrado-700">
                {product.categories.map((c) => c.name).join(" · ")}
              </p>
            ) : null}
            <a
              className="mt-6 inline-flex w-full justify-center rounded-full bg-[#25D366] px-5 py-3.5 text-xs font-extrabold uppercase tracking-[0.1em] text-white shadow-lg transition hover:brightness-95"
              href={wa}
              rel="noreferrer"
              target="_blank"
            >
              Falar no WhatsApp
            </a>
          </aside>
          <div className="gcv-detail-content">
            {product.shortDescription ? (
              <p className="gcv-detail-excerpt mb-8">{product.shortDescription.replace(/<[^>]+>/g, "")}</p>
            ) : null}
            <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
          </div>
        </section>
      </div>
    </article>
  );
}
