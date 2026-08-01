import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity,
  ScrollView, Modal, KeyboardAvoidingView, Platform, Alert, RefreshControl,
} from 'react-native';
import { Plus, X, Trash2, Search, FileText, Calendar, Bell } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { AppHeader } from '../../components/AppHeader';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WalletStackParamList } from '../../navigation/types';
import { customerExpensesApi, CustomerExpense } from '../../api/client';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍱', color: '#ffedd5' },
  { key: 'transport', label: 'Transport', emoji: '🚌', color: '#e0e7ff' },
  { key: 'grocery', label: 'Grocery', emoji: '🛒', color: '#dcfce7' },
  { key: 'medical', label: 'Medical', emoji: '💊', color: '#fee2e2' },
  { key: 'entertainment', label: 'Fun', emoji: '🎬', color: '#f3e8ff' },
  { key: 'other', label: 'Other', emoji: '📌', color: '#f3f4f6' },
];

type Props = NativeStackScreenProps<WalletStackParamList, 'Wallet'>;

export const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const [expenses, setExpenses] = useState<CustomerExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', category: 'food', amount: '', note: '', reminderDate: null as Date | null });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchExpenses = async () => {
    try {
      const data = await customerExpensesApi.list();
      setExpenses(data);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || 'Could not load expenses.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchExpenses(); };

  const handleSave = async () => {
    if (!form.title.trim()) { Alert.alert('Enter a title'); return; }
    if (!form.amount || isNaN(Number(form.amount))) { Alert.alert('Enter a valid amount'); return; }
    
    try {
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        date: new Date().toISOString(),
        notes: form.note || null,
        reminderDate: form.reminderDate ? form.reminderDate.toISOString() : null,
      };

      if (editingId) {
        await customerExpensesApi.update(editingId, payload);
      } else {
        await customerExpensesApi.create(payload);
      }
      
      setShowAdd(false);
      fetchExpenses();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to save expense.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await customerExpensesApi.delete(id);
          fetchExpenses();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete.');
        }
      }},
    ]);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ title: '', category: 'food', amount: '', note: '', reminderDate: null });
    setShowAdd(true);
  };

  const openEdit = (e: CustomerExpense) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      category: e.category,
      amount: String(e.amount),
      note: e.notes || '',
      reminderDate: e.reminderDate ? new Date(e.reminderDate) : null,
    });
    setShowAdd(true);
  };

  const exportPDF = () => {
    Alert.alert(
      'Export PDF',
      'PDF export functionality requires native modules to be linked (e.g. react-native-html-to-pdf). Once installed, this will generate an invoice of your expenses.',
    );
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return expenses;
    const lower = search.toLowerCase();
    return expenses.filter((e) => e.title.toLowerCase().includes(lower) || e.notes?.toLowerCase().includes(lower));
  }, [expenses, search]);

  const leftColumn = filtered.filter((_, i) => i % 2 === 0);
  const rightColumn = filtered.filter((_, i) => i % 2 !== 0);
  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  const renderCard = (e: CustomerExpense) => {
    const cat = CATEGORIES.find(c => c.key === e.category) || CATEGORIES[5];
    return (
      <TouchableOpacity key={e.id} style={[styles.card, { backgroundColor: cat.color }]} onPress={() => openEdit(e)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{cat.emoji}</Text>
          <Text style={styles.cardAmount}>₹{e.amount}</Text>
        </View>
        <Text style={styles.cardTitle}>{e.title}</Text>
        {e.notes ? <Text style={styles.cardNotes} numberOfLines={3}>{e.notes}</Text> : null}
        
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{new Date(e.date).toLocaleDateString('en-IN')}</Text>
          {e.reminderDate ? <Bell size={12} color={theme.colors.primary} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <AppHeader
        variant="main"
        title="Wallet & Notes"
        rightSlot={
          <TouchableOpacity onPress={exportPDF} style={styles.headerBtn}>
            <FileText color={theme.colors.text} size={22} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color={theme.colors.textMuted} size={18} />
          <Input
            placeholder="Search notes..."
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchInputContainer}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>₹{total.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.masonryContainer}>
          <View style={styles.column}>{leftColumn.map(renderCard)}</View>
          <View style={styles.column}>{rightColumn.map(renderCard)}</View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.9}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <Modal visible={showAdd} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{editingId ? 'Edit Note' : 'Add Note'}</Text>
                <TouchableOpacity onPress={() => setShowAdd(false)}>
                  <X color={theme.colors.text} size={22} />
                </TouchableOpacity>
              </View>
              
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Input label="Title" placeholder="What was this for?" value={form.title} onChangeText={(t) => setForm((f) => ({ ...f, title: t }))} />
                <Input label="Amount (₹)" placeholder="0" keyboardType="decimal-pad" value={form.amount} onChangeText={(t) => setForm((f) => ({ ...f, amount: t }))} />
                
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.catGrid}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c.key} style={[styles.catChip, form.category === c.key && styles.catChipActive]} onPress={() => setForm(f => ({ ...f, category: c.key }))}>
                      <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                      <Text style={[styles.catChipText, form.category === c.key && { color: theme.colors.primary }]}>{c.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Input label="Detailed Notes (optional)" placeholder="Extra details..." value={form.note} onChangeText={(t) => setForm((f) => ({ ...f, note: t }))} multiline numberOfLines={3} />
                
                <View style={styles.reminderRow}>
                  <TouchableOpacity style={styles.reminderBtn} onPress={() => setShowDatePicker(true)}>
                    <Calendar color={form.reminderDate ? theme.colors.primary : theme.colors.textMuted} size={18} />
                    <Text style={[styles.reminderText, form.reminderDate && { color: theme.colors.primary, fontWeight: '700' }]}>
                      {form.reminderDate ? `Reminder: ${form.reminderDate.toLocaleDateString()}` : 'Add Reminder Date'}
                    </Text>
                  </TouchableOpacity>
                  {form.reminderDate && (
                    <TouchableOpacity onPress={() => setForm(f => ({ ...f, reminderDate: null }))}>
                      <X color={theme.colors.textMuted} size={18} />
                    </TouchableOpacity>
                  )}
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={form.reminderDate || new Date()}
                    mode="date"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setForm(f => ({ ...f, reminderDate: date }));
                    }}
                  />
                )}

                <View style={styles.actionRow}>
                  {editingId && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => { setShowAdd(false); handleDelete(editingId); }}>
                      <Trash2 color={theme.colors.danger} size={22} />
                    </TouchableOpacity>
                  )}
                  <View style={{ flex: 1 }}>
                    <Button title={editingId ? 'Save Changes' : 'Save Note'} onPress={handleSave} size="large" fullWidth />
                  </View>
                </View>
                <View style={{ height: 40 }} />
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
  headerBtn: { padding: 8, marginRight: 8 },
  searchContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: 10, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, paddingHorizontal: 12, height: 44 },
  searchInputContainer: { flex: 1, marginBottom: 0, borderBottomWidth: 0, backgroundColor: 'transparent', minHeight: 0, height: 40 },
  searchInput: { height: 40, paddingHorizontal: 8 },
  scroll: { padding: theme.spacing.md },
  summaryBox: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 20, alignItems: 'center', marginBottom: theme.spacing.xl, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border },
  summaryLabel: { color: theme.colors.textMuted, fontWeight: '700', fontSize: 13, textTransform: 'uppercase' },
  summaryAmount: { fontSize: 32, fontWeight: '900', color: theme.colors.text, marginTop: 4 },
  masonryContainer: { flexDirection: 'row', gap: theme.spacing.md },
  column: { flex: 1, gap: theme.spacing.md },
  card: { padding: 16, borderRadius: theme.radius.lg, ...theme.shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardEmoji: { fontSize: 24 },
  cardAmount: { ...theme.typography.h3, color: theme.colors.text },
  cardTitle: { ...theme.typography.bodyMedium, fontWeight: '700', marginBottom: 4 },
  cardNotes: { ...theme.typography.caption, color: 'rgba(0,0,0,0.6)', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  cardDate: { fontSize: 10, color: 'rgba(0,0,0,0.5)', fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.md },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  sheetTitle: { ...theme.typography.h3 },
  inputLabel: { ...theme.typography.captionBold, color: theme.colors.text, marginBottom: 8, marginTop: 4 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.lg },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.full, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, flexDirection: 'row', alignItems: 'center', gap: 6 },
  catChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  catChipText: { fontSize: 13, fontWeight: '600', color: theme.colors.textMuted },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, marginBottom: 24 },
  reminderBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  reminderText: { ...theme.typography.bodyMedium, color: theme.colors.textMuted },
  actionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  deleteBtn: { width: 52, height: 52, borderRadius: theme.radius.md, backgroundColor: theme.colors.dangerLight, justifyContent: 'center', alignItems: 'center' },
});
