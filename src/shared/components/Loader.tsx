/** Full-screen / inline loading indicator. */
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';

export function Loader({
  message,
  fullscreen = true,
}: {
  message?: string;
  fullscreen?: boolean;
}): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: t.spacing.xl,
      rowGap: t.spacing.sm,
    },
    fullscreen: {
      flex: 1,
    },
  }));
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <AppText variant="caption" color="textSecondary">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}
