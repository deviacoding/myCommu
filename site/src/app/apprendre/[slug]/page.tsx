import type { Metadata } from "next";
import Link from "next/link";
import { getGuide, guides } from "../../../../content/guides";
import { Slideshow } from "@/components/Slideshow";
import { Icon } from "@/components/icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apprendre/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug)!;
  const cover = g.steps.find((s) => s.image)?.image;
  return {
    title: `${g.title} — guide pas à pas`,
    description: g.intro,
    alternates: { canonical: `/apprendre/${slug}` },
    openGraph: { title: g.title, description: g.intro, url: `/apprendre/${slug}`, images: cover ? [{ url: cover }] : undefined },
  };
}

export default async function GuidePage({ params }: PageProps<"/apprendre/[slug]">) {
  const { slug } = await params;
  const g = getGuide(slug)!;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/apprendre" className="text-sm font-medium text-muted hover:text-gold">
            ← Tous les guides
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold">{g.audience}</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{g.title}</h1>
          <p className="mt-3 max-w-2xl text-muted">{g.intro}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/apprendre/${g.slug}/imprimer`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:border-gold"
          >
            <Icon.Print width={16} height={16} /> Version imprimable
          </Link>
          <a
            href={`/pdf/${g.slug}.pdf`}
            className="inline-flex items-center gap-2 rounded-full bg-night px-4 py-2 text-sm font-semibold text-on-night transition hover:bg-night-soft"
          >
            <Icon.Download width={16} height={16} /> Télécharger le PDF
          </a>
        </div>
      </div>

      <div className="mt-8">
        <Slideshow steps={g.steps} title={g.title} />
      </div>
    </div>
  );
}
