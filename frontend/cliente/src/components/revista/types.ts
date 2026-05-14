export type RevistaTeaserPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
  categories?: { name: string; slug: string }[];
};
