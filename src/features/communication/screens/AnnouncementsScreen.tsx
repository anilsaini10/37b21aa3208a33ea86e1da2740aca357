/** Announcements / notices / circulars — shared list screen. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
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
import {ScreenNames} from '../../../navigation/ScreenNames';

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
  const {t} = useLanguage();
  const navigation = useNavigation<{navigate: (route: string) => void; goBack: () => void}>();
  const role = useAuthStore(s => s.user?.role);
  const {data, isLoading} = useAnnouncements(role);
  const styles = useThemedStyles(t2 => ({
    listContent: {
      padding: t2.spacing.lg,
      flexGrow: 1,
    },
    card: {
      marginBottom: t2.spacing.md,
    },
    spacerSm: {
      height: t2.spacing.sm,
    },
    spacerXs: {
      height: t2.spacing.xs,
    },
  }));

  if (isLoading || !data) {
    return <Loader message={t('announcements_loadingAnnouncements')} />;
  }

  const actions =
    role === 'admin'
      ? [{icon: 'add', onPress: () => navigation.navigate(ScreenNames.AnnouncementForm)}]
      : [];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('announcements_title')} onBack={() => navigation.goBack()} actions={actions} />
      <FlatList
        data={data}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState title={t('announcements_noAnnouncements')} icon="announcement" />}
        renderItem={({item}) => (
          <CustomCard style={styles.card}>
            <Row justify="space-between">
              <Row gap={theme.spacing.xs}>
                {item.pinned ? <Icon name="star" size={14} color={theme.colors.warning} /> : null}
                <Badge label={capitalize(item.category)} tone={categoryTone(item.category)} />
              </Row>
              <AppText variant="label" color="textMuted">
                {formatDate(item.publishedAt)}
              </AppText>
            </Row>
            <View style={styles.spacerSm} />
            <AppText variant="bodyBold">{item.title}</AppText>
            <AppText variant="caption" color="textSecondary">
              {item.body}
            </AppText>
            <View style={styles.spacerXs} />
            <AppText variant="label" color="textMuted">
              {t('announcements_publishedBy', {name: item.publishedBy})}
            </AppText>
          </CustomCard>
        )}
      />
    </Screen>
  );
}
