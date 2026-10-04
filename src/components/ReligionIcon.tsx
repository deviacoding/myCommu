import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityId } from '../types';
import { GreekCross } from './GreekCross';

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Nom d'icône de confession : un nom MaterialCommunityIcons, ou 'greek-cross' (croix à bras égaux, dessinée en SVG).
export type ReligionIconName = MciName | 'greek-cross';

export const GREEK_CROSS = 'greek-cross';

// Icône de chaque confession. La croix chrétienne est une croix grecque (quatre bras de même longueur),
// que MaterialCommunityIcons ne propose pas : elle est rendue par GreekCross.
export const religionIcons: Record<CommunityId, ReligionIconName> = {
  jewish: 'star-david',
  muslim: 'star-crescent',
  christian: GREEK_CROSS,
  buddhist: 'meditation',
};

interface IconByNameProps {
  icon: string; // ReligionIconName, ou toute chaîne stockée (seeds, profils)
  size?: number;
  color?: string;
}

// Rend une icône par son nom : GreekCross pour 'greek-cross', MaterialCommunityIcons sinon.
export function IconByName({ icon, size = 24, color = '#000' }: IconByNameProps) {
  if (icon === GREEK_CROSS) return <GreekCross size={size} color={color} />;
  return <MaterialCommunityIcons name={icon as MciName} size={size} color={color} />;
}

interface ReligionIconProps {
  community: CommunityId;
  size?: number;
  color?: string;
}

// Icône d'une confession.
export function ReligionIcon({ community, size = 24, color = '#000' }: ReligionIconProps) {
  return <IconByName icon={religionIcons[community]} size={size} color={color} />;
}
