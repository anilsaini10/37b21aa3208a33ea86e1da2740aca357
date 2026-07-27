/**
 * Profile hero — a school-photo banner that fades into the theme background,
 * with an identity card overlapping the fade line: avatar on the left, name +
 * details left-aligned, role badge on the right. Same photo/fade technique as
 * the auth flow's `RoleSelectScreen` hero, reused across every role's Profile
 * screen (Admin/Teacher/Parent) so they open with the same treatment instead
 * of a plain header + card. Fills the space a `CustomHeader` used to occupy —
 * render it as the screen's first child, with no header above it.
 */
import React from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';
import {Avatar} from './Avatar';
import {CustomCard} from './CustomCard';
import {Icon} from './Icon';
import {Row} from './layout';

const BACKGROUND_IMAGE = require('../../assets/images/school-building.jpg');
const HERO_HEIGHT = 150;
const AVATAR_SIZE = 64;

export interface ProfileHeroProps {
  name: string;
  avatarUri?: string;
  /** Extra identity lines under the name — e.g. email, phone. Blank/undefined entries are skipped. */
  lines?: (string | undefined)[];
  badgeLabel?: string;
  /** Shows a floating back button over the photo when provided. */
  onBack?: () => void;
  /** Shown to the right of the back button, e.g. "Profile". */
  title?: string;
}

export function ProfileHero({
  name,
  avatarUri,
  lines = [],
  badgeLabel,
  onBack,
  title,
}: ProfileHeroProps): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    hero: {
      height: HERO_HEIGHT,
      overflow: 'hidden',
    },
    topBar: {
      position: 'absolute',
      top: t.spacing.sm,
      left: t.spacing.lg,
      right: t.spacing.lg,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      // backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      // shadowColor: '#000',
      // shadowOpacity: 0.15,
      // shadowRadius: 6,
      // shadowOffset: {width: 0, height: 2},
      // elevation: 3,
    },
    title: {
      color: '#fff',
      marginLeft: t.spacing.sm,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 3,
    },
    brand: {
      marginTop: -20,
      paddingHorizontal: t.spacing.lg,
    },
    nameBlock: {
      flex: 1,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: t.colors.primary,
      paddingHorizontal: t.spacing.sm,
      paddingVertical: 3,
      borderRadius: t.radius.pill,
    },
  }));

  const visibleLines = lines.filter((line): line is string => !!line);

  return (
    <View>
      <View style={styles.hero}>
        <Image source={BACKGROUND_IMAGE} resizeMode="cover" style={StyleSheet.absoluteFill} />
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="profileHeroFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#000000" stopOpacity={0.15} />
              <Stop offset="45%" stopColor={theme.colors.background} stopOpacity={0} />
              <Stop offset="100%" stopColor={theme.colors.background} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill="url(#profileHeroFade)" />
        </Svg>
        {onBack ? (
          <Row style={styles.topBar}>
            <Pressable onPress={onBack} hitSlop={10} style={styles.backButton}>
              <Icon name="back" size={20} color={'white'} />
            </Pressable>
            {title ? (
              <AppText variant="bodyBold" style={styles.title}>
                {title}
              </AppText>
            ) : null}
          </Row>
        ) : null}
      </View>

      <View style={styles.brand}>
        <CustomCard>
          <Row gap={theme.spacing.md} align="flex-start">
            <Avatar name={name} uri={avatarUri} size={AVATAR_SIZE} />
            <View style={styles.nameBlock}>
              <AppText variant="h2" numberOfLines={1}>
                {name}
              </AppText>
              {visibleLines.map((line, i) => (
                <AppText key={i} variant="caption" color="textSecondary" numberOfLines={1}>
                  {line}
                </AppText>
              ))}
            </View>
            {badgeLabel ? (
              <View style={styles.badge}>
                <AppText variant="label" color="onPrimary" style={{fontWeight: '700'}}>
                  {badgeLabel}
                </AppText>
              </View>
            ) : null}
          </Row>
        </CustomCard>
      </View>
    </View>
  );
}
