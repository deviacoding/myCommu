import Link from "next/link";
import { APP_URL } from "@/lib/site";
import { Logo } from "./Logo";

const nav = [
  { href: "/#responsable", label: "Fonctions" },
  { href: "/#dons", label: "Dons" },
  { href: "/#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/apprendre", label: "Apprendre" },
];

export function Header() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-semibold text-ink">
          <Logo className="h-8 w-8" />
          myCommu
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="transition hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/apprendre" className="text-sm font-medium text-muted md:hidden">
            Apprendre
          </Link>
          <a
            href={APP_URL}
            className="rounded-full bg-night px-4 py-2 text-sm font-semibold text-on-night shadow-sm transition hover:bg-night-soft"
          >
            Ouvrir l&apos;app
          </a>
        </div>
      </div>
    </header>
  );
}
