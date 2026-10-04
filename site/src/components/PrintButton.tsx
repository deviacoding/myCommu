"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-night px-4 py-2 text-sm font-semibold text-on-night transition hover:bg-night-soft"
    >
      Imprimer
    </button>
  );
}
