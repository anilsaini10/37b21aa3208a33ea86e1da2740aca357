/** Simple pager: prev / page-of-total / next. */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {AppText} from './AppText';
import {Icon} from './Icon';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({page, totalPages, onChange}: PaginationProps): React.JSX.Element | null {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: t2.spacing.lg,
      paddingVertical: t2.spacing.md,
    },
    pageButtonBase: {
      padding: t2.spacing.sm,
      borderRadius: t2.radius.sm,
    },
    pageButtonEnabled: {
      backgroundColor: t2.colors.surfaceVariant,
      opacity: 1,
    },
    pageButtonDisabled: {
      backgroundColor: 'transparent',
      opacity: 0.4,
    },
  }));
  if (totalPages <= 1) {
    return null;
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <View style={styles.row}>
      <Pressable
        disabled={!canPrev}
        onPress={() => onChange(page - 1)}
        style={[styles.pageButtonBase, canPrev ? styles.pageButtonEnabled : styles.pageButtonDisabled]}>
        <Icon name="back" size={18} color={theme.colors.text} />
      </Pressable>
      <AppText variant="caption" color="textSecondary">
        {t('common_pageOfTotal', {page, totalPages})}
      </AppText>
      <Pressable
        disabled={!canNext}
        onPress={() => onChange(page + 1)}
        style={[styles.pageButtonBase, canNext ? styles.pageButtonEnabled : styles.pageButtonDisabled]}>
        <Icon name="forward" size={18} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}
