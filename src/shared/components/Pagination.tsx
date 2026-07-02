/** Simple pager: prev / page-of-total / next. */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({page, totalPages, onChange}: PaginationProps): React.JSX.Element | null {
  const {theme} = useTheme();
  if (totalPages <= 1) {
    return null;
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const btn = (enabled: boolean) => ({
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: enabled ? theme.colors.surfaceVariant : 'transparent',
    opacity: enabled ? 1 : 0.4,
  });

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      }}>
      <Pressable disabled={!canPrev} onPress={() => onChange(page - 1)} style={btn(canPrev)}>
        <Icon name="back" size={18} color={theme.colors.text} />
      </Pressable>
      <AppText variant="caption" color="textSecondary">
        Page {page} of {totalPages}
      </AppText>
      <Pressable disabled={!canNext} onPress={() => onChange(page + 1)} style={btn(canNext)}>
        <Icon name="forward" size={18} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}
