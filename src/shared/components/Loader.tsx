/** Full-screen / inline loading indicator. */
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';

export function Loader({
  message,
  fullscreen = true,
}: {
  message?: string;
  fullscreen?: boolean;
}): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <View
      style={{
        flex: fullscreen ? 1 : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        rowGap: theme.spacing.sm,
      }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <AppText variant="caption" color="textSecondary">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}
