/** Small status pill. */
import React from 'react';
import {View} from 'react-native';
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

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: BadgeTone;
}): React.JSX.Element {
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
    <View style={[styles.badge, {backgroundColor: color + '22'}]}>
      <AppText variant="label" style={{color}}>
        {label}
      </AppText>
    </View>
  );
}
