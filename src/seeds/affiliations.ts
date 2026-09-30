import { CommunityId, CommunityGroup, ReligiousCurrent } from '../types';

// Courants religieux et groupes (fédérations, réseaux) par confession, pour la démo.
// Un rabbin rattache sa communauté à un courant et, s'il le souhaite, à un groupe (ou en crée un et en devient chef).
export interface AffiliationSeed {
  currents: ReligiousCurrent[];
  groups: CommunityGroup[];
  // Rattachement des communautés de démo : id de communauté → courant et groupe
  assignments: Record<string, { currentId: string; groupId?: string }>;
}

export const affiliations: Record<CommunityId, AffiliationSeed> = {
  jewish: {
    currents: [
      { id: 'sefarade', name: 'Séfarade' },
      { id: 'ashkenaze', name: 'Ashkénaze' },
      { id: 'habad', name: 'Habad Loubavitch' },
      { id: 'breslev', name: 'Breslev' },
      { id: 'yemenite', name: 'Yéménite' },
      { id: 'massorti', name: 'Massorti' },
      { id: 'liberal', name: 'Libéral' },
    ],
    groups: [
      { id: 'consistoire', name: 'Consistoire de Paris', description: 'Réseau consistorial des synagogues de Paris et d’Île-de-France.', headCongregationId: 'ext-consistoire' },
      { id: 'beth-loubavitch', name: 'Beth Loubavitch', description: 'Réseau des centres Habad en France.', currentId: 'habad', headCongregationId: 'ext-loubavitch' },
      { id: 'massorti-france', name: 'Massorti France', description: 'Communautés du judaïsme massorti.', currentId: 'massorti', headCongregationId: 'ext-massorti' },
      { id: 'ulif', name: 'Union libérale israélite de France', description: 'Communautés du judaïsme libéral.', currentId: 'liberal', headCongregationId: 'ext-ulif' },
    ],
    assignments: {
      sefarade: { currentId: 'sefarade', groupId: 'consistoire' },
      habad: { currentId: 'habad', groupId: 'beth-loubavitch' },
      ortorah: { currentId: 'ashkenaze', groupId: 'consistoire' },
      ohelmoche: { currentId: 'sefarade' },
    },
  },
  muslim: {
    currents: [
      { id: 'sunnite', name: 'Sunnite' },
      { id: 'chiite', name: 'Chiite' },
      { id: 'soufi', name: 'Soufi' },
      { id: 'ibadite', name: 'Ibadite' },
    ],
    groups: [
      { id: 'grande-mosquee', name: 'Fédération de la Grande Mosquée de Paris', description: 'Réseau de mosquées rattachées à la Grande Mosquée de Paris.', currentId: 'sunnite', headCongregationId: 'ext-gmp' },
      { id: 'mdf', name: 'Musulmans de France', description: 'Fédération d’associations musulmanes.', currentId: 'sunnite', headCongregationId: 'ext-mdf' },
      { id: 'ccmtf', name: 'Comité de coordination des musulmans turcs de France', description: 'Mosquées de tradition turque.', currentId: 'sunnite', headCongregationId: 'ext-ccmtf' },
    ],
    assignments: {
      alfath: { currentId: 'sunnite', groupId: 'grande-mosquee' },
      assalam: { currentId: 'sunnite', groupId: 'ccmtf' },
      annour: { currentId: 'sunnite' },
    },
  },
  christian: {
    currents: [
      { id: 'catholique', name: 'Catholique' },
      { id: 'protestant', name: 'Protestant' },
      { id: 'orthodoxe', name: 'Orthodoxe' },
      { id: 'evangelique', name: 'Évangélique' },
      { id: 'anglican', name: 'Anglican' },
    ],
    groups: [
      { id: 'diocese-paris', name: 'Diocèse de Paris', description: 'Paroisses catholiques de Paris.', currentId: 'catholique', headCongregationId: 'ext-diocese' },
      { id: 'epudf', name: 'Église protestante unie de France', description: 'Paroisses luthériennes et réformées.', currentId: 'protestant', headCongregationId: 'ext-epudf' },
      { id: 'cnef', name: 'Conseil national des évangéliques de France', description: 'Églises évangéliques.', currentId: 'evangelique', headCongregationId: 'ext-cnef' },
      { id: 'archeveche-orthodoxe', name: 'Archevêché des églises orthodoxes russes', description: 'Paroisses orthodoxes de tradition russe.', currentId: 'orthodoxe', headCongregationId: 'ext-archeveche' },
    ],
    assignments: {
      stferdinand: { currentId: 'catholique', groupId: 'diocese-paris' },
      batignolles: { currentId: 'protestant', groupId: 'epudf' },
      stalexandre: { currentId: 'orthodoxe', groupId: 'archeveche-orthodoxe' },
      hillsong: { currentId: 'evangelique', groupId: 'cnef' },
    },
  },
  buddhist: {
    currents: [
      { id: 'theravada', name: 'Theravada' },
      { id: 'mahayana', name: 'Mahayana' },
      { id: 'zen', name: 'Zen' },
      { id: 'vajrayana', name: 'Vajrayana (tibétain)' },
      { id: 'nichiren', name: 'Nichiren' },
    ],
    groups: [
      { id: 'ubf', name: 'Union bouddhiste de France', description: 'Fédération des associations bouddhistes en France.', headCongregationId: 'ext-ubf' },
      { id: 'azi', name: 'Association Zen Internationale', description: 'Dojos zen de la lignée Deshimaru.', currentId: 'zen', headCongregationId: 'ext-azi' },
    ],
    assignments: {
      khanhanh: { currentId: 'theravada', groupId: 'ubf' },
      dojo: { currentId: 'zen', groupId: 'azi' },
      kagyu: { currentId: 'vajrayana', groupId: 'ubf' },
    },
  },
};
