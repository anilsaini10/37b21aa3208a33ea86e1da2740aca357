/** Announcements / notices / circulars — shared list screen. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  Badge,
  EmptyState,
  Loader,
  Icon,
  Row,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useAnnouncements} from '../communication.service';
import {useAuthStore} from '../../auth/authStore';
import type {Announcement} from '../../../shared/types';
import type {BadgeTone} from '../../../shared/components';

function categoryTone(category: Announcement['category']): BadgeTone {
  switch (category) {
    case 'urgent':
      return 'error';
    case 'event':
      return 'success';
    case 'circular':
      return 'info';
    case 'notice':
    default:
      return 'neutral';
  }
}

/**
 * Reused by Admin/Teacher/Parent stacks. When the signed-in user is an admin,
 * a header "add" action navigates to the AnnouncementForm route (present only
 * in the admin stack).
 */
export function AnnouncementsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<{navigate: (route: string) => void; goBack: () => void}>();
  const role = useAuthStore(s => s.user?.role);
  const {data, isLoading} = useAnnouncements(role);

  if (isLoading || !data) {
    return <Loader message="Loading announcements…" />;
  }

  const actions =
    role === 'admin'
      ? [{icon: 'add', onPress: () => navigation.navigate('AnnouncementForm')}]
      : [];

  return (
    <Screen padded={false}>
      <CustomHeader title="Announcements" onBack={() => navigation.goBack()} actions={actions} />
      <FlatList
        data={data}
        keyExtractor={a => a.id}
        contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}
        ListEmptyComponent={<EmptyState title="No announcements" icon="announcement" />}
        renderItem={({item}) => (
          <CustomCard style={{marginBottom: theme.spacing.md}}>
            <Row justify="space-between">
              <Row gap={theme.spacing.xs}>
                {item.pinned ? <Icon name="star" size={14} color={theme.colors.warning} /> : null}
                <Badge label={capitalize(item.category)} tone={categoryTone(item.category)} />
              </Row>
              <AppText variant="label" color="textMuted">
                {formatDate(item.publishedAt)}
              </AppText>
            </Row>
            <View style={{height: theme.spacing.sm}} />
            <AppText variant="bodyBold">{item.title}</AppText>
            <AppText variant="caption" color="textSecondary">
              {item.body}
            </AppText>
            <View style={{height: theme.spacing.xs}} />
            <AppText variant="label" color="textMuted">
              By {item.publishedBy}
            </AppText>
          </CustomCard>
        )}
      />
    </Screen>
  );
}
