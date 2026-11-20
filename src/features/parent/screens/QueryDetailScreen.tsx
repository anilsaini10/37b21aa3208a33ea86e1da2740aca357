/** Query detail — subject, message, status badge, and admin reply (or waiting indicator). */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  AppText,
  Badge,
  type BadgeTone,
  Loader,
  Icon,
  Spacer,
} from '../../../shared/components';
import {Row} from '../../../shared/components/layout';
import type {ParentStackParamList} from '../../../navigation/types';
import {useParentQueryDetail, type QueryStatus} from '../parentQuery.service';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

const STATUS_TONE: Record<QueryStatus, BadgeTone> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'neutral',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

export function QueryDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ParentStackParamList, 'ParentQueryDetail'>>();
  const {queryId} = route.params;
  const {t} = useLanguage();
  const styles = useThemedStyles(th => ({
    content: {padding: th.spacing.lg},
    section: {marginBottom: th.spacing.md},
    replyCard: {
      backgroundColor: th.colors.surfaceVariant,
      borderRadius: th.radius.md,
      padding: th.spacing.md,
    },
    waitingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: th.spacing.sm,
      paddingVertical: th.spacing.md,
    },
  }));

  const {data: query, isLoading} = useParentQueryDetail(queryId);

  const statusLabel = query ? t(
    query.status === 'OPEN' ? 'parentQuery_statusOpen'
      : query.status === 'IN_PROGRESS' ? 'parentQuery_statusInProgress'
      : query.status === 'RESOLVED' ? 'parentQuery_statusResolved'
      : 'parentQuery_statusClosed',
  ) : '';

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentQuery_detailTitle')} onBack={() => navigation.goBack()} />

      {isLoading || !query ? (
        <Loader message={t('common_loading')} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Row justify="space-between" align="flex-start">
              <AppText variant="h2" style={{flex: 1}}>
                {query.subject}
              </AppText>
              <Badge label={statusLabel} tone={STATUS_TONE[query.status]} />
            </Row>
            <Spacer size={4} />
            <AppText variant="caption" color="textMuted">
              {t('parentQuery_submittedOn', {date: formatDate(query.createdAt)})}
            </AppText>
          </View>

          <CustomCard>
            <AppText variant="label" color="textSecondary" style={{marginBottom: 4}}>
              {t('parentQuery_message')}
            </AppText>
            <AppText variant="body">{query.message}</AppText>
          </CustomCard>

          <Spacer size={16} />

          <AppText variant="h3" style={{marginBottom: 8}}>
            {t('parentQuery_adminReply')}
          </AppText>

          {query.reply ? (
            <View style={styles.replyCard}>
              <AppText variant="body">{query.reply}</AppText>
              {query.repliedAt ? (
                <>
                  <Spacer size={8} />
                  <AppText variant="caption" color="textMuted">
                    {t('parentQuery_repliedOn', {date: formatDate(query.repliedAt)})}
                  </AppText>
                </>
              ) : null}
            </View>
          ) : (
            <View style={styles.waitingRow}>
              <Icon name="clock" size={20} />
              <AppText variant="body" color="textSecondary">
                {t('parentQuery_waitingForResponse')}
              </AppText>
            </View>
          )}
          <Spacer size={24} />
        </ScrollView>
      )}
    </Screen>
  );
}
