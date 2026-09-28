import { CommunityId } from '../types';
import { ReligionSeed } from './types';
import { jewishSeed } from './jewish';
import { muslimSeed } from './muslim';
import { christianSeed } from './christian';
import { buddhistSeed } from './buddhist';

export const seeds: Record<CommunityId, ReligionSeed> = {
  jewish: jewishSeed,
  muslim: muslimSeed,
  christian: christianSeed,
  buddhist: buddhistSeed,
};

export function getSeed(id: CommunityId): ReligionSeed {
  return seeds[id];
}

export type { ReligionSeed } from './types';
