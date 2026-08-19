/**
 * Teacher list card — white card with a colored left accent stripe, initials
 * avatar tinted to match, name/employee-id, a status dot + label, experience,
 * and code-drawn (border-only) chevrons. Accent cycles deterministically by
 * list index so consecutive teachers read as visually distinct.
 */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {AppText, Avatar, ChevronRight, classCardAccent} from '../../../shared/components';
import {statusTone, capitalize} from '../../../shared/helpers';
import type {BadgeTone} from '../../../shared/components';
import type {Teacher} from '../../../shared/types';
import type {Theme} from '../../../core/theme';

function toneColor(theme: Theme, tone: BadgeTone): string {
  switch (tone) {
    case 'primary':
      return theme.colors.primary;
    case 'success':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'error':
      return theme.colors.error;
    case 'info':
      return theme.colors.info;
    case 'neutral':
    default:
      return theme.colors.textMuted;
  }
}

export interface TeacherCardProps {
  teacher: Teacher;
  subtitle: string;
  experienceLabel: string;
  index: number;
  onPress?: () => void;
}

export function TeacherCard({teacher, subtitle, experienceLabel, index, onPress}: TeacherCardProps): React.JSX.Element {
  const {theme} = useTheme();
  const accentColor = theme.colors[classCardAccent(index)];
  const statusColor = toneColor(theme, statusTone(teacher.status));

  const styles = useThemedStyles(t => ({
    card: {
      flexDirection: 'row',
      backgroundColor: t.colors.card,
      borderRadius: 17,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: t.colors.border,
      shadowColor: t.colors.shadow,
      shadowOpacity: t.dark ? 0.3 : 0.06,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 2},
      elevation: 3,
      marginBottom: t.spacing.md,
    },
    accentStripe: {width: 4},
    body: {
      flex: 1,
      padding: t.spacing.md,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      columnGap: t.spacing.md,
    },
    nameBlock: {flex: 1},
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: t.spacing.sm,
    },
    statusGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    experienceGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: t.spacing.xs,
    },
    chevronPad: {
      paddingTop: 2,
    },
  }));

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, {opacity: pressed ? 0.92 : 1}]}
      accessibilityRole={onPress ? 'button' : undefined}>
      <View style={[styles.accentStripe, {backgroundColor: accentColor}]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Avatar name={teacher.name} uri={teacher.avatarUrl} size={44} color={accentColor} />
          <View style={styles.nameBlock}>
            <AppText variant="bodyBold" numberOfLines={1}>
              {teacher.name}
            </AppText>
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {subtitle}
            </AppText>
          </View>
          {onPress ? (
            <View style={styles.chevronPad}>
              <ChevronRight size={14} color={theme.colors.textMuted} />
            </View>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.statusGroup}>
            <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            <AppText variant="label" style={{color: statusColor}}>
              {capitalize(teacher.status)}
            </AppText>
          </View>
          <View style={styles.experienceGroup}>
            <AppText variant="label" color="textSecondary">
              {experienceLabel}
            </AppText>
            {/* {onPress ? <ChevronRight size={12} color={theme.colors.textMuted} /> : null} */}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
