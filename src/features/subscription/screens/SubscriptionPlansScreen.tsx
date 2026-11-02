/**
 * Subscription plans — one screen for Admin/Teacher/Parent (the backend returns only
 * the logged-in user's role + school plans, already sorted; we keep that order and
 * just split it into "Plans" (BASE) and "Add-ons" (ADDON)).
 *
 * Each card: name, description, "Starting at", a few features, status badge, and a
 * button chosen by `action`. Tapping a card opens Plan detail (pick a duration).
 * Refetches on focus so a payment confirmed while the app was backgrounded shows up.
 */
import React, {useCallback, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
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
import {useCancelSubscription, useSubscriptionPlans} from '../subscription.service';
import {subscriptionErrorMessage, useRazorpayCheckout} from '../useRazorpayCheckout';
import {formatPaise} from '../subscriptionFormat';
import {SubscriptionStatusBadge} from '../components/SubscriptionStatusBadge';
import {PlanFeatureList} from '../components/PlanFeatureList';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {SubscriptionRoutes} from '../../../navigation/types';
import type {SubscriptionPlan} from '../../../shared/types';

type Nav = NativeStackNavigationProp<SubscriptionRoutes>;

const CARD_FEATURE_LIMIT = 4;

export function SubscriptionPlansScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const isAdmin = useAuthStore(s => s.user?.role) === 'admin';
  const {data: plans, isLoading, isError, error, refetch, isRefetching} = useSubscriptionPlans();
  const {payForPlan, busyKey, isBusy, result, clearResult} = useRazorpayCheckout();
  const cancelMutation = useCancelSubscription();
  const [cancelError, setCancelError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    planCard: {marginBottom: t2.spacing.md},
    flex: {flex: 1},
    actionRow: {marginTop: t2.spacing.md},
    linkCard: {marginBottom: t2.spacing.md},
  }));

  const openDetail = (plan: SubscriptionPlan) => navigation.navigate(ScreenNames.PlanDetail, {planId: plan.id});

  const onAction = (plan: SubscriptionPlan) => {
    if (plan.action === 'COMPLETE_PAYMENT' && plan.mySubscription) {
      payForPlan(plan, plan.mySubscription.planPriceId);
    } else if (plan.prices.length === 1) {
      payForPlan(plan, plan.prices[0].id);
    } else {
      // Several durations — let the user pick one first.
      openDetail(plan);
    }
  };

  const cancelPending = (plan: SubscriptionPlan) => {
    if (!plan.mySubscription) {
      return;
    }
    cancelMutation.mutate(plan.mySubscription.id, {
      onError: e => setCancelError(subscriptionErrorMessage(e, t)),
    });
  };

  const renderAction = (plan: SubscriptionPlan) => {
    if (plan.action === 'NONE') {
      return plan.coveredBySchool ? (
        <Row gap={theme.spacing.xs} align="center" style={styles.actionRow}>
          <Icon name="success" size={16} color={theme.colors.success} />
          <AppText variant="caption" color="textSecondary">
            {t('subscription_includedBySchool')}
          </AppText>
        </Row>
      ) : null;
    }
    const busy = plan.prices.some(p => p.id === busyKey);
    const label =
      plan.action === 'COMPLETE_PAYMENT'
        ? t('subscription_completePayment')
        : plan.action === 'RENEW'
          ? t('subscription_renew')
          : plan.onTrial
            ? t('subscription_subscribeNow')
            : t('subscription_subscribe');
    return (
      <View style={styles.actionRow}>
        <CustomButton title={label} size="sm" loading={busy} disabled={isBusy} onPress={() => onAction(plan)} />
        {plan.action === 'RENEW' && plan.upcomingRenewal ? (
          <AppText variant="label" color="textMuted" center>
            {t('subscription_renewalStarts', {date: formatDate(plan.upcomingRenewal.startDate)})}
          </AppText>
        ) : null}
        {plan.action === 'COMPLETE_PAYMENT' ? (
          <Pressable
            onPress={() => cancelPending(plan)}
            disabled={isBusy || cancelMutation.isPending}
            hitSlop={8}>
            <AppText variant="label" color="error" center style={{marginTop: theme.spacing.xs}}>
              {t('common_cancel')}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const renderPlan = (plan: SubscriptionPlan) => {
    const sub = plan.mySubscription;
    return (
      <CustomCard key={plan.id} style={styles.planCard} onPress={() => openDetail(plan)}>
        <Row justify="space-between" align="flex-start" gap={theme.spacing.sm}>
          <View style={styles.flex}>
            <AppText variant="h3">{plan.name}</AppText>
            {isAdmin && plan.scope === 'SCHOOL' ? <Badge label={t('subscription_forWholeSchool')} tone="primary" /> : null}
          </View>
          {sub ? <SubscriptionStatusBadge status={sub.status} daysLeft={sub.daysLeft} startDate={sub.startDate} /> : null}
        </Row>
        {plan.onTrial && plan.trial ? (
          <Badge label={t('subscription_trialBadge', {count: plan.trial.daysLeft})} tone="warning" />
        ) : plan.trial?.status === 'SCHEDULED' ? (
          <Badge label={t('subscription_trialScheduled', {date: plan.trial.startDate})} tone="info" />
        ) : null}
        {plan.onTrial && plan.startingFrom && plan.trial ? (
          <AppText variant="label" color="textMuted">
            {t('subscription_trialSubtitle', {date: plan.trial.endDate, amount: formatPaise(plan.startingFrom.amount), duration: plan.startingFrom.duration})}
          </AppText>
        ) : null}
        {sub?.status === 'UPCOMING' && plan.onTrial && sub.startDate ? (
          <Badge label={t('subscription_paidStartsOn', {date: formatDate(sub.startDate)})} tone="success" />
        ) : null}
        {plan.description ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={2}>
            {plan.description}
          </AppText>
        ) : null}
        {plan.startingFrom && !plan.onTrial ? (
          <>
            <Spacer size={theme.spacing.xs} />
            <AppText variant="bodyBold" color="primary">
              {t('subscription_startingAt', {
                amount: formatPaise(plan.startingFrom.amount),
                duration: plan.startingFrom.duration,
              })}
            </AppText>
          </>
        ) : null}
        <Spacer size={theme.spacing.sm} />
        {isAdmin && plan.features.length > 0 ? (
          <AppText variant="label" color="textMuted">
            {t('subscription_includes')}
          </AppText>
        ) : null}
        <PlanFeatureList features={plan.features} limit={CARD_FEATURE_LIMIT} />
        {renderAction(plan)}
      </CustomCard>
    );
  };

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
    if (plans.length === 0) {
      return <EmptyState icon="card" title={t('subscription_emptyTitle')} message={t('subscription_emptyMessage')} />;
    }
    const school = isAdmin ? plans.filter(p => p.planType !== 'ADDON' && p.scope === 'SCHOOL') : [];
    const base = plans.filter(p => p.planType !== 'ADDON' && (!isAdmin || p.scope !== 'SCHOOL'));
    const addons = plans.filter(p => p.planType === 'ADDON');
    return (
      <>
        {isAdmin && school.length > 0 ? (
          <>
            <SectionTitle title={t('subscription_sectionSchool')} />
            {school.map(renderPlan)}
          </>
        ) : null}
        {base.length > 0 ? (
          <>
            <SectionTitle title={t('subscription_sectionPlans')} />
            {base.map(renderPlan)}
          </>
        ) : null}
        {addons.length > 0 ? (
          <>
            <SectionTitle title={t('subscription_sectionAddons')} />
            {addons.map(renderPlan)}
          </>
        ) : null}
      </>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('subscription_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        <CustomCard style={styles.linkCard} onPress={() => navigation.navigate(ScreenNames.MySubscriptions)}>
          <Row justify="space-between" align="center">
            <Row gap={theme.spacing.sm} align="center">
              <Icon name="card" size={18} color={theme.colors.primary} />
              <AppText variant="bodyBold">{t('subscription_mySubscriptions')}</AppText>
            </Row>
            <Icon name="forward" size={18} color={theme.colors.textMuted} />
          </Row>
        </CustomCard>
        {renderBody()}
        <Spacer size={24} />
      </ScrollView>

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
