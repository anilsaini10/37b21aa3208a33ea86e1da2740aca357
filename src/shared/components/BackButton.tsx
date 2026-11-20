import React from 'react';
import {Pressable, type StyleProp, type ViewStyle} from 'react-native';
import {useTheme} from '../../core/theme';
import {Icon} from './Icon';

const DEFAULT_SIZE = 24;

export interface BackButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({onPress, color, size = DEFAULT_SIZE, style}: BackButtonProps): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={10} style={style}>
      <Icon name="back" size={size} color={color ?? theme.colors.text} />
    </Pressable>
  );
}
