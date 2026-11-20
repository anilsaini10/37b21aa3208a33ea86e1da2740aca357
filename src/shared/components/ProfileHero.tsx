/**
 * Profile hero — a primary-colour banner that fades into the theme background,
 * with an identity card overlapping the fade line: avatar on the left, name +
 * details left-aligned, role badge on the right. Same fade technique as
 * the auth flow's `RoleSelectScreen` hero, reused across every role's Profile
 * screen (Admin/Teacher/Parent) so they open with the same treatment instead
 * of a plain header + card. Fills the space a `CustomHeader` used to occupy —
 * render it as the screen's first child, with no header above it.
 */
import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {palette, useTheme, useThemedStyles} from '../../core/theme';
import {useCachedImage} from '../../core/utils/useCachedImage';
import {AppText} from './AppText';
import {Avatar} from './Avatar';
import {CustomCard} from './CustomCard';
import {BackButton} from './BackButton';
import {Row} from './layout';

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
  /** Called when the user taps the avatar. */
  onAvatarPress?: () => void;
  /** Uploaded profile photo URL (takes priority over avatarUri for display). */
  profilePhoto?: string;
}

export function ProfileHero({
  name,
  avatarUri,
  lines = [],
  badgeLabel,
  onBack,
  title,
  onAvatarPress,
  profilePhoto,
}: ProfileHeroProps): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    hero: {
      height: HERO_HEIGHT,
      overflow: 'hidden',
      backgroundColor: t.colors.primary,
      borderBottomLeftRadius: 19,
      borderBottomRightRadius: 19,
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
      color: palette.white,
      marginLeft: t.spacing.sm,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 3,
    },
    brand: {
      marginTop: -80,
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
  const displayPhoto = useCachedImage(profilePhoto ?? avatarUri);

  const avatarElement = displayPhoto ? (
    <Image
      source={{uri: displayPhoto}}
      style={{width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2}}
      resizeMode="cover"
    />
  ) : (
    <Avatar name={name} uri={avatarUri} size={AVATAR_SIZE} />
  );

  return (
    <View>
      <View style={styles.hero}>
        {onBack ? (
          <Row style={styles.topBar}>
            <BackButton onPress={onBack} color={palette.white} style={styles.backButton} />
            {title ? (
              <AppText variant="headerTitle" style={styles.title}>
                {title}
              </AppText>
            ) : null}
          </Row>
        ) : null}
      </View>

      <View style={styles.brand}>
        <CustomCard>
          <Row gap={theme.spacing.md} align="flex-start">
            {onAvatarPress ? (
              <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7}>
                {avatarElement}
              </TouchableOpacity>
            ) : (
              avatarElement
            )}
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
