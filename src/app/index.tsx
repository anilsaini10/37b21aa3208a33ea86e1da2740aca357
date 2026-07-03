/**
 * App root — composes the provider tree:
 *   GestureHandler → SafeArea → QueryClient → Theme → PaperProvider → Navigation
 */
import React, {useMemo} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClientProvider} from '@tanstack/react-query';
import {PaperProvider, MD3DarkTheme, MD3LightTheme} from 'react-native-paper';
import {ThemeProvider, useTheme} from '../core/theme';
import {LanguageProvider} from '../core/i18n';
import {queryClient} from '../core/query/queryClient';
import {RootNavigator} from '../navigation/RootNavigator';
import {bootstrap} from './bootstrap';

// Run one-time setup at module load (registers MMKV + hydrates auth).
bootstrap();

/** Bridges our theme tokens into React Native Paper's theme. */
function PaperBridge({children}: {children: React.ReactNode}): React.JSX.Element {
  const {theme} = useTheme();
  const paperTheme = useMemo(() => {
    const base = theme.dark ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        surface: theme.colors.surface,
        error: theme.colors.error,
      },
    };
  }, [theme]);
  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}


export default function RootApp(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <ThemeProvider>
              <PaperBridge>
                <RootNavigator />
              </PaperBridge>
            </ThemeProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
