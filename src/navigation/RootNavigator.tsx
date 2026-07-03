/**
 * Root navigator — swaps between the Auth flow and the role-specific navigator
 * based on the auth store. Changing role/login state re-renders this and moves
 * the user to the correct stack automatically.
 */
import React, {useCallback} from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';
import {useTheme} from '../core/theme';
import {useAuthStore} from '../features/auth/authStore';
import type {RootStackParamList} from './types';
import {ScreenNames} from './ScreenNames';
import {AuthNavigator} from './AuthNavigator';
import {AdminNavigator} from './AdminNavigator';
import {TeacherNavigator} from './TeacherNavigator';
import {ParentNavigator} from './ParentNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const {theme} = useTheme();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const role = useAuthStore(s => s.user?.role);

  const navTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme : DefaultTheme).colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
  };

  const onReady = useCallback(() => {
    BootSplash.hide({fade: true});
  }, []);

  return (
    <NavigationContainer theme={navTheme} onReady={onReady}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <Stack.Screen name={ScreenNames.Auth} component={AuthNavigator} />
        ) : role === 'admin' ? (
          <Stack.Screen name={ScreenNames.Admin} component={AdminNavigator} />
        ) : role === 'teacher' ? (
          <Stack.Screen name={ScreenNames.Teacher} component={TeacherNavigator} />
        ) : (
          <Stack.Screen name={ScreenNames.Parent} component={ParentNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
