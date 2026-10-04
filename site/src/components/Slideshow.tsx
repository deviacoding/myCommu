"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuideStep } from "../../content/guides/types";

export function Slideshow({ steps, title }: { steps: GuideStep[]; title: string }) {
  const [i, setI] = useState(0);
  const n = steps.length;
  const go = useCallback((d: number) => setI((v) => Math.min(n - 1, Math.max(0, v + d))), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, n]);

  const s = steps[i];
  return (
    <section
      aria-roledescription="diaporama"
      aria-label={title}
      className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow)]"
    >
      {/* Indicateur d'étape */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-3">
        <span className="text-sm font-semibold">
          Étape {i + 1} <span className="font-normal text-muted">/ {n}</span>
        </span>
        <div className="flex flex-1 gap-1" aria-hidden>
          {steps.map((_, k) => (
            <button
              key={k}
              type="button"
              onClick={() => setI(k)}
              className={`h-1.5 flex-1 rounded-full transition ${k <= i ? "bg-gold" : "bg-line"}`}
              title={`Étape ${k + 1}`}
            />
          ))}
        </div>
        <span className="hidden text-xs text-muted sm:inline">← → au clavier</span>
      </div>

      <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[1fr_minmax(220px,300px)] md:items-start">
        <div key={i} className="animate-[fade_.3s_ease]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Étape {i + 1}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug sm:text-3xl">{s.title}</h2>
          <p className="mt-4 text-[17px] leading-relaxed">{s.text}</p>
          {s.tip ? (
            <p className="mt-5 rounded-xl border border-gold/40 bg-gold-faint px-4 py-3 text-[15px] leading-relaxed">
              <span className="font-semibold text-gold">Conseil · </span>
              {s.tip}
            </p>
          ) : null}
        </div>
        <div className="mx-auto w-full max-w-[280px]">
          {s.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.image}
              src={s.image}
              alt={`Capture d'écran : ${s.title}`}
              className="w-full rounded-[1.6rem] border-[5px] border-night bg-white object-cover object-top shadow-[var(--shadow)]"
            />
          ) : (
            <div className="flex aspect-[430/880] items-center justify-center rounded-[1.6rem] border border-dashed border-line text-sm text-muted">
              Pas de capture pour cette étape
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line bg-bg-soft px-5 py-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={i === 0}
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Précédent
        </button>
        <span className="text-xs text-muted">
          {i + 1} / {n}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={i === n - 1}
          className="rounded-full bg-night px-4 py-2 text-sm font-semibold text-on-night transition hover:bg-night-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
      <style>{`@keyframes fade { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }`}</style>
    </section>
  );
}
