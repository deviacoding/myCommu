import type { Metadata } from "next";
import Link from "next/link";
import { getGuide, guides } from "../../../../../content/guides";
import { PrintButton } from "@/components/PrintButton";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apprendre/[slug]/imprimer">): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug)!;
  return {
    title: `${g.title} — version imprimable`,
    description: g.intro,
    alternates: { canonical: `/apprendre/${slug}/imprimer` },
    robots: { index: false },
  };
}

export default async function PrintGuide({ params }: PageProps<"/apprendre/[slug]/imprimer">) {
  const { slug } = await params;
  const g = getGuide(slug)!;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 print:max-w-none print:px-0 print:py-0">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <div className="text-sm text-muted">
          <Link href={`/apprendre/${g.slug}`} className="font-medium text-ink hover:text-gold">
            ← Retour au diaporama
          </Link>
          <span className="mx-2">·</span>
          Une étape par page à l&apos;impression.
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <a href={`/pdf/${g.slug}.pdf`} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-gold">
            PDF
          </a>
        </div>
      </div>

      <header className="print-step">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">myCommu · guide {g.audience.toLowerCase()}</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight">{g.title}</h1>
        <p className="mt-4 text-lg text-muted">{g.intro}</p>
        <ol className="mt-8 list-decimal space-y-1 pl-6 text-[15px]">
          {g.steps.map((s) => (
            <li key={s.title}>{s.title}</li>
          ))}
        </ol>
        <p className="mt-8 text-xs text-muted">
          {SITE_URL}/apprendre/{g.slug} · {g.steps.length} étapes
        </p>
      </header>

      {g.steps.map((s, i) => (
        <article key={s.title} className="print-step mt-12 grid gap-6 border-t border-line pt-10 print:mt-0 print:grid-cols-[1fr_200px] print:border-0 print:pt-0 sm:grid-cols-[1fr_220px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Étape {i + 1} / {g.steps.length}
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-snug">{s.title}</h2>
            <p className="mt-3 text-[16px] leading-relaxed">{s.text}</p>
            {s.tip ? (
              <p className="mt-4 rounded-xl border border-gold/40 bg-gold-faint px-4 py-3 text-[15px] leading-relaxed print:border print:bg-transparent">
                <span className="font-semibold text-gold">Conseil · </span>
                {s.tip}
              </p>
            ) : null}
          </div>
          {s.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.image} alt={`Capture d'écran : ${s.title}`} className="w-full rounded-2xl border border-line object-cover object-top" />
          ) : null}
        </article>
      ))}
    </div>
  );
}
