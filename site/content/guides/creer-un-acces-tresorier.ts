import type { Guide } from "./types";

export const guide: Guide = {
  slug: "creer-un-acces-tresorier",
  title: "Créer un accès trésorier (et rabbin bis, organisateur)",
  audience: "Équipe",
  duration: "3 minutes",
  intro:
    "Déléguez sans partager votre mot de passe. Le responsable crée un code d'accès personnel pour un trésorier, un adjoint (rabbin bis) ou un organisateur ; la personne crée son propre compte et entre ce code.",
  steps: [
    {
      title: "Depuis l'accueil du responsable",
      text: "Connectez-vous avec votre compte de responsable. Sur l'accueil, descendez jusqu'à la case « Créer des accès » (rabbin bis, trésorier, organisateur).",
      image: "/guides/equipe-01-accueil-responsable.jpg",
    },
    {
      title: "Choisir l'accès",
      text: "Trois accès sont proposés. Rabbin bis : mêmes droits que vous, sauf la gestion des accès. Trésorier : uniquement les dons. Organisateur : horaires et agenda. Touchez celui que vous voulez créer, ici « Accès trésorier ».",
      tip: "Vous pouvez créer plusieurs accès du même type, par exemple deux organisateurs.",
      image: "/guides/equipe-02-quel-acces.jpg",
    },
    {
      title: "Pour qui ?",
      text: "Indiquez le prénom et le nom de la personne, puis un contact (téléphone ou e-mail). Touchez « Créer l'accès trésorier ».",
      image: "/guides/equipe-03-pour-qui.jpg",
    },
    {
      title: "Le code TR-0000",
      text: "Un code personnel s'affiche : TR- pour un trésorier, RB- pour un rabbin bis, OR- pour un organisateur. Transmettez-le à la personne. Elle apparaît dans « Mon équipe » avec le statut « Invité » jusqu'à ce qu'elle l'utilise.",
      tip: "Pour retirer un accès plus tard, touchez « Retirer l'accès » sur la même liste : le code ne fonctionnera plus.",
      image: "/guides/equipe-04-code.jpg",
    },
    {
      title: "La personne crée son compte",
      text: "De son côté, le trésorier ouvre l'application, touche « Créer un compte », renseigne son nom, son e-mail, son mot de passe et sa religion. Il choisit « Fidèle » : c'est le code qui lui donnera ses droits.",
      image: "/guides/fidele-01-compte-fidele.jpg",
    },
    {
      title: "Rejoindre → Code",
      text: "Sur l'écran « Rejoindre une communauté », il touche l'onglet « Code », saisit le code reçu (par exemple TR-4821) et valide.",
      image: "/guides/equipe-05-rejoindre-code.jpg",
    },
    {
      title: "Il arrive dans l'espace trésorier",
      text: "L'application le conduit directement dans l'espace qui correspond à son accès. Le trésorier ne voit que les dons : enregistrer un don, dons à récupérer, associations et moyens de paiement. Rien d'autre.",
      tip: "Chez vous, son statut passe à « Actif » dans « Mon équipe ».",
      image: "/guides/equipe-06-espace-tresorier.jpg",
    },
  ],
};
