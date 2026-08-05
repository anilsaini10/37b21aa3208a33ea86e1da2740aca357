/** Dashboard KPI tile. */
import React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useTheme, useThemedStyles} from '../../core/theme';
import {CustomCard} from './CustomCard';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {Row, Spacer} from './layout';
import type {StatCard} from '../types';

/** Purely decorative wave accent along the tile's bottom edge, tinted to the stat's accent color. */
function TileSparkle({ color }: { color: string }): React.JSX.Element {
  return (
    <Svg
      width="100%"
      height={34}
      viewBox="0 0 150 34"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
      pointerEvents="none"
    >
      {/* Bottom filled area */}
      <Path
        d="
      M0 32
      C20 32, 30 31, 45 28
      C60 25, 75 30, 90 20
      C105 10, 115 12, 125 22
      C135 32, 142 8, 150 12
      L150 34
      L0 34
      Z
    "
        fill={color}
      />

      {/* Top wave line */}
      <Path
        d="
      M0 32
      C20 32, 30 31, 45 28
      C60 25, 75 30, 90 20
      C105 10, 115 12, 125 22
      C135 32, 142 8, 150 12
    "
        stroke="#B794F4"
        strokeWidth={1.5}
        fill={"none"}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const ACCENTS: Record<StatCard['accent'], keyof import('../../core/theme').ThemeColors> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

export function StatTile({stat, onPress}: {stat: StatCard; onPress?: () => void}): React.JSX.Element {
  const {theme} = useTheme();
  const accent = theme.colors[ACCENTS[stat.accent]];
  const styles = useThemedStyles(t => ({
    card: {
      minWidth: 150,
      overflow: 'hidden',
      borderColor: 'transparent',
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: t.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deltaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 2,
      paddingHorizontal: t.spacing.xs,
      paddingVertical: 2,
      borderRadius: t.radius.pill,
    },
    deltaBadgePositive: {
      backgroundColor: t.colors.success + '1A',
    },
    deltaBadgeNegative: {
      backgroundColor: t.colors.error + '1A',
    },
    deltaIconRotated: {
      transform: [{rotate: '180deg'}],
    },
    deltaTextPositive: {
      color: t.colors.success,
    },
    deltaTextNegative: {
      color: t.colors.error,
    },
  }));

  return (
    <CustomCard onPress={onPress} style={styles.card}>
      <TileSparkle color={accent + '26'} />
      <Row justify="space-between" align="flex-start">
        {/* backgroundColor is derived at runtime from the stat's accent key
            (one of 5 theme colors) so it stays inline rather than a static style */}
        <View style={[styles.iconCircle, {backgroundColor: accent + '22'}]}>
          <Icon name={stat.icon} size={20} color={accent} />
        </View>
        {stat.delta !== undefined ? (
          <View style={[styles.deltaBadge, stat.delta >= 0 ? styles.deltaBadgePositive : styles.deltaBadgeNegative]}>
            <Icon
              name="performance"
              size={10}
              color={stat.delta >= 0 ? theme.colors.success : theme.colors.error}
              style={stat.delta < 0 ? styles.deltaIconRotated : undefined}
            />
            <AppText
              variant="label"
              style={stat.delta >= 0 ? styles.deltaTextPositive : styles.deltaTextNegative}>
              {Math.abs(stat.delta)}%
            </AppText>
          </View>
        ) : null}
      </Row>
      <Spacer size={theme.spacing.sm} />
      <AppText variant="bodyBold">{stat.value}</AppText>
      <AppText  color="textSecondary">
        {stat.label}
      </AppText>

    </CustomCard>
  );
}
