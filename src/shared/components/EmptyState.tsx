/** Placeholder shown when a list / screen has no data. */
import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {CustomButton} from './CustomButton';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  icon = 'empty',
  actionLabel,
  onAction,
}: EmptyStateProps): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        rowGap: theme.spacing.sm,
      }}>
      <Icon name={icon} size={56} />
      <AppText variant="h3" center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="caption" color="textSecondary" center>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <CustomButton title={actionLabel} onPress={onAction} fullWidth={false} size="sm" style={{marginTop: theme.spacing.sm}} />
      ) : null}
    </View>
  );
}
