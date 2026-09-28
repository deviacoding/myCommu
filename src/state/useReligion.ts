import { useTheme } from '../theme/ThemeProvider';
import { religions, ReligionProfile } from '../config/religions';
import { getSeed, ReligionSeed } from '../seeds';

// Vocabulaire et contenus de la confession courante (choisie à l'entrée dans la démo).
export function useReligion(): { profile: ReligionProfile; seed: ReligionSeed } {
  const { community } = useTheme();
  return { profile: religions[community], seed: getSeed(community) };
}
