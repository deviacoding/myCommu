import { AgendaEvent, Course, DayEntry, Pledge, Question } from '../types';

const RAV = 'Rav Mena’hem Lévy';

// Contenus propres à la communauté Beth Habad (démo du multi-communautés).
export const habadCourses: Course[] = [
  {
    id: 'habad-tanya-joie',
    congregationId: 'habad',
    title: 'Tanya : la joie comme service divin',
    subtitle: 'Pourquoi la tristesse est le premier obstacle du yetser hara',
    teacher: RAV,
    category: 'Moussar',
    duration: '9 min',
    level: 'Tous niveaux',
    date: '2026-09-26',
    featured: true,
    sections: [
      {
        text:
          'Le mois de Tichri est le mois de la joie : « Vé-sama’hta bé’haguékha », tu te réjouiras pendant ta fête. Mais comment se réjouir sur commande ? Le Tanya, œuvre fondatrice de Habad, répond que la joie n’est pas un sentiment à attendre : c’est une arme.',
      },
      {
        heading: 'La source',
        source: 'Tanya, Likoutei Amarim, chapitre 26',
        text:
          '« De même que la victoire sur un adversaire physique, comme deux lutteurs qui cherchent à se renverser l’un l’autre : si l’un est paresseux et lourd, il sera facilement vaincu, même s’il est plus fort que l’autre. Ainsi dans la lutte contre le penchant du mal : on ne peut le vaincre avec paresse et lourdeur, qui viennent de la tristesse, mais seulement avec agilité, qui vient de la joie et d’un cœur libéré de tout souci. »',
      },
      {
        heading: 'La tristesse n’est pas une mitsva',
        text:
          'L’Admour Hazaken distingue la tristesse (atsvout), qui paralyse, de l’amertume (merirout), qui pousse à l’action. Regretter une faute une fois, à un moment choisi, puis revenir immédiatement à la joie : voilà le chemin. Se lamenter toute la journée n’est pas de la piété, c’est une ruse du yetser hara pour nous empêcher de servir.',
      },
      {
        heading: 'À emporter avec soi',
        text:
          '1. Fixer un moment court pour le ’hechbon hanefech, le bilan de l’âme, et ne pas le laisser déborder sur la journée.\n2. Commencer la prière par un chant, comme le veut la coutume Habad avant Chaharit.\n3. Se rappeler que « la joie brise toutes les barrières » : le Rabbi répétait ce mot du Baal Chem Tov comme un programme de vie.',
      },
    ],
  },
  {
    id: 'habad-ahavat-israel',
    congregationId: 'habad',
    title: 'Ahavat Israël : aimer chaque Juif',
    subtitle: 'Le chapitre 32 du Tanya, « lev » en guématria, le cœur du livre',
    teacher: RAV,
    category: 'Moussar',
    duration: '7 min',
    level: 'Tous niveaux',
    date: '2026-09-19',
    sections: [
      {
        source: 'Tanya, Likoutei Amarim, chapitre 32',
        text:
          'Le chapitre 32 porte le numéro du mot « lev », cœur. L’Admour Hazaken y explique que celui qui considère son corps comme secondaire et son âme comme l’essentiel peut aimer chaque Juif comme lui-même : les âmes sont toutes issues d’une même source, seuls les corps sont séparés.',
      },
      {
        heading: 'Une mitsva qui contient toute la Torah',
        text:
          'C’est ce qu’enseignait Hillel : « Ce que tu n’aimes pas, ne le fais pas à ton prochain, voilà toute la Torah, le reste est commentaire. » Aimer un Juif que l’on ne connaît pas, que l’on ne comprend pas, c’est reconnaître en lui l’étincelle divine que l’on porte soi-même.',
      },
    ],
  },
];

export const habadQuestions: Question[] = [
  {
    id: 'habad-q1',
    congregationId: 'habad',
    subject: 'Faut-il mettre les téfilines de Rabbénou Tam ?',
    category: 'Autre',
    status: 'answered',
    askedBy: 'David Cohen',
    date: '2026-09-24',
    messages: [
      {
        id: 'habad-q1-m1',
        author: 'member',
        name: 'David Cohen',
        date: '2026-09-24',
        text: 'Je viens de rejoindre le Beth Habad. Je vois que beaucoup mettent une deuxième paire de téfilines après la prière. Est-ce obligatoire pour moi aussi ?',
      },
      {
        id: 'habad-q1-m2',
        author: 'rav',
        name: RAV,
        date: '2026-09-24',
        text:
          'Bienvenue parmi nous ! La coutume Habad est de mettre les téfilines de Rabbénou Tam chaque jour de semaine après la prière, à partir de la bar-mitsva, sans bénédiction. Ce n’est pas une obligation stricte du Choulhan Aroukh, qui les réserve à celui qui est reconnu pour sa piété, mais l’Admour Hazaken et le Rabbi ont encouragé chacun à les adopter. Si vous n’en avez pas, commencez par les téfilines de Rachi : elles sont l’essentiel. Nous pourrons en parler après l’office, je vous montrerai la manière de les mettre.',
        sources: ['Choulhan Aroukh, Orah Haïm 34, 2-3', 'Choulhan Aroukh HaRav, Orah Haïm 34, 4-5', 'Séfer Haminhaguim Habad, p. 5'],
      },
    ],
  },
];

export const habadDayEntries: DayEntry[] = [
  { id: 'habad-e1', congregationId: 'habad', date: '2026-09-27', name: 'Chaharit avec Hallel', time: '10:00' },
  { id: 'habad-e2', congregationId: 'habad', date: '2026-09-27', name: 'Farbrengen de Souccot', time: '21:00' },
  { id: 'habad-e3', congregationId: 'habad', date: '2026-09-28', name: 'Chaharit', time: '07:30' },
  { id: 'habad-e4', congregationId: 'habad', date: '2026-09-28', name: 'Cours de Tanya', time: '20:30' },
  { id: 'habad-e5', congregationId: 'habad', date: '2026-10-02', name: 'Allumage de Chemini Atseret', time: '19:13' },
  { id: 'habad-e6', congregationId: 'habad', date: '2026-10-03', name: 'Hakafot de Sim’hat Torah', time: '21:00' },
  { id: 'habad-e7', congregationId: 'habad', date: '2026-10-04', name: 'Hakafot du matin', time: '10:30' },
];

export const habadAgenda: AgendaEvent[] = [
  {
    id: 'habad-a1',
    congregationId: 'habad',
    title: 'Farbrengen de Souccot dans la soucca',
    date: '2026-09-27',
    time: '21:00',
    place: 'Soucca du Beth Habad',
    category: 'fete',
    description: 'Chants, enseignements du Rabbi et lé’haïm. Ouvert à tous.',
  },
  {
    id: 'habad-a2',
    congregationId: 'habad',
    title: 'Cours de Tanya du lundi',
    date: '2026-09-28',
    time: '20:30',
    place: 'Beth Habad',
    category: 'cours',
  },
  {
    id: 'habad-a3',
    congregationId: 'habad',
    title: 'Hakafot de Sim’hat Torah avec orchestre',
    date: '2026-10-03',
    time: '21:00',
    place: 'Beth Habad',
    category: 'fete',
  },
];

export const habadPledges: Pledge[] = [
  {
    id: 'habad-p1',
    congregationId: 'habad',
    member: 'David Cohen',
    category: 'Apéritif',
    label: 'Kiddouch farbrengen',
    amount: 260,
    dueDate: '2026-10-09',
    origin: 'Farbrengen de Souccot',
    status: 'due',
  },
];
