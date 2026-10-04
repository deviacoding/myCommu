import Link from "next/link";
import { APP_URL, CONTACT_EMAIL } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="no-print mt-24 border-t border-line bg-bg-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 font-display text-xl font-semibold">
            <Logo className="h-8 w-8" />
            myCommu
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Une application pour relier une communauté religieuse et ses fidèles : synagogue, mosquée, église ou
            temple. Données hébergées en Europe, dons versés directement à votre association.
          </p>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted">Découvrir</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/#responsable" className="hover:text-gold">Pour le responsable</Link></li>
            <li><Link href="/#fideles" className="hover:text-gold">Pour les fidèles</Link></li>
            <li><Link href="/#dons" className="hover:text-gold">Dons et reçus fiscaux</Link></li>
            <li><Link href="/#faq" className="hover:text-gold">Questions fréquentes</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted">Ressources</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/blog" className="hover:text-gold">Blog</Link></li>
            <li><Link href="/apprendre" className="hover:text-gold">Apprendre (guides pas à pas)</Link></li>
            <li><a href={APP_URL} className="hover:text-gold">L&apos;application</a></li>
            <li><a href={`${APP_URL}`} className="hover:text-gold">Essayer la démo</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted">Contact</h3>
          <p className="mt-3 text-sm text-muted">Une question, une communauté à inscrire ?</p>
          <p className="mt-1 select-all text-sm font-semibold text-ink">{CONTACT_EMAIL}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted sm:px-6">
          <span>© {new Date().getFullYear()} myCommu. Judaïsme, islam, christianisme, bouddhisme : une même application, respectueuse de chacun.</span>
          <span>Français · English · עברית · العربية</span>
        </div>
      </div>
    </footer>
  );
}
