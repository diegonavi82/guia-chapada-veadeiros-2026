import type { RevistaTeaserPost } from "./types";
import { RevistaTeaserCard } from "./RevistaTeaserCard";

/** Layouts diferentes para cada quantidade possível na home (1–8 matérias). */
export function LatestRevistaLayouts({ posts }: { posts: RevistaTeaserPost[] }) {
  const n = posts.length;
  if (n === 0) return null;

  if (n === 1) {
    return (
      <div className="Revista-home-layout Revista-home-layout--1">
        <RevistaTeaserCard post={posts[0]} variant="capa" />
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className="Revista-home-layout Revista-home-layout--2">
        {posts.map((p) => (
          <RevistaTeaserCard key={p.id} post={p} variant="destaque" />
        ))}
      </div>
    );
  }

  if (n === 3) {
    return (
      <div className="Revista-home-layout Revista-home-layout--3">
        <div className="Revista-home-layout__primary">
          <RevistaTeaserCard post={posts[0]} variant="capa" />
        </div>
        <div className="Revista-home-layout__rail">
          <RevistaTeaserCard post={posts[1]} variant="lista" />
          <RevistaTeaserCard post={posts[2]} variant="lista" />
        </div>
      </div>
    );
  }

  if (n === 4) {
    return (
      <div className="Revista-home-layout Revista-home-layout--4">
        {posts.map((p) => (
          <RevistaTeaserCard key={p.id} post={p} variant="lista" />
        ))}
      </div>
    );
  }

  if (n === 5) {
    return (
      <div className="Revista-home-layout Revista-home-layout--5">
        <div className="Revista-home-layout__hero-only">
          <RevistaTeaserCard post={posts[0]} variant="capa" />
        </div>
        <div className="Revista-home-layout__quad">
          {posts.slice(1, 5).map((p) => (
            <RevistaTeaserCard key={p.id} post={p} variant="lista" />
          ))}
        </div>
      </div>
    );
  }

  if (n === 6) {
    return (
      <div className="Revista-home-layout Revista-home-layout--6">
        {posts.map((p) => (
          <RevistaTeaserCard key={p.id} post={p} variant="lista" />
        ))}
      </div>
    );
  }

  if (n === 7) {
    return (
      <div className="Revista-home-layout Revista-home-layout--7">
        <div className="Revista-home-layout__hero-full">
          <RevistaTeaserCard post={posts[0]} variant="capa" />
        </div>
        <div className="Revista-home-layout__triple">
          {posts.slice(1, 4).map((p) => (
            <RevistaTeaserCard key={p.id} post={p} variant="lista" />
          ))}
        </div>
        <div className="Revista-home-layout__triple">
          {posts.slice(4, 7).map((p) => (
            <RevistaTeaserCard key={p.id} post={p} variant="compacto" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="Revista-home-layout Revista-home-layout--8">
      <div className="Revista-home-layout__hero-wide">
        <RevistaTeaserCard post={posts[0]} variant="capa" />
      </div>
      <div className="Revista-home-layout__four-bar">
        {posts.slice(1, 5).map((p) => (
          <RevistaTeaserCard key={p.id} post={p} variant="lista" />
        ))}
      </div>
      <div className="Revista-home-layout__triple-bar">
        {posts.slice(5, 8).map((p) => (
          <RevistaTeaserCard key={p.id} post={p} variant="compacto" />
        ))}
      </div>
    </div>
  );
}
