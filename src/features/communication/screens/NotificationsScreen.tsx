/** Notification center — shared across all roles, real backend (independent of FCM). */
import React, {useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomButton,
  ListRow,
  EmptyState,
  Loader,
  Badge,
  Row,
  Pagination,
} from '../../../shared/components';
import {timeAgo} from '../../../core/utils/format';
import {useAuthStore} from '../../auth/authStore';
import {displayLocalNotification, getDeviceToken} from '../../../core/notifications';
import {useNotificationsList, useMarkNotificationRead, useMarkAllNotificationsRead} from '../notifications.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AppNotification} from '../../../shared/types';

const TYPE_ICON: Record<string, string> = {
  ANNOUNCEMENT: 'announcement',
  EVENT: 'event',
  LEAVE_REQUEST: 'calendar',
  TEACHER_LEAVE_REQUEST: 'calendar',
  GENERAL: 'notification',
};

type ReadFilter = 'ALL' | 'UNREAD';
const PAGE_SIZE = 20;

type LooseNav = {navigate: (route: string, params?: object) => void; goBack: () => void};

export function NotificationsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<LooseNav>();
  const role = useAuthStore(s => s.user?.role);

  const [filter, setFilter] = useState<ReadFilter>('ALL');
  const [page, setPage] = useState(1);
  const [localReadOverride, setLocalReadOverride] = useState<Record<string, boolean>>({});

  const {data, isLoading, isRefetching, isError, error, refetch} = useNotificationsList({
    page,
    pageSize: PAGE_SIZE,
    isRead: filter === 'UNREAD' ? false : undefined,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const styles = useThemedStyles(t2 => ({
    testButton: {
      marginHorizontal: t2.spacing.lg,
      marginTop: t2.spacing.md,
    },
    filterRow: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md, paddingBottom: t2.spacing.sm},
    tab: {
      paddingHorizontal: t2.spacing.md,
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.pill,
    },
    listContent: {padding: t2.spacing.lg, paddingTop: t2.spacing.sm, flexGrow: 1},
    metaBlock: {alignItems: 'flex-end'},
    rowWrap: {borderRadius: t2.radius.md, paddingHorizontal: t2.spacing.sm},
  }));

  const sendTestNotification = () => {
    displayLocalNotification({
      title: 'Test notification',
      body: 'This is a test local notification from notifee.',
      category: 'general',
    });
  };

  const logDeviceToken = () => {
    getDeviceToken().then(token => {
      console.log('FCM device token:', token);
    });
  };

  const isItemRead = (item: AppNotification): boolean => localReadOverride[item.id] ?? item.isRead;

  const navigateForType = (item: AppNotification): void => {
    switch (item.type) {
      case 'ANNOUNCEMENT':
        navigation.navigate(ScreenNames.Announcements);
        break;
      case 'EVENT':
        navigation.navigate(ScreenNames.Events);
        break;
      case 'LEAVE_REQUEST':
        navigation.navigate(ScreenNames.Leave);
        break;
      case 'TEACHER_LEAVE_REQUEST':
        navigation.navigate(role === 'teacher' ? ScreenNames.MyLeave : ScreenNames.Leave);
        break;
      default:
        break;
    }
  };

  const onRowPress = (item: AppNotification): void => {
    if (!isItemRead(item)) {
      setLocalReadOverride(prev => ({...prev, [item.id]: true}));
      markRead.mutate(item.id, {
        onError: () => setLocalReadOverride(prev => ({...prev, [item.id]: false})),
      });
    }
    navigateForType(item);
  };

  if (isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('notifications_title')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  if (isLoading || !data) {
    return <Loader message={t('notifications_loadingNotifications')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title={t('notifications_title')} onBack={() => navigation.goBack()} />
      <CustomButton
        title="Send Notifee notification"
        onPress={sendTestNotification}
        variant="outline"
        size="sm"
        style={styles.testButton}
      />
      <CustomButton
        title="Log FCM device token"
        onPress={logDeviceToken}
        variant="outline"
        size="sm"
        style={styles.testButton}
      />
      <Row justify="space-between" align="center" style={styles.filterRow}>
        <Row gap={theme.spacing.xs}>
          {(['ALL', 'UNREAD'] as ReadFilter[]).map(value => {
            const active = filter === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  setFilter(value);
                  setPage(1);
                }}
                style={[styles.tab, {backgroundColor: active ? theme.colors.primary : theme.colors.primary + '14'}]}>
                <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.primary}}>
                  {value === 'ALL' ? t('common_all') : t('notifications_unread')}
                </AppText>
              </Pressable>
            );
          })}
        </Row>
        <CustomButton
          title={t('notifications_markAllRead')}
          variant="ghost"
          size="sm"
          fullWidth={false}
          disabled={data.unreadCount === 0 || markAllRead.isPending}
          loading={markAllRead.isPending}
          onPress={() => markAllRead.mutate()}
        />
      </Row>
      <FlatList
        data={data.items}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.listContent}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={
          <EmptyState
            title={filter === 'UNREAD' ? t('notifications_allCaughtUp') : t('notifications_noNotifications')}
            icon="notification"
          />
        }
        renderItem={({item}) => {
          const read = isItemRead(item);
          return (
            <View
              style={[
                styles.rowWrap,
                {opacity: read ? 0.6 : 1, backgroundColor: read ? 'transparent' : theme.colors.primary + '0D'},
              ]}>
              <ListRow
                icon={TYPE_ICON[item.type] ?? 'notification'}
                title={item.title}
                subtitle={item.body}
                right={
                  <View style={styles.metaBlock}>
                    <AppText variant="label" color="textMuted">
                      {timeAgo(item.createdAt)}
                    </AppText>
                    {!read ? <Badge label={t('notifications_new')} tone="primary" /> : null}
                  </View>
                }
                onPress={() => onRowPress(item)}
              />
            </View>
          );
        }}
        ListFooterComponent={
          data.items.length > 0 ? <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /> : null
        }
      />
    </Screen>
  );
}
