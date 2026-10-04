import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface GreekCrossProps {
  size?: number;
  color?: string;
}

// Croix grecque : quatre bras de même longueur, bouts légèrement arrondis.
// Même boîte qu'une icône MaterialCommunityIcons de taille `size` (viewBox 24, dessin dans la zone 2..22).
export function GreekCross({ size = 24, color = '#000' }: GreekCrossProps) {
  const arm = 6; // épaisseur des bras (en unités du viewBox)
  const length = 20; // longueur totale, identique pour les deux bras
  const start = (24 - length) / 2;
  const offset = (24 - arm) / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Croix grecque">
      <Rect x={start} y={offset} width={length} height={arm} rx={1.2} fill={color} />
      <Rect x={offset} y={start} width={arm} height={length} rx={1.2} fill={color} />
    </Svg>
  );
}
