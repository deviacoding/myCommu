import type { Guide } from "./types";

export const guide: Guide = {
  slug: "rejoindre-sa-communaute",
  title: "Rejoindre sa communauté (fidèle)",
  audience: "Fidèle",
  duration: "2 minutes",
  intro:
    "Créez votre compte, puis rejoignez votre synagogue, votre mosquée, votre église ou votre temple de trois façons : autour de vous, avec le QR code, ou avec le code reçu. Vous pourrez en rejoindre d'autres ensuite.",
  steps: [
    {
      title: "Créer un compte « Fidèle »",
      text: "Sur l'écran d'accueil, touchez « Créer un compte ». Renseignez votre nom, votre e-mail et un mot de passe, choisissez votre religion, puis « Fidèle » sous « Je suis ». Touchez « Créer mon compte ».",
      tip: "Vous pouvez aussi continuer avec Google.",
      image: "/guides/fidele-01-compte-fidele.jpg",
    },
    {
      title: "Autour de moi",
      text: "L'écran « Rejoindre une communauté » s'ouvre sur « Autour de moi » : les communautés publiques proches, de la plus près à la plus éloignée, avec le courant et le nom du responsable. Touchez « Rejoindre » sur la vôtre.",
      tip: "Sur téléphone, autorisez la position pour voir les distances. Vous pouvez filtrer par courant.",
      image: "/guides/fidele-02-autour-de-moi.jpg",
    },
    {
      title: "Ou avec le QR code",
      text: "Si votre communauté a affiché ou envoyé son QR code, touchez l'onglet « QR code » et scannez-le avec la caméra. Vous pouvez aussi coller le lien reçu (mycommunity-b13de.web.app/rejoindre/XX-0000).",
      image: "/guides/fidele-03-qr-code.jpg",
    },
    {
      title: "Ou avec le code",
      text: "Touchez l'onglet « Code », saisissez le code à six caractères communiqué par votre communauté (par exemple BY-2026) et touchez « Valider le code ».",
      tip: "C'est aussi ici que les membres de l'équipe entrent leur code TR-, RB- ou OR-.",
      image: "/guides/fidele-04-code.jpg",
    },
    {
      title: "Continuer",
      text: "Un message confirme que vous avez rejoint la communauté. Touchez « Continuer ». Vous pourrez ajouter d'autres communautés à tout moment depuis « Mon compte ».",
      image: "/guides/fidele-05-rejoint.jpg",
    },
    {
      title: "Les onglets",
      text: "Horaires (et agenda), Cours (les enseignements), Questions (poser une question, lire les réponses), Dons (donner, promesses, reçus fiscaux) et Compte. En haut, la pastille au nom de la communauté permet de basculer vers une autre.",
      image: "/guides/fidele-06-onglets.jpg",
    },
    {
      title: "Lire les enseignements",
      text: "L'onglet Cours affiche le dernier enseignement en entier, avec la photo du responsable, puis les précédents, filtrables par thème.",
      image: "/guides/fidele-07-cours.jpg",
    },
    {
      title: "Donner et retrouver ses reçus",
      text: "L'onglet Dons propose des montants rapides, un calculateur (maasser, zakat…), vos promesses à régler et vos reçus fiscaux, à imprimer ou à envoyer par e-mail. Si la communauté a plusieurs associations, vous choisissez celle que vous soutenez.",
      image: "/guides/fidele-08-dons.jpg",
    },
  ],
};
