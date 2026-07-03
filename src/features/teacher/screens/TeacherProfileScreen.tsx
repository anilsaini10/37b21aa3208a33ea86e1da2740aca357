/** Teacher profile — identity card, quick links, and logout. */
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
  SectionTitle,
  Row,
  Spacer,
} from '../../../shared/components';
import {capitalize} from '../../../shared/helpers';
import {useAuthStore} from '../../auth/authStore';
import type {TeacherStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const MENU: {icon: string; titleKey: TranslationKey; route: keyof TeacherStackParamList}[] = [
  {icon: 'timetable', titleKey: 'teacherProfile_timetable', route: 'Timetable'},
  {icon: 'announcement', titleKey: 'teacherProfile_announcements', route: 'Announcements'},
  {icon: 'chat', titleKey: 'teacherProfile_chat', route: 'Chat'},
  {icon: 'calendar', titleKey: 'teacherProfile_leaveManagement', route: 'Leave'},
  {icon: 'lock', titleKey: 'teacherProfile_changePassword', route: 'ChangePassword'},
];

export function TeacherProfileScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherProfile_profile')} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={user?.name ?? t('teacherProfile_teacher')} size={64} />
            <View style={{flex: 1}}>
              <AppText variant="h2" numberOfLines={1}>
                {user?.name ?? t('teacherProfile_teacher')}
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

        <SectionTitle title={t('teacherProfile_manage')} />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {MENU.map(item => (
            <ListRow
              key={item.route}
              icon={item.icon}
              title={t(item.titleKey)}
              right={<AppText color="textMuted">›</AppText>}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </CustomCard>

        <Spacer size={24} />
        <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
