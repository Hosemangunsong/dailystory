import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NoteType = 'diary' | 'list' | 'schedule';

export interface ScheduleItem {
  id: string;
  task: string;
  date: string;
  time: string;
  dueDate: string;
  completed: boolean;
  dependencies?: string[];
  reminder?: boolean;
}

export interface NoteVersion {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  isPinned: boolean;
  imageUrl?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
  versions?: NoteVersion[];
}

interface NoteState {
  notes: Note[];
  searchQuery: string;
  theme: 'light' | 'dark';
  activeView: 'notes' | 'calculator';
  
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => void;
  updateNote: (id: string, note: Partial<Note>, saveVersion?: boolean) => void;
  revertToVersion: (noteId: string, versionId: string) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  clearAllNotes: () => void;
  setActiveView: (view: 'notes' | 'calculator') => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: [],
      searchQuery: '',
      theme: 'dark',
      activeView: 'notes',

      addNote: (noteData) => set((state) => ({
        notes: [
          {
            ...noteData,
            id: crypto.randomUUID(),
            type: noteData.type || 'diary',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            versions: [],
          },
          ...state.notes,
        ],
      })),

      updateNote: (id, noteData, saveVersion = true) => set((state) => ({
        notes: state.notes.map((n) => {
          if (n.id === id) {
            const updatedNote = { ...n, ...noteData, updatedAt: Date.now() };
            
            // Only save version if title or content changed and saveVersion is true
            const hasChanged = noteData.title !== undefined || noteData.content !== undefined;
            if (saveVersion && hasChanged) {
              const newVersion: NoteVersion = {
                id: crypto.randomUUID(),
                title: n.title,
                content: n.content,
                updatedAt: n.updatedAt,
              };
              updatedNote.versions = [newVersion, ...(n.versions || [])].slice(0, 20); // Keep last 20 versions
            }
            
            return updatedNote;
          }
          return n;
        }),
      })),

      revertToVersion: (noteId, versionId) => set((state) => ({
        notes: state.notes.map((n) => {
          if (n.id === noteId) {
            const version = n.versions?.find(v => v.id === versionId);
            if (version) {
              // Before reverting, save current state as a version
              const currentAsVersion: NoteVersion = {
                id: crypto.randomUUID(),
                title: n.title,
                content: n.content,
                updatedAt: n.updatedAt,
              };
              
              return {
                ...n,
                title: version.title,
                content: version.content,
                updatedAt: Date.now(),
                versions: [currentAsVersion, ...(n.versions || []).filter(v => v.id !== versionId)].slice(0, 20)
              };
            }
          }
          return n;
        })
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      })),

      togglePin: (id) => set((state) => ({
        notes: state.notes.map((n) => 
          n.id === id ? { ...n, isPinned: !n.isPinned } : n
        ),
      })),

      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      clearAllNotes: () => set({ notes: [] }),
      setActiveView: (view) => set({ activeView: view }),
    }),
    {
      name: 'dailystory-storage',
    }
  )
);
