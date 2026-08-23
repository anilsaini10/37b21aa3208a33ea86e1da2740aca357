/** Arise brand mark — a central hub node connecting to top/left/right/bottom nodes (network/hierarchy motif). Fixed brand colors — intentionally not theme-driven, so the mark stays consistent in light and dark mode. */
import React from 'react';
import Svg, {Circle, Line} from 'react-native-svg';

export interface AriseLogoProps {
  size?: number;
}

// Natural artwork size is 200x260 (not square) — height is derived from `size` so the mark never stretches.
const NATURAL_WIDTH = 200;
const NATURAL_HEIGHT = 260;

export function AriseLogo({size = 96}: AriseLogoProps): React.JSX.Element {
  const height = (size / NATURAL_WIDTH) * NATURAL_HEIGHT;
  return (
    <Svg width={size} height={height} viewBox={`0 0 ${NATURAL_WIDTH} ${NATURAL_HEIGHT}`}>
      <Line x1={100} y1={62} x2={100} y2={118} stroke="#1769C2" strokeWidth={7} strokeLinecap="round" />
      <Line x1={100} y1={118} x2={48} y2={153} stroke="#16A6A1" strokeWidth={7} strokeLinecap="round" />
      <Line x1={100} y1={118} x2={153} y2={153} stroke="#18A99F" strokeWidth={7} strokeLinecap="round" />
      <Line x1={100} y1={118} x2={100} y2={217} stroke="#7050B5" strokeWidth={7} strokeLinecap="round" />

      <Circle cx={100} cy={62} r={18} fill="#1769C2" />
      <Circle cx={48} cy={153} r={14} fill="#16A6A1" />
      <Circle cx={153} cy={153} r={14} fill="#18A99F" />
      <Circle cx={100} cy={217} r={14} fill="#7050B5" />
      <Circle cx={100} cy={118} r={14} fill="#1769C2" />
    </Svg>
  );
}
