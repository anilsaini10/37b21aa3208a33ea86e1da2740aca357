/**
 * Class-list card — accent-tinted icon square, class name + subtitle,
 * optional tappable section chips, a decorative wave accent, and a trailing
 * chevron circle. Cycles through 4 accent colors by index so consecutive
 * classes in a list read as visually distinct — shared across every screen
 * that lists classes (Students, Classes management, Teacher's My Classes...).
 */
import React from 'react';
import {Pressable, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useTheme, useThemedStyles} from '../../core/theme';
import {CustomCard} from './CustomCard';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {Row} from './layout';

export type ClassCardAccent = 'primary' | 'success' | 'warning' | 'info';

const ACCENT_CYCLE: ClassCardAccent[] = ['primary', 'success', 'warning', 'info'];

/** Pick a stable accent for the Nth class in a list. */
export function classCardAccent(index: number): ClassCardAccent {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length];
}

function CardWave({color, height = 64}: {color: string; height?: number}): React.JSX.Element {
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 300 64"
      preserveAspectRatio="none"
      style={{position: 'absolute', bottom: 0, left: 0, right: 0}}
      pointerEvents="none">
      <Path d="M0,50 C60,20 100,58 150,38 C200,18 240,52 300,24 L300,64 L0,64 Z" fill={color} />
    </Svg>
  );
}

export interface ClassCardSectionChip {
  key: string;
  label: string;
  onPress?: () => void;
}

export interface ClassCardProps {
  name: string;
  /** Omit when the subtitle line itself is handled via `children` instead (e.g. placed in a custom bottom row). */
  subtitle?: string;
  sections?: ClassCardSectionChip[];
  accent?: ClassCardAccent;
  onPress?: () => void;
  /** Overrides the default trailing chevron circle (e.g. an expand caret, edit/delete icons). */
  rightSlot?: React.ReactNode;
  /** Renders below the header instead of the auto chip row — for callers that need richer per-section rows (e.g. an attendance button per row) rather than plain tappable chips. */
  children?: React.ReactNode;
  style?: object;
  /** Compact suffix shown right next to the name (e.g. "(A, B)") instead of a separate chip row — takes priority over `sections`/`children` when set. */
  titleSuffix?: string;
  /** Tighter padding/icon/wave sizing for dense lists where the default card reads too tall. */
  compact?: boolean;
}

export function ClassCard({
  name,
  subtitle,
  sections = [],
  accent = 'primary',
  onPress,
  rightSlot,
  children,
  style,
  titleSuffix,
  compact = false,
}: ClassCardProps): React.JSX.Element {
  const {theme} = useTheme();
  const accentColor = theme.colors[accent];
  const styles = useThemedStyles(t => ({
    card: {
      overflow: 'hidden',
      borderColor: 'transparent',
      marginBottom: compact ? t.spacing.xs : t.spacing.md,
      padding: compact ? 6 : 10,
    },
    iconSquare: {
      width: compact ? 24 : 36,
      height: compact ? 24 : 36,
      borderRadius: compact ? t.radius.sm : t.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chevronCircle: {
      width: compact ? 18 : 21,
      height: compact ? 18 : 21,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chip: {
      paddingHorizontal: t.spacing.sm,
      paddingVertical: 4,
      borderRadius: t.radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 4,
    },
    chipsRow: {marginTop: t.spacing.sm},
  }));

  return (
    <CustomCard style={[styles.card, style]} onPress={onPress}>
      <CardWave color={accentColor + '10'} height={compact ? 28 : 64} />
      <Row gap={compact ? theme.spacing.sm : theme.spacing.md} align="flex-start">
        <View style={[styles.iconSquare, {backgroundColor: accentColor + '1A'}]}>
          <Icon name="class" size={compact ? 12 : 16} color={accentColor} />
        </View>
        <View style={{flex: 1}}>
          <AppText variant="bodyBold" numberOfLines={1}>
            {name}
            {titleSuffix ? (
              <AppText variant="label" color="textSecondary">
                {' '}
                {titleSuffix}
              </AppText>
            ) : null}
          </AppText>
          {subtitle ? (
            <AppText variant="label" color="textSecondary">
              {subtitle}
            </AppText>
          ) : null}
          {children == null && !titleSuffix && sections.length > 0 ? (
            <Row wrap gap={theme.spacing.xs} style={styles.chipsRow}>
              {sections.map(section => {
                const chip = (
                  <View style={[styles.chip, {backgroundColor: accentColor + '1A'}]}>
                    <Icon name="student" size={12} color={accentColor} />
                    <AppText variant="label" style={{color: accentColor, fontWeight: '700'}}>
                      {section.label}
                    </AppText>
                  </View>
                );
                return section.onPress ? (
                  <Pressable key={section.key} onPress={section.onPress}>
                    {chip}
                  </Pressable>
                ) : (
                  <View key={section.key}>{chip}</View>
                );
              })}
            </Row>
          ) : null}
        </View>
        {rightSlot !== undefined ? (
          rightSlot
        ) : onPress ? (
          <View style={[styles.chevronCircle, {backgroundColor: accentColor + '1A'}]}>
            <Icon name="forward" size={14} color={accentColor} />
          </View>
        ) : null}
      </Row>
      {children}
    </CustomCard>
  );
}
