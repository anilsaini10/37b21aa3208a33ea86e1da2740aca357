/**
 * Animated in-app splash — bridges the static native BootSplash into the app
 * with a logo entrance + cross-fade, instead of an abrupt cut straight to the
 * first screen. Background matches BootSplash exactly so the hand-off from
 * native → JS is invisible.
 */
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import BootSplash from 'react-native-bootsplash';
import {AppText, AriseLogo} from '../shared/components';
import {useLanguage} from '../core/i18n';

const BACKGROUND = '#F5F4FC';

export function SplashScreen({onFinish}: {onFinish: () => void}): React.JSX.Element {
  const {t} = useLanguage();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.72);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Native splash hides now — our JS overlay (same bg + logo) is already
    // painted, so the swap reads as one continuous screen, not a flash.
    void BootSplash.hide({fade: true});

    // Entrance: a slower, gentler ease-in with a soft overshoot (~0-950ms).
    logoOpacity.value = withTiming(1, {duration: 700, easing: Easing.out(Easing.cubic)});
    logoScale.value = withSequence(
      withTiming(1.1, {duration: 700, easing: Easing.out(Easing.cubic)}),
      withTiming(1, {duration: 450, easing: Easing.out(Easing.quad)}),
      // Gentle breathing pulse to keep the dwell time feeling alive rather
      // than static — stops automatically once the screen unmounts.
      withDelay(
        250,
        withRepeat(
          withSequence(
            withTiming(1.035, {duration: 900, easing: Easing.inOut(Easing.sin)}),
            withTiming(1, {duration: 900, easing: Easing.inOut(Easing.sin)}),
          ),
          -1,
          false,
        ),
      ),
    );

    textOpacity.value = withDelay(500, withTiming(1, {duration: 650, easing: Easing.out(Easing.cubic)}));
    textTranslateY.value = withDelay(
      500,
      withTiming(0, {duration: 650, easing: Easing.out(Easing.cubic)}),
    );

    // Hold on screen for a beat, then fade out — total runtime ≈ 3.5s.
    screenOpacity.value = withDelay(
      3000,
      withTiming(0, {duration: 500, easing: Easing.in(Easing.cubic)}, finished => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{scale: logoScale.value}],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{translateY: textTranslateY.value}],
  }));
  const rootStyle = useAnimatedStyle(() => ({opacity: screenOpacity.value}));

  return (
    <Animated.View style={[styles.root, rootStyle]} pointerEvents="none">
      <Animated.View style={[styles.logoShadow, logoStyle]}>
        <AriseLogo size={120} />
      </Animated.View>
      <Animated.View style={textStyle}>
        <AppText variant="h2" center>
          Arise
        </AppText>
        <View style={styles.tagline}>
          <AppText variant="caption" color="textSecondary" center>
            {t('schoolManagementSystem')}
          </AppText>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logoShadow: {
    marginBottom: 20,
    borderRadius: 999,
    shadowColor: '#2E4E8F',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 8,
  },
  tagline: {
    marginTop: 4,
  },
});
