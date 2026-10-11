/**
 * Animated in-app splash — bridges the static native BootSplash into the app
 * with a logo entrance + cross-fade, instead of an abrupt cut straight to the
 * first screen. Background matches BootSplash exactly so the hand-off from
 * native → JS is invisible.
 */
import React, {useEffect} from 'react';
import {Image, StyleSheet} from 'react-native';
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

const BACKGROUND = '#000000';
const LOGO_BANNER = require('../assets/images/logo_title_banner.png');
const LOGO_WIDTH = Math.round((180 * 2172) / 1940);
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 724) / 2172);

export function SplashScreen({onFinish}: {onFinish: () => void}): React.JSX.Element {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Native splash hides now — our JS overlay (same bg + logo) is already
    // painted, so the swap reads as one continuous screen, not a flash.
    void BootSplash.hide({fade: true});

    // Entrance: a subtle fade + scale-up (no overshoot — the wide banner reads badly when it balloons).
    logoOpacity.value = withTiming(1, {duration: 700, easing: Easing.out(Easing.cubic)});
    logoScale.value = withSequence(
      withTiming(1, {duration: 700, easing: Easing.out(Easing.cubic)}),
      // Gentle breathing pulse to keep the dwell time feeling alive rather
      // than static — stops automatically once the screen unmounts.
      withDelay(
        250,
        withRepeat(
          withSequence(
            withTiming(1.02, {duration: 900, easing: Easing.inOut(Easing.sin)}),
            withTiming(1, {duration: 900, easing: Easing.inOut(Easing.sin)}),
          ),
          -1,
          false,
        ),
      ),
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
  const rootStyle = useAnimatedStyle(() => ({opacity: screenOpacity.value}));

  return (
    <Animated.View style={[styles.root, rootStyle]} pointerEvents="none">
      <Animated.View style={logoStyle}>
        <Image source={LOGO_BANNER} style={styles.logo} resizeMode="contain" />
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
  // The PNG has transparent padding (artwork is 1940 of 2172px wide); sized so the
  // visible artwork is 180dp — same as the native BootSplash logo, so the hand-off doesn't jump.
  // Explicit width + height: with only width + aspectRatio the image rendered at its native pixel size.
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
});
