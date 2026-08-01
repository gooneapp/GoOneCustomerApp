/**
 * GoOne Customer App — Wallet / Credit Screen
 * There is no backend wallet/credit concept (no route, no model) — per the
 * plan's decision 1, this screen must be honest about that rather than fetch
 * a dead `/customer/wallet` endpoint and show a fake ₹0 balance. The
 * Expenses shortcut is kept — ExpenseTrackerScreen is correctly local-only
 * (AsyncStorage), never backed by this API.
 */
import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { TrendingDown } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { Speakable } from '../../components/Speakable';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WalletStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<WalletStackParamList, 'Wallet'>;

export const WalletScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.safe}>
    <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />

    {/* variant="main" has no rightSlot — the Expenses shortcut is kept as
        its own row below the header rather than dropped. */}
    <AppHeader variant="main" onLocationPress={() => navigation.navigate('LocationPicker')} />

    <View style={styles.actionsRow}>
      <Speakable text="Wallet & Credits" textStyle={styles.actionsTitle} />
      <TouchableOpacity style={styles.expenseBtn} onPress={() => navigation.navigate('ExpenseTracker')}>
        <TrendingDown color={theme.colors.danger} size={18} />
        <Text style={styles.expenseBtnText}>Expenses</Text>
      </TouchableOpacity>
    </View>

    <EmptyState
      icon="🚧"
      title="Wallet coming soon"
      subtitle="GoOne Wallet balance and credit tracking aren't available yet. Use Expenses to track your personal spending in the meantime."
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  actionsTitle: { ...theme.typography.h2 },
  expenseBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.dangerLight, backgroundColor: theme.colors.dangerLight },
  expenseBtnText: { color: theme.colors.danger, fontWeight: '700', fontSize: 13 },
});
