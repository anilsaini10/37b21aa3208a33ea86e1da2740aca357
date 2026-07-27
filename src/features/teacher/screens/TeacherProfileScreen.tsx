/** Teacher profile — photo hero identity, quick links, and logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomCard,
  CustomButton,
  ProfileHero,
  ListRow,
  SectionTitle,
  Spacer,
} from '../../../shared/components';
import {capitalize} from '../../../shared/helpers';
import {useAuthStore} from '../../auth/authStore';
import type {TeacherStackParamList, TeacherTabParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const MENU: {
  icon: string;
  titleKey: TranslationKey;
  route: 'MyProfile' | 'MySchedule' | 'Announcements' | 'Events' | 'Chat' | 'Leave' | 'MyLeave' | 'MyAttendance' | 'ChangePassword';
}[] = [
  {icon: 'profile', titleKey: 'teacherMyProfile_title', route: ScreenNames.MyProfile},
  {icon: 'timetable', titleKey: 'teacherProfile_timetable', route: ScreenNames.MySchedule},
  {icon: 'attendance', titleKey: 'teacherProfile_myAttendance', route: ScreenNames.MyAttendance},
  {icon: 'announcement', titleKey: 'teacherProfile_announcements', route: ScreenNames.Announcements},
  {icon: 'event', titleKey: 'eventsManage_headerTitle', route: ScreenNames.Events},
  {icon: 'chat', titleKey: 'teacherProfile_chat', route: ScreenNames.Chat},
  {icon: 'calendar', titleKey: 'teacherProfile_myLeave', route: ScreenNames.MyLeave},
  {icon: 'calendar', titleKey: 'teacherProfile_leaveManagement', route: ScreenNames.Leave},
  {icon: 'lock', titleKey: 'teacherProfile_changePassword', route: ScreenNames.ChangePassword},
];

export function TeacherProfileScreen(): React.JSX.Element {
  const styles = useThemedStyles(t2 => ({
    content: {
      padding: t2.spacing.lg,
    },
    menuCard: {
      paddingHorizontal: t2.spacing.lg,
    },
  }));
  const navigation = useNavigation<Nav>();
  const tabNavigation = useNavigation<BottomTabNavigationProp<TeacherTabParamList>>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHero
          name={user?.name ?? t('teacherProfile_teacher')}
          avatarUri={user?.avatarUrl}
          lines={[user?.email, user?.phone]}
          badgeLabel={capitalize(user?.role ?? 'teacher')}
          onBack={() => tabNavigation.navigate(ScreenNames.Dashboard)}
          title={t('teacherProfile_profile')}
        />

        <View style={styles.content}>
          <SectionTitle title={t('teacherProfile_manage')} />
          <CustomCard padded={false} style={styles.menuCard}>
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
        </View>
      </ScrollView>
    </Screen>
  );
}
