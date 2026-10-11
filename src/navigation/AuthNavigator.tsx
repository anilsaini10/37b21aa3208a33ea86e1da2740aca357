/** Auth flow stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {AuthStackParamList} from './types';
import {ScreenNames} from './ScreenNames';
import {RoleSelectScreen} from '../features/auth/screens/RoleSelectScreen';
import {SelectSchoolScreen} from '../features/auth/screens/SelectSchoolScreen';
import {LoginScreen} from '../features/auth/screens/LoginScreen';
import {OtpLoginScreen} from '../features/auth/screens/OtpLoginScreen';
import {SignUpScreen} from '../features/auth/screens/SignUpScreen';
import {ForgotPasswordScreen} from '../features/auth/screens/ForgotPasswordScreen';
import {ResetPasswordScreen} from '../features/auth/screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ScreenNames.RoleSelect} component={RoleSelectScreen} />
      <Stack.Screen name={ScreenNames.SelectSchool} component={SelectSchoolScreen} />
      <Stack.Screen name={ScreenNames.Login} component={LoginScreen} />
      <Stack.Screen name={ScreenNames.OtpLogin} component={OtpLoginScreen} />
      <Stack.Screen name={ScreenNames.SignUp} component={SignUpScreen} />
      <Stack.Screen name={ScreenNames.ForgotPassword} component={ForgotPasswordScreen} />
      <Stack.Screen name={ScreenNames.ResetPassword} component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
