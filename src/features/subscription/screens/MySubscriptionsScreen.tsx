/**
 * My subscriptions — paginated history with All / Active / Pending / Expired tabs
 * (admins also see the school's subscriptions). Pending rows can be paid or cancelled;
 * tapping a row opens its details + payment history.
 */
import React, {useCallback, useState} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {formatDate, formatDateTime} from '../../../core/utils/format';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomButton,
  CustomBottomSheet,
  SegmentedTabs,
  AppText,
  Badge,
  Row,
  Spacer,
  Loader,
  EmptyState,
  Pagination,
  ResultModal,
} from '../../../shared/components';
import {useCancelSubscription, useMySubscriptions} from '../subscription.service';
import {subscriptionErrorMessage, useRazorpayCheckout} from '../useRazorpayCheckout';
import {formatPaise} from '../subscriptionFormat';
import type {SubscriptionFilter} from '../subscriptionStatus';
import {SubscriptionStatusBadge} from '../components/SubscriptionStatusBadge';
import type {MySubscriptionItem} from '../../../shared/types';

const PAGE_SIZE = 10;

export function MySubscriptionsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const [filter, setFilter] = useState<SubscriptionFilter>('ALL');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<MySubscriptionItem | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const {data, isLoading, isError, error, refetch, isRefetching} = useMySubscriptions({
    page,
    pageSize: PAGE_SIZE,
    status: filter === 'ALL' ? undefined : filter,
  });
  const {payPending, busyKey, isBusy, result, clearResult} = useRazorpayCheckout();
  const cancelMutation = useCancelSubscription();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, flexGrow: 1},
    card: {marginBottom: t2.spacing.md},
    flex: {flex: 1},
    half: {flex: 1},
    paymentRow: {
      paddingVertical: t2.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t2.colors.divider,
    },
  }));

  const dates = (item: MySubscriptionItem) =>
    item.startDate && item.endDate ? `${formatDate(item.startDate)} – ${formatDate(item.endDate)}` : null;

  const cancel = (item: MySubscriptionItem) =>
    cancelMutation.mutate(item.id, {
      onSuccess: () => setDetail(null),
      onError: e => setCancelError(subscriptionErrorMessage(e, t)),
    });

  const pendingActions = (item: MySubscriptionItem) =>
    item.status === 'PENDING_PAYMENT' ? (
      <Row gap={theme.spacing.sm} style={{marginTop: theme.spacing.sm}}>
        <View style={styles.half}>
          <CustomButton
            title={t('common_cancel')}
            size="sm"
            variant="dangerOutline"
            disabled={isBusy || cancelMutation.isPending}
            onPress={() => cancel(item)}
          />
        </View>
        <View style={styles.half}>
          <CustomButton
            title={t('subscription_completePayment')}
            size="sm"
            loading={busyKey === item.id}
            disabled={isBusy}
            onPress={() => {
              setDetail(null);
              payPending(item.id, item.plan.name);
            }}
          />
        </View>
      </Row>
    ) : null;

  const renderRow = (item: MySubscriptionItem) => (
    <CustomCard key={item.id} style={styles.card} onPress={() => setDetail(item)}>
      <Row justify="space-between" align="flex-start" gap={theme.spacing.sm}>
        <View style={styles.flex}>
          <AppText variant="bodyBold">{item.plan.name}</AppText>
          <AppText variant="caption" color="textSecondary">
            {item.price.label ?? item.price.duration} · {formatPaise(item.price.amount)}
          </AppText>
        </View>
        <SubscriptionStatusBadge status={item.status} daysLeft={item.daysLeft} startDate={item.startDate} />
      </Row>
      {dates(item) ? (
        <AppText variant="label" color="textMuted">
          {dates(item)}
        </AppText>
      ) : null}
      {pendingActions(item)}
    </CustomCard>
  );

  const renderBody = () => {
    if (isError) {
      return (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={subscriptionErrorMessage(error, t)}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      );
    }
    if (isLoading || !data) {
      return <Loader message={t('subscription_loading')} fullscreen={false} />;
    }
    if (data.items.length === 0) {
      return <EmptyState icon="card" title={t('subscription_noSubscriptions')} />;
    }
    return (
      <>
        {data.items.map(renderRow)}
        <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
      </>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('subscription_mySubscriptions')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        <SegmentedTabs<SubscriptionFilter>
          value={filter}
          onChange={f => {
            setFilter(f);
            setPage(1);
          }}
          options={[
            {value: 'ALL', label: t('common_all')},
            {value: 'ACTIVE', label: t('subscription_statusActive')},
            {value: 'PENDING_PAYMENT', label: t('subscription_tabPending')},
            {value: 'EXPIRED', label: t('subscription_statusExpired')},
          ]}
        />
        <Spacer size={theme.spacing.md} />
        {renderBody()}
      </ScrollView>

      <CustomBottomSheet visible={!!detail} onClose={() => setDetail(null)} title={detail?.plan.name}>
        {detail ? (
          <View>
            <SubscriptionStatusBadge status={detail.status} daysLeft={detail.daysLeft} startDate={detail.startDate} />
            <Spacer size={theme.spacing.sm} />
            <AppText variant="body">
              {detail.price.label ?? detail.price.duration} · {formatPaise(detail.price.amount)}
            </AppText>
            {dates(detail) ? (
              <AppText variant="caption" color="textSecondary">
                {dates(detail)}
              </AppText>
            ) : null}
            {pendingActions(detail)}
            <Spacer size={theme.spacing.md} />
            <AppText variant="bodyBold">{t('subscription_paymentHistory')}</AppText>
            {detail.payments.length === 0 ? (
              <AppText variant="caption" color="textMuted">
                {t('subscription_noPayments')}
              </AppText>
            ) : (
              detail.payments.map((p, i) => (
                <View key={p.id ?? `${p.gatewayPaymentId}-${i}`} style={styles.paymentRow}>
                  <Row justify="space-between" align="center">
                    <AppText variant="bodyBold">{formatPaise(p.amount)}</AppText>
                    <Badge label={p.status} tone={p.status === 'CAPTURED' || p.status === 'SUCCESS' ? 'success' : 'neutral'} />
                  </Row>
                  {p.gatewayPaymentId ? (
                    <AppText variant="label" color="textMuted">
                      {t('payment_paymentId')}: {p.gatewayPaymentId}
                    </AppText>
                  ) : null}
                  {p.paidAt ? (
                    <AppText variant="label" color="textMuted">
                      {formatDateTime(p.paidAt)}
                    </AppText>
                  ) : null}
                </View>
              ))
            )}
            <Spacer size={theme.spacing.md} />
          </View>
        ) : null}
      </CustomBottomSheet>

      <ResultModal
        visible={!!result || !!cancelError}
        variant={result?.variant ?? 'error'}
        title={result?.title ?? t('common_somethingWentWrong')}
        message={result?.message ?? cancelError ?? undefined}
        onClose={() => {
          clearResult();
          setCancelError(null);
        }}
      />
    </Screen>
  );
}
