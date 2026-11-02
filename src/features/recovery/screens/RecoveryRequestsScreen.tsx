import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, Share, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  AppText,
  Badge,
  Row,
  Spacer,
  Loader,
  EmptyState,
  SearchBar,
  Pagination,
  Icon,
  ResultModal,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {timeAgo} from '../../../core/utils/format';
import {extractErrorCode, extractErrorMessage} from '../../../core/api/apiError';
import {
  useRecoveryRequests,
  useResetRecoveryPassword,
  useRejectRecoveryRequest,
} from '../recoveryRequests.service';
import type {RecoveryRequest, RecoveryRequestStatus, RecoveryResetResponse} from '../../../shared/types';

type StatusTab = RecoveryRequestStatus | 'ALL';

const STATUS_TABS: StatusTab[] = ['PENDING', 'RESOLVED', 'REJECTED', 'ALL'];

const STATUS_TONE: Record<RecoveryRequestStatus, BadgeTone> = {
  PENDING: 'warning',
  RESOLVED: 'success',
  REJECTED: 'neutral',
};

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

function buildLoginDetails(
  account: RecoveryRequest['account'],
  defaultPassword: string,
): string {
  const ids: string[] = [];
  if (account.email) {
    ids.push(`Email: ${account.email}`);
  }
  if (account.phone) {
    ids.push(`Phone: ${formatPhone(account.phone)}`);
  }
  if (account.username) {
    ids.push(`Username: ${account.username}`);
  }
  return `Login details for ${account.name}:\n${ids.join('\n')}\nPassword: ${defaultPassword}`;
}

export function RecoveryRequestsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [tab, setTab] = useState<StatusTab>('PENDING');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RecoveryRequest | null>(null);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'reject' | null>(null);
  const [resetResult, setResetResult] = useState<RecoveryResetResponse | null>(null);
  const [feedback, setFeedback] = useState<{variant: 'success' | 'error'; title: string; message?: string} | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search]);

  const listParams = {
    status: tab === 'ALL' ? undefined : tab,
    search: debouncedSearch || undefined,
    page,
    pageSize: 20,
  };

  const {data, isLoading, isError, error, refetch} = useRecoveryRequests(listParams);
  const resetMutation = useResetRecoveryPassword();
  const rejectMutation = useRejectRecoveryRequest();

  const items = data?.items ?? [];
  const statusCounts = data?.statusCounts;
  const totalPages = data?.totalPages ?? 1;

  const pendingCount = statusCounts?.PENDING ?? 0;

  const STATUS_LABEL: Record<RecoveryRequestStatus, string> = {
    PENDING: t('recovery_pending'),
    RESOLVED: t('recovery_resolved'),
    REJECTED: t('recovery_rejected'),
  };

  const tabLabel = useCallback(
    (value: StatusTab): string => {
      if (value === 'ALL') {
        const total = (statusCounts?.PENDING ?? 0) + (statusCounts?.RESOLVED ?? 0) + (statusCounts?.REJECTED ?? 0);
        return `${t('common_all')} (${total})`;
      }
      const count = statusCounts?.[value] ?? 0;
      return count > 0 ? `${STATUS_LABEL[value]} (${count})` : STATUS_LABEL[value];
    },
    [statusCounts, STATUS_LABEL, t],
  );

  const onTabChange = (value: StatusTab) => {
    setTab(value);
    setPage(1);
  };

  const handleError = useCallback(
    (e: unknown) => {
      const code = extractErrorCode(e);
      if (code === 'RECOVERY_REQUEST_NOT_PENDING') {
        setFeedback({variant: 'error', title: extractErrorMessage(e, t('common_somethingWentWrong'))});
      } else if (code === 'RECOVERY_REQUEST_NOT_FOUND') {
        setFeedback({variant: 'error', title: t('recovery_notFound')});
        setSelected(null);
      } else {
        setFeedback({variant: 'error', title: t('common_somethingWentWrong'), message: t('common_checkConnection')});
      }
      refetch();
    },
    [t, refetch],
  );

  const confirmReset = () => {
    if (!selected) {
      return;
    }
    resetMutation.mutate(selected.id, {
      onSuccess: (result) => {
        setConfirmAction(null);
        setSelected(null);
        setResetResult(result);
      },
      onError: (e) => {
        setConfirmAction(null);
        handleError(e);
      },
    });
  };

  const confirmReject = () => {
    if (!selected) {
      return;
    }
    rejectMutation.mutate(selected.id, {
      onSuccess: () => {
        setConfirmAction(null);
        setSelected(null);
        setFeedback({variant: 'success', title: t('recovery_requestRejected')});
      },
      onError: (e) => {
        setConfirmAction(null);
        handleError(e);
      },
    });
  };

  const copyLoginDetails = () => {
    if (!resetResult) {
      return;
    }
    const text = buildLoginDetails(resetResult.account, resetResult.defaultPassword);
    Share.share({message: text});
  };

  const actionInFlight = resetMutation.isPending || rejectMutation.isPending;

  const styles = useThemedStyles(t2 => ({
    tabsWrap: {alignItems: 'center', paddingTop: t2.spacing.md},
    tabsContent: {columnGap: t2.spacing.sm, paddingHorizontal: t2.spacing.lg},
    tabPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    searchSection: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md},
    scrollContent: {padding: t2.spacing.lg, paddingBottom: t2.spacing.xl},
    card: {marginBottom: t2.spacing.md},
    contactRow: {flexDirection: 'row', alignItems: 'center', columnGap: 4},
    matchIcon: {marginLeft: 2},
    actionRow: {marginTop: t2.spacing.sm},
    buttonWrap: {flex: 1},
    detailSection: {marginBottom: t2.spacing.md},
    detailLabel: {marginBottom: 4},
    detailRow: {flexDirection: 'row', alignItems: 'center', columnGap: 6, marginBottom: 2},
    resetInfoCard: {
      backgroundColor: t2.colors.surfaceVariant,
      borderRadius: t2.radius.md,
      padding: t2.spacing.md,
      marginTop: t2.spacing.sm,
    },
  }));

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('recovery_title')}
        actions={pendingCount > 0 ? [{icon: 'notification', onPress: () => onTabChange('PENDING'), badgeCount: pendingCount}] : []}
      />

      {/* Status tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {STATUS_TABS.map(value => {
            const active = value === tab;
            return (
              <Pressable
                key={value}
                onPress={() => onTabChange(value)}
                style={[styles.tabPill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
                <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                  {tabLabel(value)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('recovery_searchPlaceholder')}
        />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('recovery_loading')} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="recovery"
            title={tab === 'PENDING' ? t('recovery_noPendingTitle') : t('recovery_noRequestsTitle')}
            message={tab === 'PENDING' ? t('recovery_noPendingMessage') : t('recovery_noRequestsMessage')}
          />
        ) : (
          <>
            {items.map(item => (
              <RecoveryCard
                key={item.id}
                item={item}
                onPress={() => setSelected(item)}
                onReset={() => {
                  setSelected(item);
                  setConfirmAction('reset');
                }}
                onReject={() => {
                  setSelected(item);
                  setConfirmAction('reject');
                }}
                style={styles.card}
              />
            ))}
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
        <Spacer size={24} />
      </ScrollView>

      {/* Detail modal */}
      <CustomModal
        visible={!!selected && !confirmAction && !resetResult}
        onClose={() => setSelected(null)}
        title={t('recovery_detailTitle')}>
        {selected ? (
          <RecoveryDetail
            item={selected}
            onReset={() => setConfirmAction('reset')}
            onReject={() => setConfirmAction('reject')}
            actionDisabled={actionInFlight}
          />
        ) : null}
      </CustomModal>

      {/* Confirm reset modal */}
      <CustomModal
        visible={confirmAction === 'reset'}
        onClose={() => setConfirmAction(null)}
        title={t('recovery_confirmResetTitle')}>
        {selected ? (
          <>
            <AppText variant="body">
              {t('recovery_confirmResetMessage', {name: selected.account.name, role: selected.account.role})}
            </AppText>
            <Spacer size={12} />
            <Row gap={theme.spacing.md}>
              <View style={styles.buttonWrap}>
                <CustomButton
                  title={t('common_cancel')}
                  variant="outline"
                  onPress={() => setConfirmAction(null)}
                  disabled={actionInFlight}
                />
              </View>
              <View style={styles.buttonWrap}>
                <CustomButton
                  title={t('recovery_resetPassword')}
                  loading={resetMutation.isPending}
                  disabled={actionInFlight}
                  onPress={confirmReset}
                />
              </View>
            </Row>
          </>
        ) : null}
      </CustomModal>

      {/* Confirm reject modal */}
      <CustomModal
        visible={confirmAction === 'reject'}
        onClose={() => setConfirmAction(null)}
        title={t('recovery_confirmRejectTitle')}>
        {selected ? (
          <>
            <AppText variant="body">
              {t('recovery_confirmRejectMessage')}
            </AppText>
            <Spacer size={12} />
            <Row gap={theme.spacing.md}>
              <View style={styles.buttonWrap}>
                <CustomButton
                  title={t('common_cancel')}
                  variant="outline"
                  onPress={() => setConfirmAction(null)}
                  disabled={actionInFlight}
                />
              </View>
              <View style={styles.buttonWrap}>
                <CustomButton
                  title={t('recovery_reject')}
                  variant="danger"
                  loading={rejectMutation.isPending}
                  disabled={actionInFlight}
                  onPress={confirmReject}
                />
              </View>
            </Row>
          </>
        ) : null}
      </CustomModal>

      {/* Reset success modal */}
      <CustomModal
        visible={!!resetResult}
        onClose={() => setResetResult(null)}
        title={t('recovery_resetSuccessTitle')}
        dismissable={false}>
        {resetResult ? (
          <>
            <AppText variant="body">
              {t('recovery_resetSuccessMessage', {name: resetResult.account.name})}
            </AppText>
            <View style={styles.resetInfoCard}>
              {resetResult.account.email ? (
                <AppText variant="bodyBold">Login ID: {resetResult.account.email}</AppText>
              ) : null}
              {resetResult.account.phone ? (
                <AppText variant="bodyBold">Phone: {formatPhone(resetResult.account.phone)}</AppText>
              ) : null}
              {resetResult.account.username ? (
                <AppText variant="bodyBold">Username: {resetResult.account.username}</AppText>
              ) : null}
              <Spacer size={4} />
              <AppText variant="bodyBold">Password: {resetResult.defaultPassword}</AppText>
            </View>
            <Spacer size={12} />
            <Row gap={theme.spacing.md}>
              <View style={styles.buttonWrap}>
                <CustomButton
                  title={t('recovery_copy')}
                  variant="outline"
                  iconLeft="copy"
                  onPress={copyLoginDetails}
                />
              </View>
              <View style={styles.buttonWrap}>
                <CustomButton
                  title={t('common_done')}
                  onPress={() => setResetResult(null)}
                />
              </View>
            </Row>
          </>
        ) : null}
      </CustomModal>

      {/* Feedback toast-like modal */}
      <ResultModal
        visible={!!feedback}
        variant={feedback?.variant ?? 'success'}
        title={feedback?.title ?? ''}
        message={feedback?.message}
        onClose={() => setFeedback(null)}
      />
    </Screen>
  );
}

function RecoveryCard({
  item,
  onPress,
  onReset,
  onReject,
  style,
}: {
  item: RecoveryRequest;
  onPress: () => void;
  onReset: () => void;
  onReject: () => void;
  style?: object;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const STATUS_LABEL: Record<RecoveryRequestStatus, string> = {
    PENDING: t('recovery_pending'),
    RESOLVED: t('recovery_resolved'),
    REJECTED: t('recovery_rejected'),
  };

  return (
    <CustomCard onPress={onPress} style={style}>
      {/* Header row */}
      <Row justify="space-between" align="center">
        <AppText variant="bodyBold" numberOfLines={1} style={{flex: 1}}>
          {item.submitted.name}
        </AppText>
        <Badge label={STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
      </Row>

      {/* Matched account */}
      <Spacer size={4} />
      <Row gap={6} align="center">
        <AppText variant="caption" color="textSecondary">
          {item.account.name}
        </AppText>
        <Badge
          label={item.account.role === 'TEACHER' ? t('recovery_roleTeacher') : t('recovery_roleParent')}
          tone="primary"
          textStyle={{fontSize: 10}}
        />
      </Row>

      {/* Contact info */}
      <Spacer size={6} />
      <ContactInfo item={item} />

      {/* Timestamp */}
      <Spacer size={4} />
      <AppText variant="caption" color="textMuted">
        {timeAgo(item.updatedAt)}
      </AppText>

      {/* Actions or resolution info */}
      {item.status === 'PENDING' ? (
        <>
          <Spacer size={theme.spacing.sm} />
          <Row gap={theme.spacing.sm} justify="flex-end">
            <CustomButton
              title={t('recovery_reject')}
              variant="dangerOutline"
              size="sm"
              fullWidth={false}
              onPress={onReject}
            />
            <CustomButton
              title={t('recovery_resetPassword')}
              size="sm"
              fullWidth={false}
              onPress={onReset}
            />
          </Row>
        </>
      ) : item.resolvedBy ? (
        <>
          <Spacer size={4} />
          <AppText variant="label" color="textMuted">
            {t('recovery_resolvedByAt', {
              name: item.resolvedBy.name,
              date: item.resolvedAt ? timeAgo(item.resolvedAt) : '',
            })}
          </AppText>
        </>
      ) : null}
    </CustomCard>
  );
}

function ContactInfo({item}: {item: RecoveryRequest}): React.JSX.Element {
  const {theme} = useTheme();

  const emailMatch = !!item.submitted.email && !!item.account.email &&
    item.submitted.email.toLowerCase() === item.account.email.toLowerCase();

  const phoneMatches = item.submitted.phones.map(
    p => p.replace(/\D/g, '') === item.account.phone?.replace(/\D/g, ''),
  );

  return (
    <View>
      {item.submitted.email ? (
        <Row gap={4} align="center">
          <Icon name="email" size={12} color={theme.colors.textMuted} />
          <AppText variant="caption" color="textSecondary">{item.submitted.email}</AppText>
          {emailMatch ? <Icon name="check" size={12} color={theme.colors.success} /> : null}
        </Row>
      ) : null}
      {item.submitted.phones.map((phone, i) => (
        <Row key={i} gap={4} align="center">
          <Icon name="phone" size={12} color={theme.colors.textMuted} />
          <AppText variant="caption" color="textSecondary">{formatPhone(phone)}</AppText>
          {phoneMatches[i] ? <Icon name="check" size={12} color={theme.colors.success} /> : null}
        </Row>
      ))}
    </View>
  );
}

function RecoveryDetail({
  item,
  onReset,
  onReject,
  actionDisabled,
}: {
  item: RecoveryRequest;
  onReset: () => void;
  onReject: () => void;
  actionDisabled: boolean;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();

  const styles = useThemedStyles(t2 => ({
    section: {marginBottom: t2.spacing.md},
    sectionTitle: {marginBottom: t2.spacing.xs},
    infoCard: {
      backgroundColor: t2.colors.surfaceVariant,
      borderRadius: t2.radius.md,
      padding: t2.spacing.md,
    },
    buttonWrap: {flex: 1},
  }));

  return (
    <>
      {/* Submitted details */}
      <View style={styles.section}>
        <AppText variant="label" color="textMuted" style={styles.sectionTitle}>
          {t('recovery_submittedDetails')}
        </AppText>
        <View style={styles.infoCard}>
          <AppText variant="bodyBold">{item.submitted.name}</AppText>
          {item.submitted.email ? (
            <Row gap={4} align="center">
              <Icon name="email" size={14} color={theme.colors.textMuted} />
              <AppText variant="body" color="textSecondary">{item.submitted.email}</AppText>
            </Row>
          ) : null}
          {item.submitted.phones.map((phone, i) => (
            <Row key={i} gap={4} align="center">
              <Icon name="phone" size={14} color={theme.colors.textMuted} />
              <AppText variant="body" color="textSecondary">{formatPhone(phone)}</AppText>
            </Row>
          ))}
        </View>
      </View>

      {/* Matched account */}
      <View style={styles.section}>
        <AppText variant="label" color="textMuted" style={styles.sectionTitle}>
          {t('recovery_matchedAccount')}
        </AppText>
        <View style={styles.infoCard}>
          <Row gap={6} align="center">
            <AppText variant="bodyBold">{item.account.name}</AppText>
            <Badge
              label={item.account.role === 'TEACHER' ? t('recovery_roleTeacher') : t('recovery_roleParent')}
              tone="primary"
              textStyle={{fontSize: 10}}
            />
          </Row>
          {item.account.email ? (
            <Row gap={4} align="center">
              <Icon name="email" size={14} color={theme.colors.textMuted} />
              <AppText variant="body" color="textSecondary">{item.account.email}</AppText>
            </Row>
          ) : null}
          {item.account.phone ? (
            <Row gap={4} align="center">
              <Icon name="phone" size={14} color={theme.colors.textMuted} />
              <AppText variant="body" color="textSecondary">{formatPhone(item.account.phone)}</AppText>
            </Row>
          ) : null}
          {item.account.username ? (
            <Row gap={4} align="center">
              <Icon name="profile" size={14} color={theme.colors.textMuted} />
              <AppText variant="body" color="textSecondary">{item.account.username}</AppText>
            </Row>
          ) : null}
          <Spacer size={4} />
          <Badge
            label={item.account.isActive ? t('common_active') : t('common_inactive')}
            tone={item.account.isActive ? 'success' : 'neutral'}
          />
        </View>
      </View>

      {/* Contact match highlights */}
      <ContactInfo item={item} />
      <Spacer size={4} />
      <AppText variant="caption" color="textMuted">
        {t('recovery_requestedAt', {time: timeAgo(item.updatedAt)})}
      </AppText>

      {/* Actions */}
      {item.status === 'PENDING' ? (
        <>
          <Spacer size={theme.spacing.md} />
          <Row gap={theme.spacing.md}>
            <View style={styles.buttonWrap}>
              <CustomButton
                title={t('recovery_reject')}
                variant="dangerOutline"
                disabled={actionDisabled}
                onPress={onReject}
              />
            </View>
            <View style={styles.buttonWrap}>
              <CustomButton
                title={t('recovery_resetPassword')}
                disabled={actionDisabled}
                onPress={onReset}
              />
            </View>
          </Row>
        </>
      ) : item.resolvedBy ? (
        <>
          <Spacer size={theme.spacing.sm} />
          <AppText variant="label" color="textMuted">
            {t('recovery_resolvedByAt', {
              name: item.resolvedBy.name,
              date: item.resolvedAt ? timeAgo(item.resolvedAt) : '',
            })}
          </AppText>
        </>
      ) : null}
    </>
  );
}
