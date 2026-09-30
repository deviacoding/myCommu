import { CommunityId } from '../types';
import { ReligionSeed } from './types';
import { jewishSeed } from './jewish';
import { muslimSeed } from './muslim';
import { christianSeed } from './christian';
import { buddhistSeed } from './buddhist';
import { affiliations } from './affiliations';

type BaseSeed = Omit<ReligionSeed, 'currents' | 'groups'>;

// Ajoute à chaque confession ses courants, ses groupes et le rattachement de ses communautés de démo.
function withAffiliations(id: CommunityId, base: BaseSeed): ReligionSeed {
  const a = affiliations[id];
  const name = (currentId: string) => a.currents.find((c) => c.id === currentId)?.name;
  return {
    ...base,
    currents: a.currents,
    groups: a.groups,
    congregations: base.congregations.map((k0) => {
      const k = { country: 'FR', ...k0 };
      const as = a.assignments[k.id];
      return as ? { ...k, currentId: as.currentId, groupId: as.groupId, rite: name(as.currentId) ?? k.rite } : k;
    }),
  };
}

export const seeds: Record<CommunityId, ReligionSeed> = {
  jewish: withAffiliations('jewish', jewishSeed as BaseSeed),
  muslim: withAffiliations('muslim', muslimSeed as BaseSeed),
  christian: withAffiliations('christian', christianSeed as BaseSeed),
  buddhist: withAffiliations('buddhist', buddhistSeed as BaseSeed),
};

export function getSeed(id: CommunityId): ReligionSeed {
  return seeds[id];
}

export type { ReligionSeed } from './types';
