import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme/theme';
import { useAuthStore } from '../store/authStore';

export const SplashScreen: React.FC<any> = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

    // Check auth and navigate after animation
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('LanguageSelect');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, fadeAnim, scaleAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>GO</Text>
        </View>
        <Text style={styles.brandName}>GoOne</Text>
        <Text style={styles.tagline}>Everything local, delivered fast.</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  }
});
