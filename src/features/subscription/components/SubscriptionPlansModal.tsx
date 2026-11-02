/** Bottom-sheet modal shown on the home screen when the user has no active subscription. */
import React from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  CustomBottomSheet,
  CustomCard,
  CustomButton,
  AppText,
  Spacer,
  Loader,
} from '../../../shared/components';
import {useSubscriptionPlans} from '../subscription.service';
import {formatPaise} from '../subscriptionFormat';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {SubscriptionRoutes} from '../../../navigation/types';

const MAX_VISIBLE_PLANS = 3;

type Nav = NativeStackNavigationProp<SubscriptionRoutes>;

export function SubscriptionPlansModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data: plans, isLoading} = useSubscriptionPlans();

  const styles = useThemedStyles(t2 => ({
    card: {marginBottom: t2.spacing.sm},
    flex: {flex: 1},
  }));

  const basePlans = (plans ?? []).filter(p => p.planType !== 'ADDON');
  const shown = basePlans.slice(0, MAX_VISIBLE_PLANS);
  const hasMore = (plans?.length ?? 0) > MAX_VISIBLE_PLANS;

  const openDetail = (planId: string) => {
    onClose();
    navigation.navigate(ScreenNames.PlanDetail, {planId});
  };

  const openAll = () => {
    onClose();
    navigation.navigate(ScreenNames.SubscriptionPlans);
  };

  return (
    <CustomBottomSheet visible={visible} onClose={onClose} title={t('subscription_title')}>
      {isLoading ? (
        <Loader message={t('subscription_loading')} fullscreen={false} />
      ) : shown.length === 0 ? (
        <AppText variant="caption" color="textSecondary">
          {t('subscription_emptyMessage')}
        </AppText>
      ) : (
        <>
          {shown.map(plan => (
            <CustomCard key={plan.id} style={styles.card}>
              <AppText variant="bodyBold">{plan.name}</AppText>
              {plan.description ? (
                <AppText variant="caption" color="textSecondary" numberOfLines={2}>
                  {plan.description}
                </AppText>
              ) : null}
              {plan.startingFrom ? (
                <AppText variant="label" color="primary">
                  {t('subscription_startingAt', {
                    amount: formatPaise(plan.startingFrom.amount),
                    duration: plan.startingFrom.duration,
                  })}
                </AppText>
              ) : null}
              <Spacer size={theme.spacing.xs} />
              <CustomButton
                title={t('subscription_subscribe')}
                size="sm"
                onPress={() => openDetail(plan.id)}
              />
            </CustomCard>
          ))}
          {hasMore ? (
            <>
              <Spacer size={theme.spacing.xs} />
              <CustomButton
                title={t('subscription_seeAllPlans')}
                variant="outline"
                size="sm"
                onPress={openAll}
              />
            </>
          ) : null}
        </>
      )}
      <Spacer size={8} />
    </CustomBottomSheet>
  );
}
