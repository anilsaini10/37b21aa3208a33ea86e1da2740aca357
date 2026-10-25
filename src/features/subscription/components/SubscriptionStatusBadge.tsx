/** Status badge for a subscription: "Active · N days left", "Upcoming · starts <date>", etc. */
import React from 'react';
import {useLanguage} from '../../../core/i18n';
import {Badge} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {SUBSCRIPTION_STATUS_LABEL, SUBSCRIPTION_STATUS_TONE} from '../subscriptionStatus';
import type {SubscriptionStatus} from '../../../shared/types';

export function SubscriptionStatusBadge({
  status,
  daysLeft,
  startDate,
}: {
  status: SubscriptionStatus;
  daysLeft?: number | null;
  startDate?: string | null;
}): React.JSX.Element {
  const {t} = useLanguage();
  let label = t(SUBSCRIPTION_STATUS_LABEL[status] ?? 'subscription_statusCancelled');
  if ((status === 'ACTIVE' || status === 'EXPIRING_SOON') && daysLeft != null) {
    label += ` · ${t('subscription_daysLeftCount', {count: daysLeft})}`;
  } else if (status === 'UPCOMING' && startDate) {
    label += ` · ${t('subscription_startsOn', {date: formatDate(startDate)})}`;
  }
  return <Badge label={label} tone={SUBSCRIPTION_STATUS_TONE[status] ?? 'neutral'} />;
}
