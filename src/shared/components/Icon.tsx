/**
 * Icon — a dependency-free icon component.
 *
 * Every icon is a small SVG defined once in `./icons.tsx` (the
 * name → renderer registry). This component just looks up the renderer for
 * `name` and draws it — swapping or adding icons only touches that one file,
 * the `<Icon name="..." />` API here stays identical everywhere else.
 */
import React from 'react';
import {type StyleProp, View, type ViewStyle} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {useTheme} from '../../core/theme';
import {ICONS} from './icons';

const FALLBACK = ({size, color}: {size: number; color: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={3} fill={color} />
  </Svg>
);

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export function Icon({name, size = 20, color, strokeWidth = 1.8, style}: IconProps): React.JSX.Element {
  const {theme} = useTheme();
  const resolvedColor = color ?? theme.colors.text;
  const render = ICONS[name];
  return (
    <View style={[{width: size, height: size}, style]}>
      {render ? render({size, color: resolvedColor, strokeWidth}) : <FALLBACK size={size} color={resolvedColor} />}
    </View>
  );
}
