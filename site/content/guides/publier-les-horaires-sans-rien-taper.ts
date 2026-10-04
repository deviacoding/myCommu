import type { Guide } from "./types";

export const guide: Guide = {
  slug: "publier-les-horaires-sans-rien-taper",
  title: "Publier les horaires sans rien taper",
  audience: "Responsable",
  duration: "3 minutes",
  intro:
    "Pour le judaïsme, myCommu calcule les horaires d'allumage, de sortie de Chabbat, des jeûnes et des fêtes pour la position de votre communauté (calculs Hebcal, hors ligne). Vous choisissez ce que vous publiez, vous corrigez avant ou après.",
  steps: [
    {
      title: "Ouvrir « Horaires »",
      text: "Depuis l'accueil du responsable, touchez la case « Horaires ». L'écran s'ouvre sur la carte « Horaires proposés automatiquement », puis le calendrier du mois.",
      image: "/guides/horaires-01-ecran.jpg",
    },
    {
      title: "Proposer les horaires de ma ville",
      text: "Touchez « Proposer les horaires de ma ville ». L'application utilise la position de la communauté (adresse ou géolocalisation renseignée à sa création) et calcule les horaires à venir.",
      tip: "Si la position est refusée, renseignez l'adresse de la communauté dans « Courant et groupe → adresse ».",
      image: "/guides/horaires-01-ecran.jpg",
    },
    {
      title: "Les propositions, jour par jour",
      text: "Les horaires apparaissent groupés par date : allumage des bougies le vendredi, sortie de Chabbat le samedi, jeûnes, fêtes, Roch Hodech, paracha. Rien n'est encore publié.",
      image: "/guides/horaires-02-propositions.jpg",
    },
    {
      title: "Filtres et semaines",
      text: "Les pastilles du haut filtrent par type (Allumage, Sortie, Jeûne, Fête, Roch Hodech, Paracha). En dessous, choisissez l'horizon : 2, 4 ou 8 semaines.",
      tip: "Allumage 18 min avant le coucher du soleil (40 à Jérusalem), sortie 42 min après.",
      image: "/guides/horaires-03-filtres.jpg",
    },
    {
      title: "Le crayon : modifier avant d'ajouter",
      text: "Touchez le crayon d'une ligne pour changer son nom (« Allumage + Minha ») ou son heure avant de la publier, puis « Ajouter ainsi ».",
      image: "/guides/horaires-04-crayon.jpg",
    },
    {
      title: "« Ajouter » : un horaire à la fois",
      text: "Touchez « Ajouter » sur une ligne : l'horaire passe dans le calendrier et la ligne est marquée « Publié ». Impossible de l'ajouter deux fois.",
      image: "/guides/horaires-05-ajoute.jpg",
    },
    {
      title: "« Tout ajouter » : tout d'un coup",
      text: "Le bouton « Tout ajouter (n) » publie toutes les propositions affichées, selon vos filtres. Le message « Tout est déjà publié pour cette période » confirme.",
      image: "/guides/horaires-06-tout-ajoute.jpg",
    },
    {
      title: "Le calendrier",
      text: "Plus bas, le calendrier du mois montre une pastille avec le nombre d'horaires par jour ; les Chabbats sont teintés. Touchez un jour pour voir ses horaires.",
      image: "/guides/horaires-07-calendrier.jpg",
    },
    {
      title: "Modifier un horaire déjà publié",
      text: "Sur le jour choisi, touchez le crayon à côté d'un horaire, changez le nom ou l'heure, puis « Enregistrer ». La corbeille le supprime. En dessous, vous ajoutez un horaire à la main (Minha, cours…).",
      tip: "Le fidèle voit la modification immédiatement dans « Prochains horaires ».",
      image: "/guides/horaires-09-modifier.jpg",
    },
  ],
};
