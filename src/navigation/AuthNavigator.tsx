/** Auth flow stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {AuthStackParamList} from './types';
import {RoleSelectScreen} from '../features/auth/screens/RoleSelectScreen';
import {LoginScreen} from '../features/auth/screens/LoginScreen';
import {ParentLoginScreen} from '../features/auth/screens/ParentLoginScreen';
import {ForgotPasswordScreen} from '../features/auth/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ParentLogin" component={ParentLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
