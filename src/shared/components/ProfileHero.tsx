/**
 * Profile hero — theme-aware header with a 3D elevated card showing
 * avatar, name, details and role badge. Simple back button on top.
 */
import React from 'react';
import {Image, Platform, TouchableOpacity, View} from 'react-native';
import {useThemedStyles} from '../../core/theme';
import {useCachedImage} from '../../core/utils/useCachedImage';
import {AppText} from './AppText';
import {Avatar} from './Avatar';
import {BackButton} from './BackButton';
import {Row} from './layout';

const AVATAR_SIZE = 72;

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
  const styles = useThemedStyles(t => ({
    container: {
      backgroundColor: t.colors.surface,
      paddingBottom: t.spacing.lg,
    },
    topBar: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
      paddingBottom: t.spacing.sm,
    },
    title: {
      marginLeft: t.spacing.sm,
      color: t.colors.text,
    },
    cardWrapper: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.sm,
    },
    card: {
      backgroundColor: t.colors.card,
      borderRadius: t.radius.xl,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.dark ? t.colors.border : 'rgba(0,0,0,0.04)',
      // 3D shadow layers
      shadowColor: t.dark ? '#000' : t.colors.primary,
      shadowOpacity: t.dark ? 0.4 : 0.12,
      shadowRadius: 16,
      shadowOffset: {width: 0, height: 8},
      ...Platform.select({
        android: {elevation: 8},
      }),
    },
    cardInnerShadow: {
      backgroundColor: t.colors.card,
      borderRadius: t.radius.xl,
      // second layer for depth
      shadowColor: '#000',
      shadowOpacity: t.dark ? 0.25 : 0.06,
      shadowRadius: 4,
      shadowOffset: {width: 0, height: 2},
    },
    avatarRing: {
      width: AVATAR_SIZE + 6,
      height: AVATAR_SIZE + 6,
      borderRadius: (AVATAR_SIZE + 6) / 2,
      borderWidth: 2.5,
      borderColor: t.colors.primary,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: t.colors.surface,
    },
    nameBlock: {
      flex: 1,
      marginLeft: t.spacing.md,
    },
    nameText: {
      color: t.colors.text,
    },
    badge: {
      alignSelf: 'flex-start' as const,
      backgroundColor: t.colors.primary,
      paddingHorizontal: t.spacing.sm + 2,
      paddingVertical: 4,
      borderRadius: t.radius.pill,
      marginTop: t.spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: t.dark ? t.colors.border : 'rgba(0,0,0,0.06)',
      marginTop: t.spacing.md,
      marginHorizontal: t.spacing.xs,
    },
    infoRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: t.spacing.sm,
      paddingHorizontal: t.spacing.xs,
    },
    infoDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.colors.primary,
      marginRight: t.spacing.sm,
      opacity: 0.6,
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
    <View style={styles.container}>
      {/* Simple back bar */}
      {onBack ? (
        <View style={styles.topBar}>
          <BackButton onPress={onBack} />
          {title ? (
            <AppText variant="headerTitle" style={styles.title}>
              {title}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {/* 3D Profile Card */}
      <View style={styles.cardWrapper}>
        <View style={styles.cardInnerShadow}>
          <View style={styles.card}>
            <Row gap={0} align="center">
              {/* Avatar with ring */}
              <View style={styles.avatarRing}>
                {onAvatarPress ? (
                  <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7}>
                    {avatarElement}
                  </TouchableOpacity>
                ) : (
                  avatarElement
                )}
              </View>

              <View style={styles.nameBlock}>
                <AppText variant="h2" numberOfLines={1} style={styles.nameText}>
                  {name}
                </AppText>
                {badgeLabel ? (
                  <View style={styles.badge}>
                    <AppText variant="label" color="onPrimary" style={{fontWeight: '700', fontSize: 11}}>
                      {badgeLabel}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </Row>

            {/* Info lines below divider */}
            {visibleLines.length > 0 ? (
              <>
                <View style={styles.divider} />
                {visibleLines.map((line, i) => (
                  <View key={i} style={styles.infoRow}>
                    <View style={styles.infoDot} />
                    <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                      {line}
                    </AppText>
                  </View>
                ))}
              </>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
