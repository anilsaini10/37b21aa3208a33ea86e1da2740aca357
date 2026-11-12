import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {useNetwork} from '../../core/network';
import {AppText} from './AppText';

const BANNER_HEIGHT = 36;

export function OfflineBanner(): React.JSX.Element | null {
  const {isConnected} = useNetwork();
  const anim = useRef(new Animated.Value(isConnected ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, anim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          transform: [{translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-BANNER_HEIGHT, 0],
          })}],
          opacity: anim,
        },
      ]}>
      <View style={styles.banner}>
        <AppText style={styles.text}>No internet connection</AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  banner: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
