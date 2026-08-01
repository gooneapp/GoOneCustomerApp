import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity,
  ScrollView, Modal, KeyboardAvoidingView, Platform, Alert, RefreshControl, Share, TextInput
} from 'react-native';
import { Plus, X, Trash2, Search, Calendar, Bell, Pin, Archive, Copy, CheckSquare, Palette, Share2, Heart, CheckCircle2, Circle, ChevronLeft } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { AppHeader } from '../../components/AppHeader';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WalletStackParamList } from '../../navigation/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNotesStore } from '../../store/notesStore';
import { Note, NoteItem } from '../../api/client';
import { useTranslation } from '../../utils/i18n';

const COLORS = [
  '#ffffff', // default
  '#fecaca', // red
  '#fde047', // yellow
  '#bbf7d0', // green
  '#bfdbfe', // blue
  '#e9d5ff', // purple
];

type Props = NativeStackScreenProps<WalletStackParamList, 'Wallet'>;

export const NotesScreen: React.FC<Props> = ({ navigation }) => {
  const { notes, isLoading, fetchNotes, createNote, updateNote, deleteNote, duplicateNote, isSyncing, sync } = useNotesStore();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  
  // Modal State
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Note>>({ title: '', content: '', color: '#ffffff', isPinned: false, isArchived: false, isFavorite: false, items: [] });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => { fetchNotes(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await sync();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!form.title?.trim() && !form.content?.trim() && (!form.items || form.items.length === 0)) {
      Alert.alert('Note cannot be empty');
      return;
    }
    
    if (editingId) {
      await updateNote(editingId, form);
    } else {
      await createNote(form);
    }
    
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteNote(id) },
    ]);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ title: '', content: '', color: '#ffffff', isPinned: false, isArchived: false, isFavorite: false, items: [] });
    setShowAdd(true);
  };

  const openEdit = (e: Note) => {
    setEditingId(e.id);
    setForm({ ...e });
    setShowAdd(true);
  };

  const togglePin = (e: Note) => {
    updateNote(e.id, { isPinned: !e.isPinned });
  };

  const toggleArchive = (e: Note) => {
    updateNote(e.id, { isArchived: !e.isArchived });
  };

  const shareNote = async (e: Note) => {
    try {
      const shareText = `${e.title ? e.title + '\n\n' : ''}${e.content ? e.content : ''}\n${(e.items || []).map(i => (i.isDone ? '[x] ' : '[ ] ') + i.content).join('\n')}`;
      await Share.share({ message: shareText });
    } catch (error) {
      Alert.alert('Error', 'Failed to share note');
    }
  };

  // Checklist Helpers
  const addChecklistItem = () => {
    setForm(f => ({ ...f, items: [...(f.items || []), { content: '', isDone: false }] }));
  };

  const updateChecklistItem = (index: number, content: string) => {
    const newItems = [...(form.items || [])];
    newItems[index].content = content;
    setForm(f => ({ ...f, items: newItems }));
  };

  const toggleChecklistItem = (index: number) => {
    const newItems = [...(form.items || [])];
    newItems[index].isDone = !newItems[index].isDone;
    setForm(f => ({ ...f, items: newItems }));
  };

  const removeChecklistItem = (index: number) => {
    const newItems = [...(form.items || [])];
    newItems.splice(index, 1);
    setForm(f => ({ ...f, items: newItems }));
  };

  const filtered = useMemo(() => {
    let filteredNotes = notes.filter(n => !n.isArchived);
    if (search.trim()) {
      const lower = search.toLowerCase();
      filteredNotes = filteredNotes.filter(e => 
        e.title?.toLowerCase().includes(lower) || 
        e.content?.toLowerCase().includes(lower) ||
        (e.items || []).some(i => i.content.toLowerCase().includes(lower))
      );
    }
    return filteredNotes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search]);

  const leftColumn = filtered.filter((_, i) => i % 2 === 0);
  const rightColumn = filtered.filter((_, i) => i % 2 !== 0);

  const stats = useMemo(() => ({
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    archived: notes.filter(n => n.isArchived).length,
    favorites: notes.filter(n => n.isFavorite).length,
  }), [notes]);

  const renderCard = (e: Note) => {
    const noteItems = e.items || [];
    const doneItemsCount = noteItems.filter(i => i.isDone).length;
    
    return (
      <TouchableOpacity key={e.id} style={[styles.card, { backgroundColor: e.color || '#ffffff' }]} onPress={() => openEdit(e)} activeOpacity={0.9}>
        <View style={styles.cardHeader}>
          {e.isPinned && <Pin size={16} color={theme.colors.primary} style={{ transform: [{ rotate: '45deg' }] }} />}
          {e.isFavorite && <Heart size={16} color={theme.colors.danger} fill={theme.colors.danger} />}
        </View>
        
        {e.title ? <Text style={styles.cardTitle}>{e.title}</Text> : null}
        {e.content ? <Text style={styles.cardContent} numberOfLines={4}>{e.content}</Text> : null}
        
        {noteItems.length > 0 && (
          <View style={styles.cardChecklist}>
            {noteItems.slice(0, 3).map((item, idx) => (
              <View key={item.id || idx} style={styles.cardChecklistItem}>
                {item.isDone ? <CheckCircle2 size={12} color={theme.colors.primary} /> : <Circle size={12} color={theme.colors.textMuted} />}
                <Text style={[styles.cardChecklistText, item.isDone && styles.cardChecklistTextDone]} numberOfLines={1}>{item.content}</Text>
              </View>
            ))}
            {noteItems.length > 3 && (
              <Text style={styles.cardChecklistMore}>+{noteItems.length - 3} more items</Text>
            )}
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>
            {new Date(e.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
          {e.reminderDate ? <Bell size={12} color={theme.colors.primary} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      <AppHeader variant="main" title="GoOne Notes" />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color={theme.colors.textMuted} size={18} />
          <TextInput
            placeholder={t('search_notes')}
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {/* Compact Notes Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>{t('total_notes')}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.pinned}</Text>
            <Text style={styles.summaryLabel}>{t('pinned')}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.favorites}</Text>
            <Text style={styles.summaryLabel}>Favorites</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.archived}</Text>
            <Text style={styles.summaryLabel}>{t('archived')}</Text>
          </View>
        </View>

        <View style={styles.masonryContainer}>
          <View style={styles.column}>{leftColumn.map(renderCard)}</View>
          <View style={styles.column}>{rightColumn.map(renderCard)}</View>
        </View>
        
        {filtered.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notes found.</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.9}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <Modal visible={showAdd} animationType="slide" onRequestClose={handleSave}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={[styles.fullSheet, { backgroundColor: form.color || '#ffffff' }]}>
            <AppHeader
              variant="sub"
              title={editingId ? t('edit') : t('create_note')}
              onBack={() => setShowAdd(false)}
              rightSlot={
                <TouchableOpacity onPress={handleSave} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('save')}</Text>
                </TouchableOpacity>
              }
            />

            {/* Color Picker Palette */}
            {showColorPicker && (
              <View style={styles.colorPalette}>
                {COLORS.map(c => (
                  <TouchableOpacity 
                    key={c} 
                    style={[styles.colorCircle, { backgroundColor: c }, form.color === c && styles.colorCircleActive]} 
                    onPress={() => { setForm(f => ({ ...f, color: c })); setShowColorPicker(false); }}
                  />
                ))}
              </View>
            )}
            
            <ScrollView style={styles.fullSheetBody} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.noteTitleInput}
                placeholder="Title"
                placeholderTextColor="rgba(0,0,0,0.3)"
                value={form.title || ''}
                onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
              />
              <TextInput
                style={styles.noteContentInput}
                placeholder="Note content..."
                placeholderTextColor="rgba(0,0,0,0.3)"
                value={form.content || ''}
                onChangeText={(t) => setForm((f) => ({ ...f, content: t }))}
                multiline
                textAlignVertical="top"
              />

              {/* Checklist Section */}
              <View style={styles.checklistSection}>
                {(form.items || []).map((item, idx) => (
                  <View key={idx} style={styles.checklistItemRow}>
                    <TouchableOpacity onPress={() => toggleChecklistItem(idx)} style={styles.checkbox}>
                      {item.isDone ? <CheckCircle2 color={theme.colors.primary} size={20} /> : <Circle color={theme.colors.textMuted} size={20} />}
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.checklistInput, item.isDone && styles.checklistInputDone]}
                      value={item.content}
                      onChangeText={(t) => updateChecklistItem(idx, t)}
                      placeholder="List item..."
                    />
                    <TouchableOpacity onPress={() => removeChecklistItem(idx)} style={styles.iconBtnSmall}>
                      <X color={theme.colors.textMuted} size={18} />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity style={styles.addChecklistBtn} onPress={addChecklistItem}>
                  <Plus color={theme.colors.textMuted} size={20} />
                  <Text style={styles.addChecklistText}>Add Checklist Item</Text>
                </TouchableOpacity>
              </View>
              
              {/* Actions Section */}
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionItem} onPress={() => setShowDatePicker(true)}>
                  <Bell color={form.reminderDate ? theme.colors.primary : theme.colors.text} size={24} />
                  <Text style={styles.actionItemText}>{form.reminderDate ? 'Reminder Set' : 'Reminder'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => setShowColorPicker(!showColorPicker)}>
                  <Palette color={theme.colors.text} size={24} />
                  <Text style={styles.actionItemText}>Color</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}>
                  <Pin color={form.isPinned ? theme.colors.primary : theme.colors.text} size={24} style={form.isPinned ? { transform: [{ rotate: '45deg' }] } : {}} />
                  <Text style={styles.actionItemText}>{form.isPinned ? 'Pinned' : 'Pin Note'}</Text>
                </TouchableOpacity>
                
                {editingId && (
                  <>
                    <TouchableOpacity style={styles.actionItem} onPress={() => shareNote(form as Note)}>
                      <Share2 color={theme.colors.text} size={24} />
                      <Text style={styles.actionItemText}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => setForm(f => ({ ...f, isArchived: !f.isArchived }))}>
                      <Archive color={form.isArchived ? theme.colors.primary : theme.colors.text} size={24} />
                      <Text style={styles.actionItemText}>{form.isArchived ? 'Unarchive' : 'Archive'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => { duplicateNote(editingId); setShowAdd(false); }}>
                      <Copy color={theme.colors.text} size={24} />
                      <Text style={styles.actionItemText}>Copy Note</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => { setShowAdd(false); handleDelete(editingId); }}>
                      <Trash2 color={theme.colors.danger} size={24} />
                      <Text style={[styles.actionItemText, { color: theme.colors.danger }]}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              
              <View style={styles.bottomSpace} />
            </ScrollView>

            {showDatePicker && (
              <DateTimePicker
                value={form.reminderDate ? new Date(form.reminderDate) : new Date()}
                mode="date"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setForm(f => ({ ...f, reminderDate: date.toISOString() }));
                }}
              />
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  searchContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: 10, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: theme.colors.text },
  scroll: { padding: theme.spacing.md, paddingBottom: 100 },
  summaryBox: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginBottom: theme.spacing.lg, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: theme.colors.textMuted, fontSize: 11, textTransform: 'uppercase', marginTop: 4, fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  summaryDivider: { width: 1, backgroundColor: theme.colors.border, height: '100%' },
  masonryContainer: { flexDirection: 'row', gap: theme.spacing.md },
  column: { flex: 1, gap: theme.spacing.md },
  card: { padding: 14, borderRadius: theme.radius.lg, ...theme.shadows.sm, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginBottom: 4 },
  cardTitle: { ...theme.typography.bodyMedium, fontWeight: '700', marginBottom: 6, color: '#1f2937' },
  cardContent: { ...theme.typography.caption, color: '#4b5563', marginBottom: 10, lineHeight: 18 },
  cardChecklist: { marginBottom: 12 },
  cardChecklistItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardChecklistText: { fontSize: 12, color: '#4b5563', flex: 1 },
  cardChecklistTextDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  cardChecklistMore: { fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  cardDate: { fontSize: 10, color: '#6b7280', fontWeight: '600' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { color: theme.colors.textMuted, fontStyle: 'italic' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.md, elevation: 5 },
  
  // Full Screen Modal Styles
  fullSheet: { flex: 1 },
  iconBtn: { padding: 8 },
  iconBtnSmall: { padding: 4 },
  colorPalette: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 16, gap: 12, justifyContent: 'flex-end' },
  colorCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  colorCircleActive: { borderWidth: 2, borderColor: theme.colors.primary },
  fullSheetBody: { flex: 1, paddingHorizontal: 20 },
  noteTitleInput: { fontSize: 24, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  noteContentInput: { fontSize: 16, color: '#374151', minHeight: 100, lineHeight: 24 },
  
  checklistSection: { marginTop: 20 },
  checklistItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { marginRight: 12 },
  checklistInput: { flex: 1, fontSize: 16, color: '#374151', paddingVertical: 4 },
  checklistInputDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  addChecklistBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingLeft: 32 },
  addChecklistText: { fontSize: 15, color: theme.colors.textMuted, fontWeight: '500' },
  
  bottomSpace: { height: 100 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  actionItem: { alignItems: 'center', justifyContent: 'center', width: '30%', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: '#fff', ...theme.shadows.sm, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  actionItemText: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted },
});
