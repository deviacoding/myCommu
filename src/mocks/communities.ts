import { Community } from '../types';

export const communities: Community[] = [
  {
    id: 'jewish',
    name: 'Communauté juive',
    shortName: 'Juive',
    description: 'Échange, entraide et événements pour la communauté juive',
    icon: 'star-of-david',
  },
  {
    id: 'christian',
    name: 'Communauté chrétienne',
    shortName: 'Chrétienne',
    description: 'Vie paroissiale, prière et entraide chrétienne',
    icon: 'cross',
  },
  {
    id: 'muslim',
    name: 'Communauté islamique',
    shortName: 'Islamique',
    description: 'Vie de la oumma, prière et solidarité musulmane',
    icon: 'mosque',
  },
];
