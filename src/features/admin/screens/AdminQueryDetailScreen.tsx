/** Admin query detail — parent info, message, reply textarea, status dropdown, save. */
import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomInput,
  CustomButton,
  AppText,
  Badge,
  type BadgeTone,
  Loader,
  Spacer,
  Select,
} from '../../../shared/components';
import {Row} from '../../../shared/components/layout';
import type {AdminStackParamList} from '../../../navigation/types';
import {
  useAdminParentQueryDetail,
  useUpdateParentQuery,
  type QueryStatus,
} from '../adminParentQuery.service';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

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

export function AdminQueryDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'AdminQueryDetail'>>();
  const {queryId} = route.params;
  const {t} = useLanguage();
  const {theme} = useTheme();
  const styles = useThemedStyles(th => ({
    content: {padding: th.spacing.lg},
    section: {marginBottom: th.spacing.md},
    infoRow: {flexDirection: 'row', alignItems: 'center', columnGap: th.spacing.sm, marginBottom: th.spacing.xs},
    replyCard: {
      backgroundColor: th.colors.surfaceVariant,
      borderRadius: th.radius.md,
      padding: th.spacing.md,
    },
  }));

  const {data: query, isLoading} = useAdminParentQueryDetail(queryId);
  const updateMutation = useUpdateParentQuery();

  const [status, setStatus] = useState<QueryStatus>('OPEN');
  const [reply, setReply] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (query) {
      setStatus(query.status);
      setReply(query.reply ?? '');
    }
  }, [query]);

  const statusLabel = (s: QueryStatus) =>
    t(s === 'OPEN' ? 'adminQuery_statusOpen'
      : s === 'IN_PROGRESS' ? 'adminQuery_statusInProgress'
      : s === 'RESOLVED' ? 'adminQuery_statusResolved'
      : 'adminQuery_statusClosed');

  const statusOptions = (['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as QueryStatus[]).map(s => ({
    value: s,
    label: statusLabel(s),
  }));

  const onSave = () => {
    if (!query) return;
    const input: {status?: QueryStatus; reply?: string | null} = {};
    if (status !== query.status) input.status = status;
    const trimmedReply = reply.trim();
    if (trimmedReply !== (query.reply ?? '')) {
      input.reply = trimmedReply || null;
    }
    if (!input.status && input.reply === undefined) return;

    updateMutation.mutate(
      {queryId, input},
      {
        onSuccess: () => {
          setDirty(false);
          Alert.alert(t('adminQuery_updateSuccess'));
        },
        onError: (e: Error) => {
          Alert.alert(t('common_somethingWentWrong'), e.message);
        },
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('adminQuery_detailTitle')} onBack={() => navigation.goBack()} />

      {isLoading || !query ? (
        <Loader message={t('common_loading')} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Subject + status */}
          <View style={styles.section}>
            <Row justify="space-between" align="flex-start">
              <AppText variant="h2" style={{flex: 1}}>
                {query.subject}
              </AppText>
              <Badge label={statusLabel(query.status)} tone={STATUS_TONE[query.status]} />
            </Row>
            <Spacer size={4} />
            <AppText variant="caption" color="textMuted">
              {t('adminQuery_submittedOn', {date: formatDate(query.createdAt)})}
            </AppText>
          </View>

          {/* Parent info */}
          <CustomCard>
            <AppText variant="label" color="textSecondary" style={{marginBottom: 8}}>
              {t('adminQuery_parentInfo')}
            </AppText>
            <View style={styles.infoRow}>
              <AppText variant="body" style={{fontWeight: '600'}}>{query.createdBy.name}</AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText variant="caption" color="textMuted">{query.createdBy.email}</AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText variant="caption" color="textMuted">{query.createdBy.phone}</AppText>
            </View>
          </CustomCard>

          <Spacer size={16} />

          {/* Message */}
          <CustomCard>
            <AppText variant="label" color="textSecondary" style={{marginBottom: 4}}>
              {t('adminQuery_message')}
            </AppText>
            <AppText variant="body">{query.message}</AppText>
          </CustomCard>

          <Spacer size={16} />

          {/* Status update */}
          <Select
            label={t('adminQuery_changeStatus')}
            value={status}
            options={statusOptions}
            onChange={val => {
              setStatus(val as QueryStatus);
              setDirty(true);
            }}
          />

          <Spacer size={8} />

          {/* Reply */}
          <AppText variant="h3" style={{marginBottom: 8}}>
            {t('adminQuery_reply')}
          </AppText>

          {query.reply && query.repliedAt && !dirty ? (
            <View style={styles.replyCard}>
              <AppText variant="body">{query.reply}</AppText>
              <Spacer size={8} />
              <AppText variant="caption" color="textMuted">
                {t('adminQuery_repliedOn', {date: formatDate(query.repliedAt)})}
                {query.repliedBy ? ` — ${query.repliedBy.name}` : ''}
              </AppText>
            </View>
          ) : null}

          <Spacer size={12} />
          <CustomInput
            label={query.reply ? t('adminQuery_editReply') : t('adminQuery_writeReply')}
            placeholder={t('adminQuery_replyPlaceholder')}
            value={reply}
            onChangeText={val => {
              setReply(val);
              setDirty(true);
            }}
            multiline
            numberOfLines={5}
            maxLength={5000}
          />

          <Spacer size={theme.spacing.md} />
          <CustomButton
            title={t('adminQuery_save')}
            onPress={onSave}
            loading={updateMutation.isPending}
          />
          <Spacer size={24} />
        </ScrollView>
      )}
    </Screen>
  );
}
