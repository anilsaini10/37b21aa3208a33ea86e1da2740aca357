/** Teacher profile — identity card, quick links, and logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  Avatar,
  Badge,
  ListRow,
  SectionTitle,
  Row,
  Spacer,
} from '../../../shared/components';
import {capitalize} from '../../../shared/helpers';
import {useAuthStore} from '../../auth/authStore';
import type {TeacherStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const MENU: {icon: string; title: string; route: keyof TeacherStackParamList}[] = [
  {icon: 'timetable', title: 'Timetable', route: 'Timetable'},
  {icon: 'announcement', title: 'Announcements', route: 'Announcements'},
  {icon: 'chat', title: 'Chat', route: 'Chat'},
  {icon: 'calendar', title: 'Leave Management', route: 'Leave'},
  {icon: 'lock', title: 'Change Password', route: 'ChangePassword'},
];

export function TeacherProfileScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen padded={false}>
      <CustomHeader title="Profile" />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={user?.name ?? 'Teacher'} size={64} />
            <View style={{flex: 1}}>
              <AppText variant="h2" numberOfLines={1}>
                {user?.name ?? 'Teacher'}
              </AppText>
              {user?.email ? (
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {user.email}
                </AppText>
              ) : null}
              {user?.phone ? (
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {user.phone}
                </AppText>
              ) : null}
              <Spacer size={6} />
              <Badge label={capitalize(user?.role ?? 'teacher')} tone="primary" />
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title="Manage" />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {MENU.map(item => (
            <ListRow
              key={item.route}
              icon={item.icon}
              title={item.title}
              right={<AppText color="textMuted">›</AppText>}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </CustomCard>

        <Spacer size={24} />
        <CustomButton title="Logout" variant="danger" iconLeft="logout" onPress={() => logout()} />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
