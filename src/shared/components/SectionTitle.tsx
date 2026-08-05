/** Section heading with optional leading icon and "See all" action. */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {Row} from './layout';

export function SectionTitle({
  title,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  /** Small themed icon rendered before the title — omit for the default icon-less heading. */
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.sm,
      marginTop: t.spacing.md,
    },
  }));
  return (
    <View style={styles.header}>
      {icon ? (
        <Row gap={theme.spacing.xs} align="center">
          <Icon name={icon} size={18} color={theme.colors.primary} />
          <AppText variant="h3">{title}</AppText>
        </Row>
      ) : (
        <AppText variant="h3">{title}</AppText>
      )}
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
