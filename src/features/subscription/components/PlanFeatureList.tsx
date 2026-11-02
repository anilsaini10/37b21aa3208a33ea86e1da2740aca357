/**
 * A plan's features with a tick (and "Active" when already active for this user).
 * Admin: grouped under Admin / Teacher / Parent, since a SCHOOL plan covers every role.
 * `limit` shows only the first few (plan cards).
 */
import React from 'react';
import {View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, Badge, Icon, Row} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {FEATURE_ROLES, FEATURE_ROLE_LABEL} from '../subscriptionStatus';
import type {PlanFeature} from '../../../shared/types';

export function PlanFeatureList({
  features,
  limit,
  showDescriptions,
}: {
  features: PlanFeature[];
  limit?: number;
  showDescriptions?: boolean;
}): React.JSX.Element | null {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const isAdmin = useAuthStore(s => s.user?.role) === 'admin';
  const styles = useThemedStyles(t2 => ({
    group: {marginTop: t2.spacing.xs},
    item: {paddingVertical: 2},
    text: {flex: 1},
  }));

  if (features.length === 0) {
    return null;
  }
  const shown = limit ? features.slice(0, limit) : features;

  const renderFeature = (f: PlanFeature) => (
    <View key={f.featureId} style={styles.item}>
      <Row gap={theme.spacing.xs} align="center">
        <Icon name="check" size={14} color={theme.colors.success} />
        <AppText variant="caption" style={styles.text}>
          {f.name}
        </AppText>
        {f.alreadyActive ? (
          <Badge label={t(f.activeVia?.includes('TRIAL') ? 'subscription_featureTrial' : 'subscription_featureActive')} tone={f.activeVia?.includes('TRIAL') ? 'warning' : 'success'} />
        ) : null}
      </Row>
      {showDescriptions && f.description ? (
        <AppText variant="label" color="textMuted">
          {f.description}
        </AppText>
      ) : null}
    </View>
  );

  const more = limit && features.length > limit ? (
    <AppText variant="label" color="textMuted">
      {t('subscription_moreFeatures', {count: features.length - limit})}
    </AppText>
  ) : null;

  if (!isAdmin) {
    return (
      <View>
        {shown.map(renderFeature)}
        {more}
      </View>
    );
  }

  return (
    <View>
      {FEATURE_ROLES.map(role => {
        const items = shown.filter(f => f.role === role);
        if (items.length === 0) {
          return null;
        }
        return (
          <View key={role} style={styles.group}>
            <AppText variant="label" color="textSecondary">
              {t(FEATURE_ROLE_LABEL[role])}
            </AppText>
            {items.map(renderFeature)}
          </View>
        );
      })}
      {more}
    </View>
  );
}
