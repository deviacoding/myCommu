import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getAllPosts, getPost } from "@/lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      publishedTime: post.date,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  const others = getAllPosts().filter((p) => p.slug !== slug).slice(0, 3);
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link href="/blog" className="text-sm font-medium text-muted hover:text-gold">
        ← Tous les articles
      </Link>
      <p className="mt-6 text-xs text-muted">
        {formatDate(post.date)} · {post.readingMinutes} min de lecture
      </p>
      <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
      <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
      {post.tags.length ? (
        <p className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-bg-soft px-2.5 py-0.5 text-xs text-muted">
              {t}
            </span>
          ))}
        </p>
      ) : null}
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" className="mt-8 max-h-96 w-full rounded-2xl border border-line object-cover object-top" />
      ) : null}
      <div className="prose-mc mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />

      {others.length ? (
        <aside className="mt-16 border-t border-line pt-8">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted">À lire aussi</h2>
          <ul className="mt-4 space-y-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/blog/${o.slug}`} className="font-medium hover:text-gold">
                  {o.title}
                </Link>
                <span className="ml-2 text-xs text-muted">{formatDate(o.date)}</span>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
