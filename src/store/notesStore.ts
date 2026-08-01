import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notesApi, Note } from '../api/client';

export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
  fetchNotes: () => Promise<void>;
  createNote: (data: Partial<Note>) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  sync: () => Promise<void>;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,
      error: null,

      fetchNotes: async () => {
        set({ isLoading: true, error: null });
        try {
          const notes = await notesApi.list();
          set({ notes, isLoading: false, lastSyncedAt: Date.now() });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      createNote: async (data: Partial<Note>) => {
        // Optimistic UI
        const tempId = `temp-${Date.now()}`;
        const newNote: Note = {
          ...data,
          id: tempId,
          userId: 'temp',
          isPinned: data.isPinned || false,
          isArchived: data.isArchived || false,
          isFavorite: data.isFavorite || false,
          sortOrder: data.sortOrder || 0,
          items: data.items || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Note;

        set((state) => ({ notes: [newNote, ...state.notes] }));

        try {
          const created = await notesApi.create(data);
          set((state) => ({
            notes: state.notes.map((n) => (n.id === tempId ? created : n)),
          }));
        } catch (err: any) {
          // Revert optimistic update
          set((state) => ({ notes: state.notes.filter((n) => n.id !== tempId), error: err.message }));
        }
      },

      updateNote: async (id: string, data: Partial<Note>) => {
        // Optimistic UI
        const previousNotes = get().notes;
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n)),
        }));

        try {
          const updated = await notesApi.update(id, data);
          set((state) => ({
            notes: state.notes.map((n) => (n.id === id ? updated : n)),
          }));
        } catch (err: any) {
          // Revert on error
          set({ notes: previousNotes, error: err.message });
        }
      },

      deleteNote: async (id: string) => {
        const previousNotes = get().notes;
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));

        try {
          if (!id.startsWith('temp-')) {
            await notesApi.delete(id);
          }
        } catch (err: any) {
          set({ notes: previousNotes, error: err.message });
        }
      },

      duplicateNote: async (id: string) => {
        try {
          const duplicated = await notesApi.duplicate(id);
          set((state) => ({ notes: [duplicated, ...state.notes] }));
        } catch (err: any) {
          set({ error: err.message });
        }
      },

      sync: async () => {
        // Basic sync implementation (could be expanded for a true queue)
        // Here we just fetch fresh data
        set({ isSyncing: true });
        try {
          const notes = await notesApi.list();
          set({ notes, isSyncing: false, lastSyncedAt: Date.now() });
        } catch (err: any) {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ notes: state.notes, lastSyncedAt: state.lastSyncedAt }),
    }
  )
);
