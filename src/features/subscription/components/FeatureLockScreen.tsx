/** Full-screen lock overlay shown in place of paid content when the user lacks access. */
import React from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomCard, CustomButton, AppText, Icon, Row, Spacer} from '../../../shared/components';
import {ScreenNames} from '../../../navigation/ScreenNames';
import {formatPaise} from '../subscriptionFormat';
import type {SubscriptionRoutes} from '../../../navigation/types';
import type {AvailablePlan} from '../../../shared/types';

export interface FeatureLockScreenProps {
  featureName: string;
  reason?: string;
  availableIn?: AvailablePlan[];
}

type Nav = NativeStackNavigationProp<SubscriptionRoutes>;

function lockMessage(reason: string | undefined, featureName: string, t: ReturnType<typeof useLanguage>['t']): string {
  switch (reason) {
    case 'NEVER_SUBSCRIBED':
      return t('subscription_lockNeverSubscribed', {feature: featureName});
    case 'PENDING_PAYMENT':
      return t('subscription_lockPendingPayment', {feature: featureName});
    case 'EXPIRED':
      return t('subscription_lockExpired');
    case 'TRIAL_ENDED':
      return t('subscription_lockTrialEnded', {feature: featureName});
    default:
      return t('subscription_lockDefault', {feature: featureName});
  }
}

export function FeatureLockScreen({featureName, reason, availableIn}: FeatureLockScreenProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const styles = useThemedStyles(t2 => ({
    center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: t2.spacing.xl},
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: t2.colors.error + '18',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t2.spacing.md,
    },
    planCard: {
      borderWidth: 1,
      borderColor: t2.colors.border,
      borderRadius: t2.radius.md,
      padding: t2.spacing.md,
      marginBottom: t2.spacing.sm,
    },
    planName: {flex: 1},
  }));

  return (
    <Screen padded={false}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Icon name="lock" size={28} color={theme.colors.error} />
        </View>
        <AppText variant="h3" center>
          {featureName}
        </AppText>
        <Spacer size={theme.spacing.xs} />
        <AppText variant="body" color="textSecondary" center>
          {lockMessage(reason, featureName, t)}
        </AppText>
        <Spacer size={theme.spacing.lg} />

        {availableIn && availableIn.length > 0 ? (
          <>
            {availableIn.map(plan => (
              <View key={plan.planId} style={styles.planCard}>
                <Row justify="space-between" align="center" gap={theme.spacing.sm}>
                  <AppText variant="bodyBold" style={styles.planName} numberOfLines={1}>
                    {plan.name}
                  </AppText>
                  {plan.startingFrom ? (
                    <AppText variant="caption" color="primary">
                      {t('subscription_startingAt', {
                        amount: formatPaise(plan.startingFrom.amount),
                        duration: plan.startingFrom.duration,
                      })}
                    </AppText>
                  ) : null}
                </Row>
              </View>
            ))}
            <Spacer size={theme.spacing.sm} />
          </>
        ) : null}

        <CustomButton
          title={t('subscription_lockViewPlans')}
          onPress={() => navigation.navigate(ScreenNames.SubscriptionPlans)}
        />
      </View>
    </Screen>
  );
}
