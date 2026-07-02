/** Entry screen — choose which portal to log into. */
import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  AppText,
  CustomCard,
  Icon,
  Spacer,
  Row,
} from '../../../shared/components';
import type {AuthScreenProps} from '../../../navigation/types';
import type {UserRole} from '../../../shared/types';

const ROLES: {role: UserRole; title: string; desc: string; icon: string}[] = [
  {role: 'admin', title: 'Administrator', desc: 'Manage the entire school', icon: 'settings'},
  {role: 'teacher', title: 'Teacher', desc: 'Classes, attendance & marks', icon: 'teacher'},
  {role: 'parent', title: 'Parent', desc: "Track your child's progress", icon: 'parent'},
];

export function RoleSelectScreen({navigation}: AuthScreenProps<'RoleSelect'>): React.JSX.Element {
  const {theme} = useTheme();

  const onSelect = (role: UserRole) => {
    if (role === 'parent') {
      navigation.navigate('ParentLogin');
    } else {
      navigation.navigate('Login', {role});
    }
  };

  return (
    <Screen scroll>
      <View style={{alignItems: 'center', marginTop: theme.spacing.xxl, marginBottom: theme.spacing.xl}}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.primary + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="class" size={44} color={theme.colors.primary} />
        </View>
        <Spacer size={16} />
        <AppText variant="h1" center>
          Greenwood School
        </AppText>
        <AppText variant="caption" color="textSecondary" center>
          School Management System
        </AppText>
      </View>

      <AppText variant="h3" style={{marginBottom: theme.spacing.md}}>
        Continue as
      </AppText>

      {ROLES.map(item => (
        <CustomCard
          key={item.role}
          onPress={() => onSelect(item.role)}
          style={{marginBottom: theme.spacing.md}}>
          <Row gap={theme.spacing.md}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.surfaceVariant,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name={item.icon} size={24} />
            </View>
            <View style={{flex: 1}}>
              <AppText variant="bodyBold">{item.title}</AppText>
              <AppText variant="caption" color="textSecondary">
                {item.desc}
              </AppText>
            </View>
            <Icon name="forward" size={22} color={theme.colors.textMuted} />
          </Row>
        </CustomCard>
      ))}
    </Screen>
  );
}
