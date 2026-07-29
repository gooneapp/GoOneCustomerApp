/**
 * GoOne Customer App — Wallet / Credit Screen
 * Balance, transaction history, and Expense Tracker link.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Wallet, TrendingDown, Plus } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { creditApi } from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';

export const WalletScreen: React.FC<any> = ({ navigation }) => {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    creditApi.getBalance().then(setBalance).catch(() => setBalance({ balance: 0, transactions: [] })).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Wallet & Credits</Text>
        <TouchableOpacity style={styles.expenseBtn} onPress={() => navigation.navigate('ExpenseTracker')}>
          <TrendingDown color={theme.colors.danger} size={18} />
          <Text style={styles.expenseBtnText}>Expenses</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={balance?.transactions || []}
          keyExtractor={(i, idx) => i.id || idx.toString()}
          ListHeaderComponent={
            <View style={styles.balanceCard}>
              <Wallet color={theme.colors.primary} size={36} />
              <Text style={styles.balanceLabel}>GoOne Wallet Balance</Text>
              <Text style={styles.balanceAmount}>₹{Number(balance?.balance || 0).toLocaleString('en-IN')}</Text>
              <TouchableOpacity style={styles.addMoneyBtn}>
                <Plus color="#fff" size={16} />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyTx}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💰</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: item.type === 'credit' ? theme.colors.successLight : theme.colors.dangerLight }]}>
                <Text style={{ fontSize: 16 }}>{item.type === 'credit' ? '⬆️' : '⬇️'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txLabel}>{item.description || 'Transaction'}</Text>
                <Text style={styles.txDate}>{new Date(item.created_at).toLocaleDateString('en-IN')}</Text>
              </View>
              <Text style={[styles.txAmount, { color: item.type === 'credit' ? theme.colors.success : theme.colors.danger }]}>
                {item.type === 'credit' ? '+' : '-'}₹{Number(item.amount).toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border, ...theme.shadows.sm },
  title: { ...theme.typography.h2 },
  expenseBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.dangerLight, backgroundColor: theme.colors.dangerLight },
  expenseBtnText: { color: theme.colors.danger, fontWeight: '700', fontSize: 13 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: theme.spacing.md },
  balanceCard: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl, padding: 28, alignItems: 'center', marginBottom: theme.spacing.xl, ...theme.shadows.primary },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginTop: 12 },
  balanceAmount: { fontSize: 40, fontWeight: '900', color: '#fff', marginVertical: 8 },
  addMoneyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: theme.radius.full, marginTop: 8 },
  addMoneyText: { color: '#fff', fontWeight: '700' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txLabel: { ...theme.typography.bodyMedium },
  txDate: { ...theme.typography.caption, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '800' },
  emptyTx: { alignItems: 'center', padding: theme.spacing.xl },
  emptyText: { ...theme.typography.subtitle },
});
