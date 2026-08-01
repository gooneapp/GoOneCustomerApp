/**
 * GoOne Customer App — Splash Screen with Real Logo
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Image, StatusBar, Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import type { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');
const LOGO = require('../Logo.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  const logoScale  = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dotAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,  { toValue: 1,   tension: 80, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Loading dots pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    const t = setTimeout(() => {
      if (!isLoading) {
        navigation.replace(isAuthenticated ? 'Main' : 'Auth');
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Background gradient circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: tagOpacity, alignItems: 'center' }}>
        <Text style={styles.tagline}>Customer App</Text>
        <Text style={styles.subTagline}>Shop Local • Book Rides • Track Orders</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsRow, { opacity: tagOpacity }]}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: dotAnim.interpolate({
                  inputRange: [0, 0.33 * (i + 1), 1],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: theme.colors.primaryLight,
    top: -100,
    right: -100,
    opacity: 0.6,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.secondaryLight,
    bottom: -80,
    left: -80,
    opacity: 0.5,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: width * 0.72,
    height: height * 0.22,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subTagline: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 48,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  version: {
    position: 'absolute',
    bottom: 36,
    fontSize: 11,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
});
