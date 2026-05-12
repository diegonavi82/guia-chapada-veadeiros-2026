import { Seo } from "../seo/Seo";
import type { ReactNode } from "react";

type StaticPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function StaticPage({ title, description, children }: StaticPageProps) {
  return (
    <article className="mx-auto max-w-5xl px-4 py-16">
      <Seo title={title} description={description} canonical={window.location.pathname} />
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-cerrado-500">
        Guia Chapada
      </p>
      <h1 className="mt-3 text-4xl font-black text-cerrado-900 md:text-6xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg text-slate-700">{description}</p>
      <div className="prose prose-lg mt-10 max-w-none">{children}</div>
    </article>
  );
}
