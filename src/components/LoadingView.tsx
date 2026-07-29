/**
 * GoOne Customer App — LoadingView
 * The centered-ActivityIndicator pattern that was duplicated per-screen
 * (ShopScreen, MyOrdersScreen, WalletScreen, etc.) — centralized as-is.
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const LoadingView: React.FC = () => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
