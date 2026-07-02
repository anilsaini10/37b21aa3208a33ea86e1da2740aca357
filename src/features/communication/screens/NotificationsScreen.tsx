/** Notification center — shared across all roles. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  AppText,
  CustomHeader,
  ListRow,
  EmptyState,
  Loader,
  Badge,
} from '../../../shared/components';
import {timeAgo} from '../../../core/utils/format';
import {useNotifications, useMarkNotificationRead} from '../communication.service';

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
  const navigation = useNavigation();
  const {data, isLoading} = useNotifications();
  const markRead = useMarkNotificationRead();

  if (isLoading || !data) {
    return <Loader message="Loading notifications…" />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title="Notifications" onBack={() => navigation.goBack()} />
      <FlatList
        data={data}
        keyExtractor={n => n.id}
        contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}
        ListEmptyComponent={<EmptyState title="No notifications" icon="notification" />}
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
                <View style={{alignItems: 'flex-end'}}>
                  <AppText variant="label" color="textMuted">
                    {timeAgo(item.createdAt)}
                  </AppText>
                  {!item.read ? <Badge label="New" tone="primary" /> : null}
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
