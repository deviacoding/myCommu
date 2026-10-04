export type GuideStep = {
  title: string;
  text: string;
  tip?: string;
  /** Chemin public de la capture d'écran, ex. /guides/compte-01-accueil.jpg */
  image?: string;
};

export type Guide = {
  slug: string;
  title: string;
  intro: string;
  audience: "Responsable" | "Fidèle" | "Équipe";
  /** Durée indicative, ex. « 5 minutes » */
  duration?: string;
  steps: GuideStep[];
};
