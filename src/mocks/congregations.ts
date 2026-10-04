import { ImageSourcePropType } from 'react-native';
import { Congregation } from '../types';

// Communautés (synagogues) de la démo. Un fidèle peut appartenir à plusieurs d'entre elles.
export const congregations: Congregation[] = [
  {
    id: 'sefarade',
    name: 'Beth Yaacov',
    rite: 'Séfarade',
    city: 'Paris 17e',
    address: '12 rue des Écoles',
    distance: '350 m',
    code: 'BY-2026',
    members: 320,
    coords: { lat: 48.884, lng: 2.312 },
    rav: {
      name: 'Rav Yaacov Attias',
      title: 'Rabbin de la communauté',
      photo: require('../../assets/rav.png') as ImageSourcePropType,
    },
  },
  {
    id: 'habad',
    name: 'Beth Habad',
    rite: 'Habad Loubavitch',
    city: 'Paris 17e',
    address: '5 avenue de Villiers',
    distance: '1,2 km',
    code: 'HB-7700',
    members: 180,
    rav: {
      name: 'Rav Mena’hem Lévy',
      title: 'Chalia’h du Rabbi',
    },
  },
  {
    id: 'ortorah',
    name: 'Or Torah',
    rite: 'Ashkénaze',
    city: 'Paris 16e',
    address: '28 rue de la Pompe',
    distance: '2,4 km',
    code: 'OT-1800',
    members: 140,
    rav: {
      name: 'Rav Élie Weil',
      title: 'Rabbin de la communauté',
    },
  },
  {
    id: 'ohelmoche',
    name: 'Ohel Moché',
    rite: 'Séfarade',
    city: 'Levallois',
    address: '3 rue Voltaire',
    distance: '3,1 km',
    code: 'OM-0613',
    members: 95,
    rav: {
      name: 'Rav Chimon Bitton',
      title: 'Rabbin de la communauté',
    },
  },
];

export const DEFAULT_CONGREGATION = 'sefarade';

export function findCongregation(id: string): Congregation {
  return congregations.find((c) => c.id === id) ?? congregations[0];
}

export function findByCode(code: string): Congregation | undefined {
  const norm = code.replace(/[\s-]/g, '').toUpperCase();
  return congregations.find((c) => c.code.replace(/[\s-]/g, '').toUpperCase() === norm);
}
