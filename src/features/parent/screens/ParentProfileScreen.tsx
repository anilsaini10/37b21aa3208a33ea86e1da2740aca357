/** Parent profile — photo hero identity, navigation menu, logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomButton,
  ProfileHero,
  MoreMenuTile,
  moreMenuAccentForIndex,
  Spacer,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {P, type PermissionKey} from '../../../core/config/permissions';
import {usePermissionGate} from '../../auth/usePermissionGate';
import {TestPaymentButton} from '../../subscription/components/TestPaymentButton';
import type {ParentStackParamList, ParentTabParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

type MenuRoute = 'ChildProfile' | 'ChildTimetable' | 'Results' | 'Fees' | 'Announcements' | 'Events' | 'Chat' | 'Leave' | 'AcademicCalendar' | 'SubscriptionPlans' | 'ChangePassword' | 'ParentSyllabusOverview';

const MENU: {labelKey: TranslationKey; icon: string; route: MenuRoute; permission?: PermissionKey}[] = [
  {labelKey: 'parentProfile_childProfile', icon: 'student', route: ScreenNames.ChildProfile, permission: P.PROFILE_VIEW},
  {labelKey: 'results_title', icon: 'exam', route: ScreenNames.Results, permission: P.EXAMS_VIEW},
  {labelKey: 'teacherProfile_timetable', icon: 'timetable', route: ScreenNames.ChildTimetable, permission: P.TIMETABLE_VIEW},
  {labelKey: 'syllabus_childSyllabus', icon: 'homework', route: ScreenNames.ParentSyllabusOverview, permission: P.SYLLABUS_VIEW},
  // {labelKey: 'parentFees_headerTitle', icon: 'fee', route: ScreenNames.Fees, permission: P.FEES_MODULE},
  {labelKey: 'teacherProfile_announcements', icon: 'announcement', route: ScreenNames.Announcements, permission: P.ANNOUNCEMENTS_VIEW},
  {labelKey: 'eventsManage_headerTitle', icon: 'event', route: ScreenNames.Events, permission: P.EVENTS_VIEW},
  {labelKey: 'calendar_title', icon: 'calendar', route: ScreenNames.AcademicCalendar, permission: P.CALENDAR_VIEW},
  // {labelKey: 'parentProfile_chatWithTeacher', icon: 'chat', route: ScreenNames.Chat},
  {labelKey: 'parentProfile_leaveApplication', icon: 'calendar', route: ScreenNames.Leave, permission: P.LEAVE_VIEW},
  {labelKey: 'subscription_title', icon: 'card', route: ScreenNames.SubscriptionPlans, permission: P.SUBSCRIPTION_VIEW},
  {labelKey: 'teacherProfile_changePassword', icon: 'lock', route: ScreenNames.ChangePassword},
];

export function ParentProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const tabNavigation = useNavigation<BottomTabNavigationProp<ParentTabParamList>>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const {gate, PermissionModal} = usePermissionGate();
  const styles = useThemedStyles(t2 => ({
    content: {
      padding: t2.spacing.lg,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -t2.spacing.xs,
    },
    gridItem: {
      width: '33.333%',
      paddingHorizontal: t2.spacing.xs,
      marginBottom: t2.spacing.sm,
    },
  }));

  return (
    <Screen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHero
          name={user?.name ?? t('parentProfile_parent')}
          avatarUri={user?.avatarUrl}
          lines={[user?.phone, user?.email]}
          badgeLabel={t('parentProfile_parent')}
          onBack={() => tabNavigation.navigate(ScreenNames.Dashboard)}
          title={t('parentProfile_profile')}
        />

        <View style={styles.content}>
          <Spacer size={4} />
          <View style={styles.grid}>
            {MENU.map((item, index) => (
              <View key={item.route} style={styles.gridItem}>
                <MoreMenuTile
                  icon={item.icon}
                  title={t(item.labelKey)}
                  accentColor={moreMenuAccentForIndex(index)}
                  onPress={gate(item.permission, () => navigation.navigate(item.route))}
                />
              </View>
            ))}
          </View>

          <Spacer size={16} />
          <TestPaymentButton />
          <Spacer size={12} />
          <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
          <Spacer size={24} />
        </View>
      </ScrollView>
      <PermissionModal />
    </Screen>
  );
}
