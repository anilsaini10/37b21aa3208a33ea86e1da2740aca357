/** Small status pill. */
import React from 'react';
import {View, type StyleProp, type TextStyle, type ViewStyle} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const TONES: Record<BadgeTone, keyof import('../../core/theme').ThemeColors> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  neutral: 'textMuted',
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Caps the label to N lines with an ellipsis (tail) once it's set — e.g. a long name in a width-constrained badge. Omit to keep the default single-line, no-truncate behavior. */
  numberOfLines?: number;
  /** Overrides the pill's outer container style — e.g. a maxWidth so `numberOfLines` has something to truncate against. */
  style?: StyleProp<ViewStyle>;
  /** Overrides the label text's own style — e.g. a smaller fontSize. Merged on top of the default color, so pass `color` here only if you also want to override that. */
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({label, tone = 'neutral', numberOfLines, style, textStyle}: BadgeProps): React.JSX.Element {
  const {theme} = useTheme();
  const color = theme.colors[TONES[tone]];
  const styles = useThemedStyles(t => ({
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: t.spacing.sm,
      paddingVertical: 2,
      borderRadius: t.radius.pill,
    },
  }));
  return (
    <View style={[styles.badge, {backgroundColor: color + '22'}, style]}>
      <AppText
        variant="label"
        style={[{color}, textStyle]}
        numberOfLines={numberOfLines}
        ellipsizeMode={numberOfLines ? 'tail' : undefined}>
        {label}
      </AppText>
    </View>
  );
}
