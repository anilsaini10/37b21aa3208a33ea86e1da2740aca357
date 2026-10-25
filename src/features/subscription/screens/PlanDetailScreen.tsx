/**
 * Plan detail — full description + feature list, duration cards from `prices[]`, and a
 * sticky "Pay ₹X". Reads the plan from the plans query (so it stays fresh after a payment).
 * COMPLETE_PAYMENT: the pending subscription is paid only for its own duration; picking
 * another one subscribes afresh (the backend cancels the old unpaid attempt).
 */
import React, {useEffect, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {formatDate} from '../../../core/utils/format';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomButton,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
  ResultModal,
  SectionTitle,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {useSubscriptionPlans} from '../subscription.service';
import {subscriptionErrorMessage, useRazorpayCheckout} from '../useRazorpayCheckout';
import {formatPaise, formatPerMonth} from '../subscriptionFormat';
import {SubscriptionStatusBadge} from '../components/SubscriptionStatusBadge';
import {PlanFeatureList} from '../components/PlanFeatureList';
import type {SubscriptionRoutes} from '../../../navigation/types';

export function PlanDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {planId} = useRoute<RouteProp<SubscriptionRoutes, 'PlanDetail'>>().params;
  const isAdmin = useAuthStore(s => s.user?.role) === 'admin';
  const {data: plans, isLoading, isError, error, refetch, isRefetching} = useSubscriptionPlans();
  const {payForPlan, isBusy, result, clearResult} = useRazorpayCheckout();
  const plan = plans?.find(p => p.id === planId);

  // Preselect the pending/current subscription's price, else the first.
  const [priceId, setPriceId] = useState<string | null>(null);
  useEffect(() => {
    if (plan && (!priceId || !plan.prices.some(p => p.id === priceId))) {
      const own = plan.mySubscription?.planPriceId;
      setPriceId(own && plan.prices.some(p => p.id === own) ? own : plan.prices[0]?.id ?? null);
    }
  }, [plan, priceId]);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg, paddingBottom: 120},
    flex: {flex: 1},
    priceCard: {
      borderWidth: 1.5,
      borderRadius: t2.radius.md,
      padding: t2.spacing.md,
      marginBottom: t2.spacing.sm,
    },
    radio: {width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center'},
    radioDot: {width: 10, height: 10, borderRadius: 5},
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      backgroundColor: t2.colors.surface,
      borderTopWidth: 1,
      borderTopColor: t2.colors.border,
    },
  }));

  const selected = plan?.prices.find(p => p.id === priceId);

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
    if (isLoading || !plans) {
      return <Loader message={t('subscription_loading')} fullscreen={false} />;
    }
    if (!plan) {
      return <EmptyState icon="card" title={t('subscription_errPlanNotAvailable')} />;
    }
    const sub = plan.mySubscription;
    return (
      <>
        <CustomCard>
          <Row justify="space-between" align="flex-start" gap={theme.spacing.sm}>
            <View style={styles.flex}>
              <AppText variant="h2">{plan.name}</AppText>
              {isAdmin && plan.scope === 'SCHOOL' ? <Badge label={t('subscription_forWholeSchool')} tone="primary" /> : null}
            </View>
            {sub ? <SubscriptionStatusBadge status={sub.status} daysLeft={sub.daysLeft} startDate={sub.startDate} /> : null}
          </Row>
          {plan.description ? (
            <>
              <Spacer size={theme.spacing.xs} />
              <AppText variant="body" color="textSecondary">
                {plan.description}
              </AppText>
            </>
          ) : null}
          {sub?.endDate && (sub.status === 'ACTIVE' || sub.status === 'EXPIRING_SOON') ? (
            <AppText variant="label" color="textMuted">
              {t('subscription_validTillDate', {date: formatDate(sub.endDate)})}
            </AppText>
          ) : null}
          {plan.upcomingRenewal ? (
            <AppText variant="label" color="textMuted">
              {t('subscription_renewalStarts', {date: formatDate(plan.upcomingRenewal.startDate)})}
            </AppText>
          ) : null}
        </CustomCard>

        <SectionTitle title={t('subscription_includes')} />
        <CustomCard>
          <PlanFeatureList features={plan.features} showDescriptions />
        </CustomCard>

        {plan.action === 'NONE' ? (
          <>
            <Spacer size={theme.spacing.md} />
            <Row gap={theme.spacing.xs} align="center">
              <Icon name="success" size={16} color={theme.colors.success} />
              <AppText variant="caption" color="textSecondary">
                {plan.coveredBySchool ? t('subscription_includedBySchool') : t('subscription_nothingToPay')}
              </AppText>
            </Row>
          </>
        ) : (
          <>
            <SectionTitle title={t('subscription_chooseDuration')} />
            {plan.prices.map(price => {
              const active = price.id === priceId;
              const perMonth = formatPerMonth(price);
              return (
                <Pressable
                  key={price.id}
                  disabled={isBusy}
                  onPress={() => setPriceId(price.id)}
                  style={[
                    styles.priceCard,
                    {
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.primary + '0F' : theme.colors.surface,
                    },
                  ]}>
                  <Row gap={theme.spacing.md} align="center">
                    <View style={[styles.radio, {borderColor: active ? theme.colors.primary : theme.colors.border}]}>
                      {active ? <View style={[styles.radioDot, {backgroundColor: theme.colors.primary}]} /> : null}
                    </View>
                    <View style={styles.flex}>
                      <AppText variant="bodyBold">{price.label}</AppText>
                      {perMonth ? (
                        <AppText variant="label" color="textMuted">
                          {t('subscription_perMonth', {amount: perMonth})}
                        </AppText>
                      ) : null}
                    </View>
                    <AppText variant="h3">{formatPaise(price.amount)}</AppText>
                  </Row>
                </Pressable>
              );
            })}
          </>
        )}
      </>
    );
  };

  const canPay = !!plan && plan.action !== 'NONE' && !!selected;

  return (
    <Screen padded={false}>
      <CustomHeader title={plan?.name ?? t('subscription_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        {renderBody()}
      </ScrollView>

      {canPay && plan && selected ? (
        <View style={[styles.footer, {paddingBottom: insets.bottom + theme.spacing.sm}]}>
          <CustomButton
            title={t('subscription_payAmount', {amount: formatPaise(selected.amount)})}
            loading={isBusy}
            disabled={isBusy}
            onPress={() => payForPlan(plan, selected.id)}
          />
        </View>
      ) : null}

      <ResultModal
        visible={!!result}
        variant={result?.variant ?? 'success'}
        title={result?.title ?? ''}
        message={result?.message}
        onClose={clearResult}
      />
    </Screen>
  );
}
