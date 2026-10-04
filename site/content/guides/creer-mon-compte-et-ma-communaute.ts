import type { Guide } from "./types";

export const guide: Guide = {
  slug: "creer-mon-compte-et-ma-communaute",
  title: "Créer mon compte et ma communauté",
  audience: "Responsable",
  duration: "5 minutes",
  intro:
    "Rabbin, imam, prêtre ou enseignant : en quelques écrans, vous créez votre compte, puis votre communauté, et vous obtenez le code et le QR code que vos fidèles utiliseront pour vous rejoindre.",
  steps: [
    {
      title: "Ouvrir l'application",
      text: "Rendez-vous sur mycommunity-b13de.web.app depuis votre téléphone ou votre ordinateur. L'écran d'accueil propose de se connecter, de créer un compte, ou d'essayer la démo sans compte.",
      tip: "Choisissez votre langue en haut de l'écran : français, anglais, hébreu ou arabe.",
      image: "/guides/compte-01-accueil.jpg",
    },
    {
      title: "Toucher « Créer un compte »",
      text: "Le lien se trouve sous le bouton « Se connecter ». Un compte sert pour toutes vos communautés : vous n'en créerez qu'un.",
      image: "/guides/compte-01-accueil.jpg",
    },
    {
      title: "Renseigner nom, e-mail et mot de passe",
      text: "Indiquez votre nom complet, votre adresse e-mail et un mot de passe de 8 caractères au moins. Puis choisissez votre religion : l'application adapte ses contenus, son calendrier et ses couleurs.",
      tip: "Vous pouvez aussi continuer avec un compte Google, sans mot de passe à retenir.",
      image: "/guides/compte-02-formulaire.jpg",
    },
    {
      title: "Choisir « Responsable de communauté »",
      text: "En bas du formulaire, sous « Je suis », touchez « Responsable de communauté » (plutôt que « Fidèle »). Puis « Créer mon compte ».",
      tip: "Un responsable peut aussi être fidèle d'une autre communauté avec le même compte.",
      image: "/guides/compte-03-responsable.jpg",
    },
    {
      title: "Bonjour Rav : créer ma communauté",
      text: "Après la création du compte, l'écran « Bonjour Rav » (ou Imam, Père, Enseignant) vous demande ce que vous voulez faire. Touchez « Créer ma communauté ».",
      image: "/guides/compte-04-bonjour-rav.jpg",
    },
    {
      title: "Nom, courant et groupe",
      text: "Donnez le nom de votre communauté, choisissez son courant (séfarade, ashkénaze, Habad… ou ajoutez le vôtre) et, si vous le souhaitez, rattachez-la à un groupe : consistoire, fédération, réseau.",
      tip: "Les fidèles peuvent filtrer les communautés par courant dans « Autour de moi ».",
      image: "/guides/compte-05-creer-communaute.jpg",
    },
    {
      title: "Photo, logo, adresse ou géolocalisation, pays",
      text: "Ajoutez votre photo et le logo de la communauté, puis l'adresse (ou « Me géolocaliser » sur téléphone) et le pays. La position sert aux fidèles pour vous trouver et, pour le judaïsme, au calcul automatique des horaires.",
      image: "/guides/compte-06-adresse-pays.jpg",
    },
    {
      title: "Publique ou privée",
      text: "Une communauté publique est visible par géolocalisation dans « Autour de moi ». Une communauté privée ne se rejoint qu'avec le code ou le QR code que vous donnez. Touchez « Créer ma communauté ».",
      tip: "Vous pourrez changer ce réglage plus tard.",
      image: "/guides/compte-06-adresse-pays.jpg",
    },
    {
      title: "Votre code de communauté",
      text: "La communauté est créée. Un code à six caractères (par exemple BE-3207) s'affiche : c'est lui que vos fidèles saisiront. Touchez « Aller à l'accueil de ma communauté ».",
      image: "/guides/compte-07-code.jpg",
    },
    {
      title: "L'accueil du responsable",
      text: "Chaque case est une action : partager un enseignement, répondre aux questions, horaires, agenda, dates des fidèles, dons, associations, moyens de paiement, QR code, accès de l'équipe.",
      tip: "Le bouton « Voir l'application comme un fidèle » vous montre ce que vos membres voient.",
      image: "/guides/compte-08-accueil-responsable.jpg",
    },
    {
      title: "Partager le QR code",
      text: "« Partager mon QR code » affiche le QR code, le code et le lien de votre communauté. Envoyez-les par WhatsApp, SMS ou e-mail, ou imprimez l'affiche pour l'entrée de la synagogue, de la mosquée, de l'église ou du temple.",
      image: "/guides/compte-09-qr-code.jpg",
    },
  ],
};
