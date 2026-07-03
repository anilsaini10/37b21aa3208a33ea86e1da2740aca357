/** Section heading with optional "See all" action. */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';

export function SectionTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
  }));
  return (
    <View style={styles.header}>
      <AppText variant="h3">{title}</AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="caption" color="primary">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
