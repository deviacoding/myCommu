import type { Metadata } from "next";
import Link from "next/link";
import { APP_URL } from "@/lib/site";
import { ButtonLink, Card, Pill, Section } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Faq } from "@/components/Faq";
import { PhoneFrame } from "@/components/PhoneFrame";

export const metadata: Metadata = {
  title: "myCommu — L'application qui relie une communauté religieuse et ses fidèles",
  description:
    "Synagogue, mosquée, église, temple : horaires, enseignements, questions, dons avec reçu fiscal (Cerfa, Seif 46), agenda, live, équipe et un niveau qui grandit avec l'assiduité et les dons. Multilingue, données en Europe, dons versés directement à l'association.",
  alternates: { canonical: "/" },
  openGraph: { title: "myCommu", description: "L'application qui relie une communauté religieuse et ses fidèles.", url: "/" },
};

const confessions = [
  { name: "Judaïsme", place: "Synagogue", leader: "Rav", teaching: "Dvar Torah", color: "#1e3a8a" },
  { name: "Islam", place: "Mosquée", leader: "Imam", teaching: "Khutba", color: "#0f766e" },
  { name: "Christianisme", place: "Église", leader: "Père, pasteur", teaching: "Homélie", color: "#7c2d12" },
  { name: "Bouddhisme", place: "Temple", leader: "Vénérable, enseignant", teaching: "Enseignement du Dharma", color: "#b45309" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_80%_0%,var(--gold-faint),transparent_70%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:pb-24 md:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              <Icon.Sparkle width={14} height={14} className="text-gold" />
              Judaïsme · Islam · Christianisme · Bouddhisme
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
              Votre communauté, <span className="text-gold">à portée de main.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              myCommu relie une synagogue, une mosquée, une église ou un temple à ses fidèles : horaires, enseignements,
              questions au responsable, dons avec reçu fiscal, agenda, live. Le responsable publie, l&apos;équipe l&apos;épaule,
              les fidèles suivent.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={APP_URL} external>
                Essayer la démo <Icon.Arrow width={18} height={18} />
              </ButtonLink>
              <ButtonLink href={APP_URL} variant="secondary" external>
                Créer ma communauté
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">
              La démo s&apos;ouvre sans compte, avec des données fictives. Guide pas à pas :{" "}
              <Link href="/apprendre/creer-mon-compte-et-ma-communaute" className="font-medium text-gold underline underline-offset-4">
                créer mon compte et ma communauté
              </Link>
              .
            </p>
          </div>
          <div className="relative mx-auto flex w-full max-w-sm justify-center md:max-w-none">
            <PhoneFrame src="/guides/fidele-06-onglets.jpg" alt="Onglet Horaires de l'application myCommu, côté fidèle" />
            <div className="absolute -bottom-6 -left-2 hidden w-44 rotate-[-6deg] md:block">
              <PhoneFrame src="/guides/compte-08-accueil-responsable.jpg" alt="Accueil du responsable" small />
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau des confessions */}
      <section aria-label="Quatre confessions" className="border-y border-line bg-bg-soft">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 py-6 sm:px-6 md:grid-cols-4">
          {confessions.map((c) => (
            <div key={c.name} className="flex items-center gap-3 p-3">
              <span className="h-10 w-1.5 rounded-full" style={{ background: c.color }} aria-hidden />
              <div>
                <p className="font-display text-lg font-semibold leading-tight">{c.name}</p>
                <p className="text-xs text-muted">
                  {c.place} · {c.leader} · {c.teaching}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pour le responsable */}
      <Section
        id="responsable"
        eyebrow="Pour le responsable"
        title="Un espace simple, une action par écran"
        intro="Rabbin, imam, prêtre ou enseignant : gros boutons, gros textes, rien à configurer. Vous créez votre communauté (nom, courant, groupe, adresse ou géolocalisation, publique ou privée, pays), vous partagez un code ou un QR code, et vous publiez."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Enseignements" icon={<Icon.Book />}>
            Dvar Torah, khutba, homélie, enseignement du Dharma : texte, vidéo, photo ou audio. Le dernier s&apos;affiche en entier chez les fidèles, les précédents sont classés par thème.
          </Card>
          <Card title="Questions-réponses" icon={<Icon.Chat />}>
            Les fidèles vous écrivent, vous répondez avec vos sources. Vous choisissez de publier la réponse pour toute la communauté, anonymisée, ou de la garder privée.
          </Card>
          <Card title="Horaires et agenda" icon={<Icon.Clock />}>
            Calendrier jour par jour, offices, cours, fêtes. Pour le judaïsme, les horaires d&apos;allumage, de sortie et des fêtes sont proposés automatiquement. Agenda avec affiche pour les événements.
          </Card>
          <Card title="Dates des fidèles" icon={<Icon.Calendar />}>
            Anniversaires, azkara, baptêmes, mariages, décès… groupés par semaine et par mois, avec un geste pour envoyer un mazal tov ou proposer une montée.
          </Card>
          <Card title="Dons et promesses" icon={<Icon.Gift />}>
            Enregistrez un don en quatre étapes, suivez ce qui reste à récupérer par don ou par donateur, envoyez un rappel, marquez un don acquitté. Reçus fiscaux générés automatiquement.
          </Card>
          <Card title="Live avec notification" icon={<Icon.Live />}>
            Lancez un direct : tous les fidèles reçoivent une notification, un bandeau LIVE apparaît dans leur application, et vous voyez combien vous suivent.
          </Card>
        </div>
      </Section>

      {/* Pour les fidèles */}
      <Section
        id="fideles"
        eyebrow="Pour les fidèles"
        title="Tout ce qui compte, dans cinq onglets"
        intro="Le fidèle rejoint une ou plusieurs communautés — autour de lui, par QR code ou par code — et passe de l'une à l'autre d'un geste."
        tone="soft"
      >
        <div className="grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div className="mx-auto w-full max-w-xs">
            <PhoneFrame src="/guides/fidele-08-dons.jpg" alt="Onglet Dons côté fidèle" />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              ["Horaires", "Prochains horaires sur sept jours, fêtes, offices, agenda de la communauté et bandeau LIVE quand le responsable est en direct."],
              ["Cours", "Le dernier enseignement en entier, les précédents filtrables par thème, à lire ou à écouter."],
              ["Questions", "Poser une question, anonymement si on veut, et lire les réponses publiées avec leurs sources."],
              ["Dons", "Montants rapides, calculateur de maasser ou de zakat, promesses à régler, choix de l'association, reçus fiscaux à imprimer ou envoyer."],
              ["Compte", "Mes dates (anniversaires, souvenirs), mes communautés, ma langue, et une gamification douce : l'ora, le nur, la flamme ou les pāramitā grandissent avec les dons, les cours et les questions."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-line bg-surface p-5">
                <p className="font-sans font-semibold">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Pour l'équipe */}
      <Section
        id="equipe"
        eyebrow="Pour l'équipe"
        title="Des accès sur mesure, sans partager de mot de passe"
        intro="Le responsable crée un code personnel pour chaque membre de son équipe. La personne crée son propre compte, entre le code, et arrive directement dans l'espace qui lui correspond."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { code: "RB-0000", title: "Rabbin bis", sub: "Adjoint, secrétaire", text: "Mêmes droits que le responsable : enseignements, questions, horaires, agenda, dons, associations, paiements, live. Sauf la gestion des accès.", icon: <Icon.Users /> },
            { code: "TR-0000", title: "Trésorier", sub: "Dons uniquement", text: "Enregistrer un don, suivre les promesses, marquer un don acquitté, envoyer un rappel, gérer associations et moyens de paiement. Il ne voit rien d'autre.", icon: <Icon.Receipt /> },
            { code: "OR-0000", title: "Organisateur", sub: "Horaires et agenda", text: "Ajouter des offices, des cours, des événements avec leur affiche. Il ne voit ni les dons ni les questions.", icon: <Icon.Calendar /> },
          ].map((r) => (
            <div key={r.code} className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-faint text-gold">{r.icon}</span>
                <code className="rounded-full bg-bg-soft px-3 py-1 text-xs font-semibold tracking-wider text-muted">{r.code}</code>
              </div>
              <h3 className="mt-4 font-sans text-lg font-semibold">{r.title}</h3>
              <p className="text-xs font-medium uppercase tracking-wider text-gold">{r.sub}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{r.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          Les droits sont vérifiés par la base de données elle-même (règles par rôle), pas seulement par l&apos;affichage.{" "}
          <Link href="/apprendre/creer-un-acces-tresorier" className="font-medium text-gold underline underline-offset-4">
            Voir le guide « Créer un accès trésorier »
          </Link>
          .
        </p>
      </Section>

      {/* Niveau : l'ora qui grandit */}
      <Section
        id="niveau"
        eyebrow="L'ora qui grandit"
        title="L'ora, le nur, la flamme : un niveau qui grandit avec vous"
        intro="Un seul niveau par fidèle, qui monte sans fin et ne redescend jamais. Il est nourri par deux sources, visibles séparément : l'assiduité (la présence dans l'application) et la générosité (les dons confirmés). Ora pour le judaïsme, nur pour l'islam, flamme pour le christianisme, pāramitā pour le bouddhisme."
        tone="soft"
      >
        <div className="grid items-start gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Extrait du barème</p>
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
              {[
                ["Ouvrir l'application", "1 point, une fois par jour"],
                ["Lire un cours en entier", "2 points par cours (texte lu jusqu'en bas, vidéo regardée à 80 %)"],
                ["Poser une question", "2 points, +1 quand le responsable répond"],
                ["Série de 7 jours d'ouverture", "+5 points · série de 30 jours : +20"],
                ["Tsedaka · sadaqa · offrande · dana", "4 points par tranche de 10 €"],
                ["Maasser · zakat · dîme", "10 points par tranche de 100 € (40 ₪ et 400 ₪ en Israël)"],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <span className="font-sans text-[15px] font-semibold">{t}</span>
                  <span className="shrink-0 text-right text-sm text-muted sm:max-w-[55%]">{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Le niveau 1 coûte 5 points, chaque niveau suivant un point de plus : niveau 10 à 95 points, niveau 20 à 290. Un palier nommé tous les dix niveaux, sans fin.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Étincelle", "Lueur", "Flamme", "Torche", "Phare", "Soleil", "…"].map((p) => (
                <Pill key={p}>{p}</Pill>
              ))}
            </div>
          </div>
          <div className="grid gap-5">
            <Card title="Jauge d'assiduité" icon={<Icon.Clock />}>
              Les jours actifs sur douze mois glissants donnent un titre : <strong className="font-semibold text-ink">Régulier</strong> à 30 jours,{" "}
              <strong className="font-semibold text-ink">Fidèle</strong> à 100, <strong className="font-semibold text-ink">Pilier</strong> à 365.
            </Card>
            <Card title="Jauge de générosité" icon={<Icon.Gift />}>
              Les dons confirmés dans l&apos;année donnent un second titre : <strong className="font-semibold text-ink">Généreux</strong> à 180 €,{" "}
              <strong className="font-semibold text-ink">Bienfaiteur</strong> à 1 000 €, <strong className="font-semibold text-ink">Mécène</strong> à 5 000 €.
            </Card>
            <Card title="Attestation annuelle" icon={<Icon.Receipt />}>
              Imprimable en un geste : jours actifs, cours lus, questions posées, dons par association, titres obtenus. La preuve qu&apos;on est très assidu ou bon donateur.
            </Card>
            <p className="px-1 text-sm leading-relaxed text-muted">
              Les points de don viennent des dons confirmés, impossibles à s&apos;attribuer soi-même. Une action compte une fois par jour. Mode discret possible ; le responsable voit les fidèles les plus engagés du mois, lui seul, jamais de classement public sans accord.{" "}
              <Link href="/blog/l-ora-qui-grandit-points-et-niveaux" className="font-medium text-gold underline underline-offset-4">
                Le barème complet
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      {/* Dons */}
      <Section
        id="dons"
        eyebrow="Dons et reçus fiscaux"
        title="Les dons vont directement à votre association"
        intro="myCommu ne détient jamais les fonds. Chaque association relie ses propres comptes et encaisse directement ; le reçu fiscal suit le pays de l'association."
        tone="night"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: <Icon.Building />, title: "Plusieurs associations par communauté", text: "Une par pays (association française et amuta israélienne) ou par œuvre (synagogue, Hevra Kadisha, Talmud Torah). Chacune avec son pays, son numéro officiel, son signataire." },
            { icon: <Icon.Receipt />, title: "Cerfa en France, Seif 46 en Israël", text: "Le fidèle choisit l'association au moment du don ; le reçu généré est celui du bon pays, avec les mentions légales. À imprimer, télécharger ou envoyer par e-mail." },
            { icon: <Icon.Shield />, title: "Stripe Connect, Bit, Lemon Squeezy", text: "Paiement direct sur le compte Stripe de l'association (inscription hébergée par Stripe), Bit en Israël, Lemon Squeezy ailleurs. Aucune commission myCommu." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold-soft">{c.icon}</span>
              <h3 className="mt-4 font-sans text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-on-night/80">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {["Tsedaka · Maasser", "Sadaqa · Zakat", "Offrande · Dîme", "Dana"].map((p) => (
            <span key={p} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-on-night/80">
              {p}
            </span>
          ))}
        </div>
      </Section>

      {/* Horaires automatiques */}
      <Section
        id="horaires"
        eyebrow="Horaires automatiques"
        title="Des horaires de Chabbat sans rien taper"
        intro="Pour le judaïsme, l'application calcule avec Hebcal, hors ligne, les horaires d'allumage, de sortie de Chabbat et de fête, les jeûnes, les fêtes, Roch Hodech et la paracha, pour la position de la communauté."
      >
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <ol className="space-y-4">
            {[
              ["Proposer", "Un bouton « Proposer les horaires de ma ville » : les horaires à venir s'affichent, groupés par jour, filtrables par type et sur 2, 4 ou 8 semaines."],
              ["Ajuster", "Le crayon permet de corriger le nom ou l'heure avant d'ajouter (allumage 18 minutes avant le coucher, 40 à Jérusalem ; sortie 42 minutes après)."],
              ["Publier", "« Ajouter » un horaire à la fois, ou « Tout ajouter ». Chaque horaire publié reste modifiable dans le calendrier."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-night font-display text-sm font-semibold text-on-night">{i + 1}</span>
                <div>
                  <p className="font-sans font-semibold">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
                </div>
              </li>
            ))}
            <li className="px-1 text-sm text-muted">
              Islam : cinq prières, Jumu&apos;a, Ramadan. Christianisme : messes et temps liturgiques. Bouddhisme : uposatha et calendrier lunaire.{" "}
              <Link href="/apprendre/publier-les-horaires-sans-rien-taper" className="font-medium text-gold underline underline-offset-4">
                Guide pas à pas
              </Link>
              .
            </li>
          </ol>
          <div className="mx-auto w-full max-w-xs">
            <PhoneFrame src="/guides/horaires-02-propositions.jpg" alt="Horaires proposés automatiquement avec Hebcal" />
          </div>
        </div>
      </Section>

      {/* Sécurité */}
      <Section
        id="securite"
        eyebrow="Sécurité et données"
        title="Chaque communauté ne voit que ses données"
        intro="L'application repose sur Firebase (Firestore temps réel) hébergé en Europe, avec des règles d'accès par rôle vérifiées document par document."
        tone="soft"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Europe" icon={<Icon.Pin />}>Base Firestore en région eur3 (Europe). Authentification par e-mail et mot de passe ou Google.</Card>
          <Card title="Règles par rôle" icon={<Icon.Shield />}>Fidèle, responsable, rabbin bis, trésorier, organisateur : chaque lecture et chaque écriture est contrôlée par les règles de la base.</Card>
          <Card title="Temps réel" icon={<Icon.Live />}>Une réponse, un horaire, un don apparaissent sur tous les téléphones sans recharger. Un cache local garde l&apos;essentiel hors ligne.</Card>
          <Card title="Confidentialité" icon={<Icon.Heart />}>Les questions privées restent entre le fidèle et le responsable. Les dons vont directement à l&apos;association : myCommu ne voit ni les cartes ni les fonds.</Card>
        </div>
      </Section>

      {/* Multilingue */}
      <Section
        id="langues"
        eyebrow="Multilingue"
        title="Français, English, עברית, العربية"
        intro="L'interface existe en quatre langues, avec un affichage de droite à gauche pour l'hébreu et l'arabe. L'application prend la langue de l'appareil, et chacun peut changer la sienne."
      >
        <div className="flex flex-wrap gap-2">
          {["Vocabulaire propre à chaque confession", "Dates hébraïques, hégiriennes, liturgiques, lunaires", "Monnaie selon la communauté (₪, €…)", "Contenus publiés dans la langue de leur auteur"].map((p) => (
            <Pill key={p}>{p}</Pill>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" eyebrow="FAQ" title="Questions fréquentes" tone="soft">
        <Faq />
      </Section>

      {/* Appel final */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:px-6">
        <div className="rounded-3xl bg-night px-6 py-12 text-center text-on-night sm:px-12">
          <h2 className="text-3xl font-semibold sm:text-4xl">Prêt à relier votre communauté ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-on-night/80">
            Essayez la démo en deux minutes, puis créez votre communauté réelle. Les guides pas à pas vous accompagnent, en version diaporama, imprimable ou PDF.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href={APP_URL} variant="gold" external>Essayer la démo</ButtonLink>
            <Link href="/apprendre" className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-on-night transition hover:bg-white/10">
              Voir les guides
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
