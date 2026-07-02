/** Parent profile — account card, navigation menu, logout. */
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
  Row,
  Spacer,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import type {ParentStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

type MenuRoute = 'ChildProfile' | 'Results' | 'Timetable' | 'Announcements' | 'Chat' | 'Leave' | 'ChangePassword';

const MENU: {label: string; icon: string; route: MenuRoute}[] = [
  {label: 'Child Profile', icon: 'student', route: 'ChildProfile'},
  {label: 'Results', icon: 'grade', route: 'Results'},
  {label: 'Timetable', icon: 'timetable', route: 'Timetable'},
  {label: 'Announcements', icon: 'announcement', route: 'Announcements'},
  {label: 'Chat with Teacher', icon: 'chat', route: 'Chat'},
  {label: 'Leave Application', icon: 'calendar', route: 'Leave'},
  {label: 'Change Password', icon: 'lock', route: 'ChangePassword'},
];

export function ParentProfileScreen(): React.JSX.Element {
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
            <Avatar name={user?.name ?? 'Parent'} size={64} />
            <View style={{flex: 1}}>
              <AppText variant="h2">{user?.name ?? 'Parent'}</AppText>
              {user?.phone ? (
                <AppText variant="caption" color="textSecondary">
                  {user.phone}
                </AppText>
              ) : null}
              {user?.email ? (
                <AppText variant="caption" color="textSecondary">
                  {user.email}
                </AppText>
              ) : null}
              <Spacer size={6} />
              <Badge label="Parent" tone="primary" />
            </View>
          </Row>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {MENU.map(item => (
            <ListRow
              key={item.route}
              icon={item.icon}
              title={item.label}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </CustomCard>

        <Spacer size={theme.spacing.lg} />
        <CustomButton title="Logout" variant="danger" iconLeft="logout" onPress={() => logout()} />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
