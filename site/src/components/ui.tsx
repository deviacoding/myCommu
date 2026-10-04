import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "default",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
  tone?: "default" | "soft" | "night";
}) {
  const bg = tone === "soft" ? "bg-bg-soft" : tone === "night" ? "bg-night text-on-night" : "";
  return (
    <section id={id} className={`scroll-mt-20 ${bg}`}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${tone === "night" ? "text-gold-soft" : "text-gold"}`}>
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
          {intro ? <p className={`mt-4 text-lg leading-relaxed ${tone === "night" ? "text-on-night/80" : "text-muted"}`}>{intro}</p> : null}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function Card({ title, children, icon }: { title: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow)]">
      {icon ? <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-faint text-gold">{icon}</div> : null}
      <h3 className="font-sans text-lg font-semibold">{title}</h3>
      <div className="mt-2 text-[15px] leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "gold";
  external?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "bg-night text-on-night hover:bg-night-soft"
      : variant === "gold"
        ? "bg-gold text-white hover:brightness-110"
        : "border border-line bg-surface text-ink hover:border-gold";
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${cls}`}
    >
      {children}
    </a>
  );
}
