import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { NoteInput } from './components/NoteInput';
import { NoteCard } from './components/NoteCard';
import { Calculator } from './components/Calculator';
import { useNoteStore, Note } from './store/useNoteStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2 } from 'lucide-react';
import { cn } from './lib/utils';
import { ListEditor } from './components/ListEditor';
import { ScheduleEditor } from './components/ScheduleEditor';
import { ScheduleItem } from './store/useNoteStore';
import { NotificationService } from './services/NotificationService';
import * as XLSX from 'xlsx';

export default function App() {
  const { notes, searchQuery, updateNote, deleteNote, theme, activeView } = useNoteStore();
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Notification Checker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      notes.forEach(note => {
        if (note.type === 'schedule') {
          try {
            const items: ScheduleItem[] = JSON.parse(note.content);
            items.forEach(item => {
              if (item.reminder && !item.completed && item.date === today && item.time === currentTime) {
                NotificationService.showNotification(
                  "Pengingat Jadwal",
                  `Waktunya untuk: ${item.task}`
                );
              }
            });
          } catch (e) {
            // Ignore parse errors
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const matchesSearch = 
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, searchQuery]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNote) {
      updateNote(editingNote.id, editingNote);
      setEditingNote(null);
    }
  };

  const getListItems = (content: string) => {
    return content.split('\n').map(line => {
      const match = line.match(/^- \[( |x)\] (.*)/);
      if (match) {
        return { text: match[2], checked: match[1] === 'x' };
      }
      return null;
    }).filter(Boolean) as { text: string; checked: boolean }[];
  };

  const setListItems = (items: { text: string; checked: boolean }[]) => {
    if (editingNote) {
      const newContent = items.map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`).join('\n');
      setEditingNote({ ...editingNote, content: newContent });
    }
  };

  const getScheduleItems = (content: string): ScheduleItem[] => {
    try {
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  };

  const setScheduleItems = (items: ScheduleItem[]) => {
    if (editingNote) {
      setEditingNote({ ...editingNote, content: JSON.stringify(items) });
    }
  };

  const exportToExcel = (noteTitle: string, content: string) => {
    try {
      const items = JSON.parse(content);
      const worksheet = XLSX.utils.json_to_sheet(items.map((item: ScheduleItem) => ({
        'Tugas': item.task,
        'Tanggal': item.date,
        'Waktu': item.time,
        'Batas Waktu': item.dueDate,
        'Status': item.completed ? 'Selesai' : 'Belum Selesai'
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Jadwal");
      XLSX.writeFile(workbook, `${noteTitle || 'Jadwal'}.xlsx`);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <Layout>
      {activeView === 'notes' ? (
        <>
          <NoteInput />

          {/* Masonry-like Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid">
                  <NoteCard 
                    note={note} 
                    onEdit={setEditingNote} 
                    onDelete={deleteNote}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>

          {filteredNotes.length === 0 && (
            <div className={cn(
              "flex flex-col items-center justify-center py-20",
              theme === 'dark' ? "text-white/20" : "text-slate-200"
            )}>
              <div className={cn(
                "w-20 h-20 border-2 border-dashed rounded-full flex items-center justify-center mb-4",
                theme === 'dark' ? "border-white/10" : "border-slate-200"
              )}>
                <X size={40} />
              </div>
              <p className="text-lg font-medium">Tidak ada catatan ditemukan</p>
            </div>
          )}
        </>
      ) : (
        <Calculator />
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingNote(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-[#1a1a1c] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <form onSubmit={handleUpdate} className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Edit Catatan</h2>
                  <button 
                    type="button"
                    onClick={() => setEditingNote(null)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-100"
                    )}
                  >
                    <X size={24} />
                  </button>
                </div>

                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  placeholder="Judul"
                  className={cn(
                    "w-full border rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500/50",
                    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                />

                {editingNote.type === 'list' ? (
                  <ListEditor 
                    items={getListItems(editingNote.content)} 
                    onUpdate={setListItems} 
                    theme={theme} 
                  />
                ) : editingNote.type === 'schedule' ? (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => exportToExcel(editingNote.title, editingNote.content)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2",
                          theme === 'dark' ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" : "bg-green-100 text-green-700 hover:bg-green-200"
                        )}
                      >
                        Export ke Excel (.xlsx)
                      </button>
                    </div>
                    <ScheduleEditor
                      items={getScheduleItems(editingNote.content)}
                      onUpdate={setScheduleItems}
                      theme={theme}
                    />
                  </div>
                ) : (
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    placeholder="Isi catatan..."
                    rows={8}
                    className={cn(
                      "w-full border rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none",
                      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  />
                )}

                <div className="flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingNote) {
                        deleteNote(editingNote.id);
                        setEditingNote(null);
                      }
                    }}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2",
                      theme === 'dark' ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
                    )}
                  >
                    <Trash2 size={20} />
                    Hapus
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingNote(null)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl font-medium transition-colors",
                        theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-100"
                      )}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      <Save size={20} />
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
