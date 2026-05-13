import { Group } from '../types';

export const groups: Group[] = [
  {
    id: 'g1',
    name: 'Étudiants juifs de Paris',
    description: 'Communauté d’étudiants juifs en Île-de-France',
    members: 342,
    community: 'jewish',
    cover: 'https://picsum.photos/seed/students/400/200',
    joined: true,
  },
  {
    id: 'g2',
    name: 'Jeunes catholiques Lyon',
    description: 'Activités, retraites et rencontres pour jeunes catholiques',
    members: 215,
    community: 'christian',
    cover: 'https://picsum.photos/seed/youth/400/200',
  },
  {
    id: 'g3',
    name: 'Cercle d’étude du Coran',
    description: 'Étude hebdomadaire ouverte à tous niveaux',
    members: 178,
    community: 'muslim',
    cover: 'https://picsum.photos/seed/coran/400/200',
    joined: true,
  },
  {
    id: 'g4',
    name: 'Parents et familles',
    description: 'Conseils, garde d’enfants, entraide entre familles',
    members: 521,
    community: 'jewish',
    cover: 'https://picsum.photos/seed/family/400/200',
  },
  {
    id: 'g5',
    name: 'Solidarité & dons',
    description: 'Organiser les collectes et les actions de solidarité',
    members: 89,
    community: 'muslim',
    cover: 'https://picsum.photos/seed/solidarity/400/200',
  },
  {
    id: 'g6',
    name: 'Chorale paroissiale',
    description: 'Pour ceux qui aiment chanter le dimanche',
    members: 42,
    community: 'christian',
    cover: 'https://picsum.photos/seed/choir/400/200',
  },
];
