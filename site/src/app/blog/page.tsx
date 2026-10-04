import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Nouveautés et coulisses de myCommu : horaires automatiques, associations et reçus fiscaux, accès d'équipe, lancement.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog myCommu", description: "Nouveautés et coulisses de myCommu.", url: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Blog</p>
      <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Nouveautés et coulisses</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Ce que nous construisons pour les communautés, pourquoi, et comment l&apos;utiliser.
      </p>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {posts.map((p, i) => (
          <li key={p.slug} className={i === 0 ? "md:col-span-2" : ""}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block h-full overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow)] transition hover:border-gold"
            >
              {p.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover} alt="" className={`w-full object-cover object-top ${i === 0 ? "h-72" : "h-48"}`} loading="lazy" />
              ) : (
                <div className={`bg-[linear-gradient(135deg,var(--night),var(--night-soft))] ${i === 0 ? "h-40" : "h-24"}`} />
              )}
              <div className="p-6">
                <p className="text-xs text-muted">
                  {formatDate(p.date)} · {p.readingMinutes} min de lecture
                </p>
                <h2 className={`mt-2 font-semibold leading-snug transition group-hover:text-gold ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}>
                  {p.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.excerpt}</p>
                {p.tags.length ? (
                  <p className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full bg-bg-soft px-2.5 py-0.5 text-xs text-muted">
                        {t}
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
