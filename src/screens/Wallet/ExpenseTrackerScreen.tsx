/**
 * Customer App — Expense Tracker (Personal expenses)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Plus, X, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme/theme';
import { Input } from '../../components/index';
import { Button } from '../../components/index';
const CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍱' },
  { key: 'transport', label: 'Transport', emoji: '🚌' },
  { key: 'grocery', label: 'Grocery', emoji: '🛒' },
  { key: 'medical', label: 'Medical', emoji: '💊' },
  { key: 'entertainment', label: 'Fun', emoji: '🎬' },
  { key: 'other', label: 'Other', emoji: '📌' },
];
const KEY = 'goone_customer_expenses';
export const ExpenseTrackerScreen: React.FC<any> = ({ navigation }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'food', amount: '', note: '' });
  useEffect(() => { AsyncStorage.getItem(KEY).then((v) => v && setExpenses(JSON.parse(v))); }, []);
  const save = async (list: any[]) => { setExpenses(list); await AsyncStorage.setItem(KEY, JSON.stringify(list)); };
  const add = async () => {
    if (!form.amount || isNaN(Number(form.amount))) { Alert.alert('Enter a valid amount'); return; }
    const e = { id: `e-${Date.now()}`, ...form, amount: Number(form.amount), date: new Date().toISOString() };
    await save([e, ...expenses]);
    setForm({ category: 'food', amount: '', note: '' });
    setShowAdd(false);
  };
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const getCat = (k: string) => CATEGORIES.find((c) => c.key === k) || CATEGORIES[5];
  return (
    <SafeAreaView style={styles.safe}><StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backText}>← Wallet</Text></TouchableOpacity>
        <Text style={styles.title}>My Expenses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}><Plus color="#fff" size={20} /></TouchableOpacity>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Spent</Text>
        <Text style={styles.summaryAmount}>₹{total.toLocaleString('en-IN')}</Text>
      </View>
      <FlatList data={expenses} keyExtractor={(i) => i.id} contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={{ fontSize: 40 }}>💸</Text><Text style={styles.emptyText}>No expenses recorded</Text><TouchableOpacity style={styles.addFirstBtn} onPress={() => setShowAdd(true)}><Text style={styles.addFirstText}>+ Add Expense</Text></TouchableOpacity></View>}
        renderItem={({ item }) => {
          const cat = getCat(item.category);
          return (
            <View style={styles.expenseCard}>
              <Text style={{ fontSize: 26, marginRight: 12 }}>{cat.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.catLabel}>{cat.label}</Text>
                {item.note ? <Text style={styles.noteText} numberOfLines={1}>{item.note}</Text> : null}
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-IN')}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.amountText}>-₹{item.amount}</Text>
                <TouchableOpacity onPress={() => save(expenses.filter((e) => e.id !== item.id))}><Trash2 color={theme.colors.dangerLight} size={16} /></TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      <Modal visible={showAdd} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Add Expense</Text><TouchableOpacity onPress={() => setShowAdd(false)}><X color={theme.colors.text} size={22} /></TouchableOpacity></View>
              <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.catGrid}>{CATEGORIES.map((c) => (<TouchableOpacity key={c.key} style={[styles.catCard, form.category === c.key && styles.catCardActive]} onPress={() => setForm((f) => ({ ...f, category: c.key }))}><Text style={{ fontSize: 24 }}>{c.emoji}</Text><Text style={[styles.catCardText, form.category === c.key && { color: theme.colors.primary }]}>{c.label}</Text></TouchableOpacity>))}</View>
                <Input label="Amount (₹)" placeholder="0" keyboardType="decimal-pad" value={form.amount} onChangeText={(t: string) => setForm((f) => ({ ...f, amount: t }))} />
                <Input label="Note (optional)" placeholder="What for?" value={form.note} onChangeText={(t: string) => setForm((f) => ({ ...f, note: t }))} />
                <Button title="Add Expense" onPress={add} fullWidth size="large" />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: 12, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backBtn: { padding: 8 },
  backText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  title: { ...theme.typography.h3 },
  addBtn: { backgroundColor: theme.colors.danger, width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  summaryCard: { backgroundColor: theme.colors.dangerLight, margin: theme.spacing.md, borderRadius: theme.radius.lg, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.danger + '40' },
  summaryLabel: { color: theme.colors.danger, fontWeight: '700', fontSize: 13 },
  summaryAmount: { fontSize: 28, fontWeight: '900', color: theme.colors.danger, marginTop: 4 },
  list: { padding: theme.spacing.md, gap: 10 },
  expenseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  catLabel: { ...theme.typography.bodyMedium, fontWeight: '700' },
  noteText: { ...theme.typography.caption, marginTop: 2 },
  dateText: { ...theme.typography.caption, color: theme.colors.textLight, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amountText: { fontSize: 16, fontWeight: '800', color: theme.colors.danger },
  empty: { flex: 1, alignItems: 'center', padding: theme.spacing.xxl },
  emptyText: { ...theme.typography.subtitle, margin: 12 },
  addFirstBtn: { backgroundColor: theme.colors.danger, paddingHorizontal: 24, paddingVertical: 12, borderRadius: theme.radius.md },
  addFirstText: { color: '#fff', fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  sheetTitle: { ...theme.typography.h3 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.lg },
  catCard: { width: '30%', alignItems: 'center', padding: 12, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, gap: 4 },
  catCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  catCardText: { fontSize: 11, fontWeight: '600', color: theme.colors.textMuted, textAlign: 'center' },
});
