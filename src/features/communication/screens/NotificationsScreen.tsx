/** Notification center — shared across all roles. */
import React from 'react';
import {FlatList, View} from 'react-native';
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
} from '../../../shared/components';
import {timeAgo} from '../../../core/utils/format';
import {useNotifications, useMarkNotificationRead} from '../communication.service';
import {displayLocalNotification, getDeviceToken} from '../../../core/notifications';

const TYPE_ICON: Record<string, string> = {
  fee: 'fee',
  attendance: 'attendance',
  exam: 'exam',
  homework: 'homework',
  announcement: 'announcement',
  general: 'notification',
};

export function NotificationsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const {data, isLoading} = useNotifications();
  const markRead = useMarkNotificationRead();
  const styles = useThemedStyles(t2 => ({
    listContent: {
      padding: t2.spacing.lg,
      flexGrow: 1,
    },
    metaBlock: {
      alignItems: 'flex-end',
    },
    testButton: {
      marginHorizontal: t2.spacing.lg,
      marginTop: t2.spacing.md,
    },
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
      <FlatList
        data={data}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState title={t('notifications_noNotifications')} icon="notification" />}
        renderItem={({item}) => (
          <View
            style={{
              opacity: item.read ? 0.6 : 1,
              backgroundColor: item.read ? 'transparent' : theme.colors.primary + '0D',
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.sm,
            }}>
            <ListRow
              icon={TYPE_ICON[item.type] ?? 'notification'}
              title={item.title}
              subtitle={item.body}
              right={
                <View style={styles.metaBlock}>
                  <AppText variant="label" color="textMuted">
                    {timeAgo(item.createdAt)}
                  </AppText>
                  {!item.read ? <Badge label={t('notifications_new')} tone="primary" /> : null}
                </View>
              }
              onPress={() => !item.read && markRead.mutate(item.id)}
            />
          </View>
        )}
      />
    </Screen>
  );
}
