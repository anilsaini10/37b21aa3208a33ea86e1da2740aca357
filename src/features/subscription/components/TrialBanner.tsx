import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {storage} from '../../../core/storage/storage';
import {AppText, CustomButton, Icon, Row} from '../../../shared/components';
import {useEntitlements} from '../subscription.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {EntitlementTrial} from '../../../shared/types';

function todayKey(): string {
  return `trial_banner_dismissed_${new Date().toISOString().slice(0, 10)}`;
}

function isDismissedToday(): boolean {
  try {
    return storage.getString(todayKey()) === '1';
  } catch {
    return false;
  }
}

const TRIAL_WARN_DAYS = 7;

function pickUrgentTrial(trials: EntitlementTrial[]): EntitlementTrial | null {
  const urgent = trials.filter(t => t.daysLeft <= TRIAL_WARN_DAYS);
  if (urgent.length === 0) return null;
  return urgent.reduce((a, b) => (a.daysLeft <= b.daysLeft ? a : b));
}

export function TrialBanner(): React.JSX.Element | null {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<any>();
  const {data} = useEntitlements();
  const [dismissed, setDismissed] = useState(isDismissedToday);

  const trial = pickUrgentTrial(data?.trials ?? []);

  if (!trial || dismissed) return null;

  const dismiss = () => {
    try {
      storage.set(todayKey(), '1');
    } catch { /* storage unavailable */ }
    setDismissed(true);
  };

  const styles = useThemedStyles(t2 => ({
    banner: {
      backgroundColor: t2.colors.warning + '26',
      borderRadius: t2.radius.md,
      padding: t2.spacing.md,
      marginBottom: t2.spacing.md,
    },
    closeHit: {padding: 4},
    body: {flex: 1},
  }));

  return (
    <View style={styles.banner}>
      <Row justify="space-between" align="flex-start" gap={theme.spacing.sm}>
        <View style={styles.body}>
          <AppText variant="bodyBold" color="warning">
            {t('subscription_trialBannerMessage', {plan: trial.plan.name, count: trial.daysLeft})}
          </AppText>
        </View>
        <Pressable onPress={dismiss} hitSlop={8} style={styles.closeHit}>
          <Icon name="close" size={16} color={theme.colors.warning} />
        </Pressable>
      </Row>
      <CustomButton
        title={t('subscription_subscribe')}
        size="sm"
        variant="outline"
        fullWidth={false}
        onPress={() => navigation.navigate(ScreenNames.SubscriptionPlans)}
        style={{marginTop: theme.spacing.sm, alignSelf: 'flex-start'}}
      />
    </View>
  );
}
