/** Parent profile — account card, navigation menu, logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
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

const MENU: {labelKey: TranslationKey; icon: string; route: MenuRoute}[] = [
  {labelKey: 'parentProfile_childProfile', icon: 'student', route: 'ChildProfile'},
  {labelKey: 'parentProfile_results', icon: 'grade', route: 'Results'},
  {labelKey: 'teacherProfile_timetable', icon: 'timetable', route: 'Timetable'},
  {labelKey: 'teacherProfile_announcements', icon: 'announcement', route: 'Announcements'},
  {labelKey: 'parentProfile_chatWithTeacher', icon: 'chat', route: 'Chat'},
  {labelKey: 'parentProfile_leaveApplication', icon: 'calendar', route: 'Leave'},
  {labelKey: 'teacherProfile_changePassword', icon: 'lock', route: 'ChangePassword'},
];

export function ParentProfileScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentProfile_profile')} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={user?.name ?? t('parentProfile_parent')} size={64} />
            <View style={{flex: 1}}>
              <AppText variant="h2">{user?.name ?? t('parentProfile_parent')}</AppText>
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
              <Badge label={t('parentProfile_parent')} tone="primary" />
            </View>
          </Row>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {MENU.map(item => (
            <ListRow
              key={item.route}
              icon={item.icon}
              title={t(item.labelKey)}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </CustomCard>

        <Spacer size={theme.spacing.lg} />
        <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
