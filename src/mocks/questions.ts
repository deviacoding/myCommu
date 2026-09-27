import { Question } from '../types';

const RAV = 'Rav Yaacov Attias';

export const initialQuestions: Question[] = [
  {
    id: 'q6',
    subject: 'Lave-vaisselle partagé entre vaisselle cachère et non cachère',
    category: 'Cacherout',
    status: 'pending',
    askedBy: 'Myriam K.',
    date: '2026-09-27',
    messages: [
      {
        id: 'q6-m1',
        author: 'member',
        name: 'Myriam K.',
        date: '2026-09-27',
        text:
          'Nous emménageons en colocation avec une personne qui ne mange pas cachère. Peut-on utiliser le même lave-vaisselle en faisant des cycles séparés ? Faut-il des paniers différents ?',
      },
    ],
  },
  {
    id: 'q1',
    subject: 'Peut-on manger dans la soucca quand il pleut ?',
    category: 'Fêtes',
    status: 'answered',
    askedBy: 'Sarah L.',
    date: '2026-09-26',
    messages: [
      {
        id: 'q1-m1',
        author: 'member',
        name: 'Sarah L.',
        date: '2026-09-26',
        text:
          'Bonjour Rav, la météo annonce de la pluie pour toute la semaine. Est-ce qu’on est obligé de rester manger dans la soucca sous la pluie ? Et pour le premier soir ?',
      },
      {
        id: 'q1-m2',
        author: 'rav',
        name: RAV,
        date: '2026-09-26',
        text:
          'Bonjour Sarah. Non, on n’est pas obligé. Le Choulhan Aroukh dit que si la pluie est assez forte pour gâter un plat de fèves, on est dispensé de la soucca et on rentre manger à la maison. Le Rama ajoute que celui qui s’obstine à rester sous la pluie n’est pas récompensé : la soucca est faite pour y habiter comme chez soi, et personne ne reste chez soi sous la pluie.\n\nLe premier soir est différent : on fait le kiddouch dans la soucca et on mange au moins un kazaït (environ 30 g) de pain, même sous la pluie, puis on termine le repas à l’intérieur. Certains attendent une heure ou deux pour voir si la pluie s’arrête. Bonne fête !',
        sources: ['Choulhan Aroukh, Orah Haïm 639, 5', 'Rama, Orah Haïm 639, 5 et 7', 'Michna Beroura 639, 35'],
      },
    ],
  },
  {
    id: 'q2',
    subject: 'Le maasser se calcule sur le brut ou sur le net ?',
    category: 'Tsedaka',
    status: 'answered',
    askedBy: 'David Cohen',
    date: '2026-09-22',
    messages: [
      {
        id: 'q2-m1',
        author: 'member',
        name: 'David Cohen',
        date: '2026-09-22',
        text:
          'Je viens de commencer à donner le maasser. Faut-il prendre 10 % de mon salaire brut ou de ce qui arrive vraiment sur mon compte ? Et est-ce une obligation stricte ?',
      },
      {
        id: 'q2-m2',
        author: 'rav',
        name: RAV,
        date: '2026-09-23',
        text:
          'Bravo pour cette décision. La coutume majoritaire est de calculer le maasser sur le revenu net, c’est-à-dire après impôts et cotisations obligatoires, puisque cet argent n’est jamais réellement entré en votre possession. Les frais professionnels nécessaires pour gagner ce revenu peuvent aussi être déduits.\n\nSur le statut : le Choulhan Aroukh présente le dixième comme la « mesure moyenne » de la tsedaka et le cinquième comme la mesure généreuse. La plupart des décisionnaires considèrent le maasser kessafim comme une coutume solidement établie plutôt qu’une obligation de la Torah, ce qui permet une certaine souplesse en cas de difficulté. Bonne idée : dire dès le départ « bli neder », sans vœu, pour ne pas s’engager formellement.',
        sources: ['Choulhan Aroukh, Yoré Déa 249, 1', 'Rama, Yoré Déa 249, 1', 'Igrot Moché, Yoré Déa 2, 112'],
      },
    ],
  },
  {
    id: 'q3',
    subject: 'Puis-je allumer les bougies de Yom Tov après le début de la fête ?',
    category: 'Fêtes',
    status: 'answered',
    askedBy: 'Anonyme',
    anonymous: true,
    date: '2026-09-19',
    messages: [
      {
        id: 'q3-m1',
        author: 'member',
        name: 'Anonyme',
        date: '2026-09-19',
        text:
          'Je rentre du travail tard le vendredi et je rate parfois l’heure d’allumage. Pour Roch Hachana ou Souccot, est-ce qu’on peut encore allumer les bougies une fois la fête commencée ?',
      },
      {
        id: 'q3-m2',
        author: 'rav',
        name: RAV,
        date: '2026-09-19',
        text:
          'Pour un Yom Tov qui tombe en semaine, oui : on peut allumer après le début de la fête, à condition de prendre le feu d’une flamme déjà existante (une veilleuse allumée avant la fête, par exemple), car il est interdit de créer un feu nouveau à Yom Tov. On ne souffle pas l’allumette après usage, on la pose et on la laisse s’éteindre.\n\nAttention : ce n’est pas possible lorsque le Yom Tov tombe Chabbat, ni à Yom Kippour. Cette année, le premier jour de Roch Hachana, de Souccot et Chemini Atseret tombent Chabbat : là, l’allumage doit impérativement se faire avant l’heure.',
        sources: ['Choulhan Aroukh, Orah Haïm 502, 1', 'Choulhan Aroukh, Orah Haïm 514, 1', 'Michna Beroura 514, 3'],
      },
    ],
  },
  {
    id: 'q4',
    subject: 'Chéhé’héyanou sur le loulav : chaque jour ou une seule fois ?',
    category: 'Fêtes',
    status: 'answered',
    askedBy: 'Yossef B.',
    date: '2026-09-25',
    messages: [
      {
        id: 'q4-m1',
        author: 'member',
        name: 'Yossef B.',
        date: '2026-09-25',
        text: 'Est-ce qu’on récite Chéhé’héyanou à chaque prise du loulav pendant la fête ?',
      },
      {
        id: 'q4-m2',
        author: 'rav',
        name: RAV,
        date: '2026-09-25',
        text:
          'Non, seulement la première fois que l’on prend le loulav pendant la fête. Cette année, comme le premier jour tombe Chabbat, ce sera le dimanche 27 septembre. Si vous avez oublié de la dire à ce moment-là, vous la dites à la prise suivante.',
        sources: ['Choulhan Aroukh, Orah Haïm 651, 6', 'Choulhan Aroukh, Orah Haïm 658, 2'],
      },
    ],
  },
  {
    id: 'q5',
    subject: 'Kaddich sans minyan pendant l’année de deuil',
    category: 'Deuil',
    status: 'answered',
    askedBy: 'Anonyme',
    anonymous: true,
    date: '2026-09-15',
    messages: [
      {
        id: 'q5-m1',
        author: 'member',
        name: 'Anonyme',
        date: '2026-09-15',
        text:
          'J’ai perdu mon père il y a deux mois. Certains jours je ne peux pas aller à la synagogue. Puis-je dire le Kaddich seul à la maison ?',
      },
      {
        id: 'q5-m2',
        author: 'rav',
        name: RAV,
        date: '2026-09-15',
        text:
          'Je vous adresse mes condoléances, hamakom yena’hem. Le Kaddich est une « chose de sainteté » (davar chébikdoucha) et ne peut être dit qu’en présence d’un minyan de dix hommes. Seul, on ne le récite pas.\n\nMais l’élévation de l’âme de votre père ne dépend pas que du Kaddich. Les jours où vous ne pouvez pas venir, vous pouvez étudier une michna en sa mémoire (les lettres de Michna sont celles de Nechama, l’âme), lire des Tehilim, ou donner une tsedaka à son nom. Et n’hésitez pas à me dire quels jours vous posent problème : nous pouvons souvent trouver quelqu’un pour dire le Kaddich à votre place.',
        sources: ['Choulhan Aroukh, Orah Haïm 55, 1', 'Rama, Yoré Déa 376, 4'],
      },
    ],
  },
];
