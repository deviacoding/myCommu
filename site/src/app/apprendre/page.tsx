import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "../../../content/guides";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Apprendre — guides pas à pas",
  description: "Guides pas à pas myCommu, en diaporama, imprimables et en PDF : créer son compte et sa communauté, créer un accès trésorier, rejoindre sa communauté, publier les horaires sans rien taper.",
  alternates: { canonical: "/apprendre" },
  openGraph: { title: "Apprendre myCommu", description: "Guides pas à pas, en diaporama, imprimables et en PDF.", url: "/apprendre" },
};

const audienceColor: Record<string, string> = {
  Responsable: "bg-night text-on-night",
  Fidèle: "bg-gold text-white",
  Équipe: "bg-gold-faint text-gold",
};

export default function Apprendre() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Apprendre</p>
      <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Guides pas à pas</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Une étape par écran, avec la capture d&apos;écran correspondante. Chaque guide existe aussi en version imprimable et en PDF, à
        donner à ceux qui préfèrent le papier.
      </p>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {guides.map((g) => (
          <li key={g.slug} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow)]">
            <Link href={`/apprendre/${g.slug}`} className="group flex gap-5 p-6">
              {g.steps.find((s) => s.image)?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.steps.find((s) => s.image)!.image}
                  alt=""
                  className="hidden h-44 w-24 shrink-0 rounded-xl border border-line object-cover object-top sm:block"
                  loading="lazy"
                />
              ) : null}
              <div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${audienceColor[g.audience]}`}>{g.audience}</span>
                <h2 className="mt-3 text-2xl font-semibold leading-snug transition group-hover:text-gold">{g.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{g.intro}</p>
                <p className="mt-3 text-xs text-muted">
                  {g.steps.length} étapes{g.duration ? ` · ${g.duration}` : ""}
                </p>
              </div>
            </Link>
            <div className="mt-auto flex flex-wrap gap-2 border-t border-line bg-bg-soft px-6 py-3 text-sm">
              <Link href={`/apprendre/${g.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-gold">
                <Icon.Arrow width={16} height={16} /> Diaporama
              </Link>
              <Link href={`/apprendre/${g.slug}/imprimer`} className="inline-flex items-center gap-1.5 text-muted hover:text-gold">
                <Icon.Print width={16} height={16} /> Version imprimable
              </Link>
              <a href={`/pdf/${g.slug}.pdf`} className="inline-flex items-center gap-1.5 text-muted hover:text-gold">
                <Icon.Download width={16} height={16} /> PDF
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
