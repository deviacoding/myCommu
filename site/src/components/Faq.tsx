const items: { q: string; a: string }[] = [
  {
    q: "Combien ça coûte ?",
    a: "myCommu ne prélève aucune commission sur les dons et ne détient jamais les fonds. Seuls les frais du prestataire de paiement s'appliquent, directement sur le compte de l'association (Stripe : environ 1,5 % + 0,25 € par carte européenne). Pour connaître les conditions d'abonnement de votre communauté, écrivez-nous à contact@mycommu.app.",
  },
  {
    q: "Dans quels pays l'application fonctionne-t-elle ?",
    a: "Partout : la communauté choisit son pays à la création, et chaque association le sien. Les paiements par carte passent par Stripe dans les pays qu'il couvre ; en Israël, Bit est proposé ; Lemon Squeezy couvre d'autres pays. Les reçus fiscaux sont au format Cerfa (France), Seif 46 (Israël) ou reçu simple ailleurs.",
  },
  {
    q: "Où sont stockées les données, et qui les voit ?",
    a: "Sur Firebase (Google Cloud) en Europe, base Firestore en région eur3. Chaque communauté ne voit que ses données ; les règles de la base vérifient le rôle de chacun (fidèle, responsable, rabbin bis, trésorier, organisateur) à chaque lecture et chaque écriture. Les questions privées ne sont visibles que du fidèle et du responsable.",
  },
  {
    q: "Un fidèle peut-il appartenir à plusieurs communautés ?",
    a: "Oui. Il les rejoint autour de lui, par QR code ou par code, et bascule de l'une à l'autre depuis la barre du haut. Horaires, enseignements, questions, agenda et dons affichés sont ceux de la communauté choisie.",
  },
  {
    q: "Comment fonctionne l'équipe (rabbin bis, trésorier, organisateur) ?",
    a: "Le responsable crée un code personnel (RB-, TR- ou OR-0000) depuis « Créer des accès ». La personne crée son propre compte, entre le code dans « Rejoindre → Code » et arrive dans l'espace qui lui correspond. Le responsable peut retirer un accès à tout moment.",
  },
  {
    q: "Les reçus fiscaux sont-ils automatiques ?",
    a: "Oui. Chaque don confirmé génère un reçu au format de l'association choisie (Cerfa 11580 en France, Seif 46 en Israël), avec son numéro officiel, son adresse et son signataire. Le fidèle le retrouve dans l'onglet Dons : à imprimer, télécharger ou envoyer par e-mail.",
  },
  {
    q: "Faut-il saisir les horaires à la main ?",
    a: "Pour le judaïsme, non : l'application propose les horaires d'allumage, de sortie de Chabbat et de fête, les jeûnes, fêtes, Roch Hodech et paracha pour la position de la communauté (calculs Hebcal, hors ligne). Vous ajoutez d'un geste, corrigez avant ou après. Pour les autres confessions, des horaires sont aussi proposés, et tout reste modifiable.",
  },
  {
    q: "Peut-on essayer avant de créer un compte ?",
    a: "Oui : le bouton « Accès démo » de l'application ouvre une démo complète, pour chaque confession et chaque rôle (responsable, fidèle, trésorier), avec des données fictives remises à zéro à chaque rechargement.",
  },
];

export function Faq() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((it) => (
        <details key={it.q} className="group px-6 py-4 open:bg-gold-faint/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-[15px] font-semibold marker:content-none">
            {it.q}
            <span aria-hidden className="shrink-0 text-gold transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
