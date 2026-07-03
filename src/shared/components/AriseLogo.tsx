/** Arise brand mark — circular badge (parent + teacher nodes rising a student node). */
import React from 'react';
import Svg, {Circle, Defs, Line, LinearGradient, Path, RadialGradient, Stop} from 'react-native-svg';

export interface AriseLogoProps {
  size?: number;
}

export function AriseLogo({size = 96}: AriseLogoProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 1080 1080">
      <Defs>
        <LinearGradient id="ariseBadgeGrad" x1="10%" y1="0%" x2="90%" y2="100%">
          <Stop offset="0%" stopColor="#2F6FB0" />
          <Stop offset="55%" stopColor="#2E4E8F" />
          <Stop offset="100%" stopColor="#3A2E78" />
        </LinearGradient>
        <RadialGradient id="ariseSheen" cx="30%" cy="22%" r="75%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.28} />
          <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.06} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Circle cx={540} cy={540} r={440} fill="url(#ariseBadgeGrad)" />
      <Circle cx={540} cy={540} r={440} fill="url(#ariseSheen)" />
      <Circle cx={540} cy={540} r={440} fill="none" stroke="#FFFFFF" strokeOpacity={0.15} strokeWidth={3} />

      <Path
        d="M213,741 Q540,930 867,741"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={16}
        strokeLinecap="round"
        opacity={0.5}
      />

      <Line x1={213} y1={741} x2={540} y2={383} stroke="#FFFFFF" strokeWidth={22} strokeLinecap="round" />
      <Line x1={867} y1={741} x2={540} y2={383} stroke="#FFFFFF" strokeWidth={22} strokeLinecap="round" />

      <Line x1={540} y1={383} x2={446} y2={320} stroke="#FFFFFF" strokeWidth={13} strokeLinecap="round" opacity={0.8} />
      <Line x1={540} y1={383} x2={634} y2={320} stroke="#FFFFFF" strokeWidth={13} strokeLinecap="round" opacity={0.8} />

      <Circle cx={446} cy={320} r={25} fill="#FFFFFF" opacity={0.9} />
      <Circle cx={634} cy={320} r={25} fill="#FFFFFF" opacity={0.9} />

      <Circle cx={540} cy={383} r={94} fill="none" stroke="#FFFFFF" strokeWidth={13} opacity={0.5} />
      <Circle cx={540} cy={383} r={57} fill="#FFFFFF" />

      <Circle cx={213} cy={741} r={50} fill="#FFFFFF" />
      <Circle cx={867} cy={741} r={50} fill="#FFFFFF" />
    </Svg>
  );
}
