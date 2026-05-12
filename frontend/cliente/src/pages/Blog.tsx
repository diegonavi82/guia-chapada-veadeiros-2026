import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Seo } from "../seo/Seo";
import { apiGet } from "../services/api";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  seoDescription?: string | null;
};

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<{ items: BlogPost[] }>("/posts")
      .then((data) => setPosts(data.items))
      .catch(() => setError("Nao foi possivel carregar os artigos. Verifique se a API esta rodando."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <Seo
        title="Blog"
        description="Artigos e dicas para viajar pela Chapada dos Veadeiros."
        canonical="/blog"
      />
      <h1 className="text-5xl font-black text-cerrado-900">Blog</h1>
      {isLoading ? <p className="mt-8 text-slate-600">Carregando artigos...</p> : null}
      {error ? <p className="mt-8 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {!isLoading && !error && posts.length === 0 ? (
        <p className="mt-8 text-slate-600">Nenhum artigo migrado ainda.</p>
      ) : null}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              {post.featuredImage ? (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="p-6">
              <p className="text-sm font-bold text-cerrado-500">Artigo</p>
              <h2 className="mt-3 text-2xl font-black text-cerrado-900">{post.title}</h2>
              <p className="mt-3 line-clamp-3 text-slate-600">
                {post.excerpt || post.seoDescription || "Leia o artigo completo."}
              </p>
              </div>
            </Link>
        ))}
      </div>
    </section>
  );
}
