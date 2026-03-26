import React, { useState, useEffect } from 'react';
import { useNoteStore, NoteType } from '../store/useNoteStore';
import { Plus, Image as ImageIcon, X, Palette, Book, ListTodo, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ListEditor } from './ListEditor';
import { ScheduleEditor } from './ScheduleEditor';
import { ScheduleItem } from '../store/useNoteStore';

export const NoteInput: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<NoteType>('diary');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [listItems, setListItems] = useState<{ text: string; checked: boolean }[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('transparent');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const { addNote, theme } = useNoteStore();
  const DRAFT_KEY = 'mnemo_note_draft';

  const addListItem = () => {
    setListItems([...listItems, { text: '', checked: false }]);
  };

  const updateListItem = (index: number, text: string) => {
    const newList = [...listItems];
    newList[index].text = text;
    setListItems(newList);
  };

  const removeListItem = (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index));
  };

  const toggleListItem = (index: number) => {
    const newList = [...listItems];
    newList[index].checked = !newList[index].checked;
    setListItems(newList);
  };

  const colors = [
    { name: 'Default', value: 'transparent' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Slate', value: '#64748b' },
  ];

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const { title: savedTitle, content: savedContent, imageUrl: savedImageUrl, color: savedColor, mode: savedMode } = JSON.parse(savedDraft);
        if (savedTitle || savedContent || savedImageUrl || savedColor || savedMode) {
          setTitle(savedTitle || '');
          setContent(savedContent || '');
          setImageUrl(savedImageUrl || '');
          setColor(savedColor || 'transparent');
          setMode(savedMode || 'diary');
          
          if (savedMode === 'list' && savedContent) {
            const items = savedContent.split('\n').map(line => {
              const match = line.match(/^- \[( |x)\] (.*)/);
              if (match) {
                return { text: match[2], checked: match[1] === 'x' };
              }
              return null;
            }).filter(Boolean) as { text: string; checked: boolean }[];
            if (items.length > 0) setListItems(items);
          }

          if (savedMode === 'schedule' && savedContent) {
            try {
              const items = JSON.parse(savedContent);
              if (Array.isArray(items)) setScheduleItems(items);
            } catch (e) {
              console.error('Failed to parse schedule draft', e);
            }
          }
          
          setIsExpanded(true);
        }
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (title.trim() || content.trim() || listItems.length > 0 || scheduleItems.length > 0 || imageUrl.trim() || color !== 'transparent') {
        let finalContent = content;
        if (mode === 'list') {
          finalContent = listItems.map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`).join('\n');
        } else if (mode === 'schedule') {
          finalContent = JSON.stringify(scheduleItems);
        }
        const draft = { title, content: finalContent, imageUrl, color, mode };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [title, content, listItems, scheduleItems, imageUrl, color, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalContent = content;
    if (mode === 'list') {
      finalContent = listItems.map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`).join('\n');
    } else if (mode === 'schedule') {
      finalContent = JSON.stringify(scheduleItems);
    }

    if (!title.trim() && !finalContent.trim()) return;

    addNote({
      title,
      content: finalContent,
      type: mode,
      imageUrl: imageUrl.trim() || undefined,
      color: color !== 'transparent' ? color : undefined,
      isPinned: false,
    });

    setTitle('');
    setContent('');
    setListItems([]);
    setScheduleItems([]);
    setImageUrl('');
    setColor('transparent');
    setMode('diary');
    setIsExpanded(false);
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setListItems([]);
    setScheduleItems([]);
    setImageUrl('');
    setColor('transparent');
    setMode('diary');
    setIsExpanded(false);
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleModeChange = (newMode: NoteType) => {
    setMode(newMode);
    if (newMode === 'list') {
      setTitle('Daftar Belanja');
      setListItems([
        { text: 'Susu', checked: false },
        { text: 'Roti', checked: false },
        { text: 'Telur', checked: false }
      ]);
    } else if (newMode === 'schedule') {
      setTitle('Jadwal Harian');
      setScheduleItems([
        { id: crypto.randomUUID(), task: 'Bangun Tidur', date: new Date().toISOString().split('T')[0], time: '06:00', dueDate: new Date().toISOString().split('T')[0], completed: false, dependencies: [], reminder: false },
        { id: crypto.randomUUID(), task: 'Sarapan', date: new Date().toISOString().split('T')[0], time: '07:30', dueDate: new Date().toISOString().split('T')[0], completed: false, dependencies: [], reminder: false },
        { id: crypto.randomUUID(), task: 'Kerja/Belajar', date: new Date().toISOString().split('T')[0], time: '09:00', dueDate: new Date().toISOString().split('T')[0], completed: false, dependencies: [], reminder: false }
      ]);
    } else {
      setTitle('');
      setContent('');
      setListItems([]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {[
          { id: 'diary', label: 'Diary', icon: <Book size={16} /> },
          { id: 'list', label: 'List', icon: <ListTodo size={16} /> },
          { id: 'schedule', label: 'Schedule', icon: <Calendar size={16} /> },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id as NoteType)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all",
              mode === m.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : theme === 'dark' ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            )}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <form 
        onSubmit={handleSubmit}
        className={cn(
          "backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 shadow-2xl",
          theme === 'dark' 
            ? "bg-white/10 border-white/10" 
            : "bg-white border-slate-200 shadow-lg",
          isExpanded ? "ring-2 ring-blue-500/50" : "hover:border-blue-500/30"
        )}
        style={{ 
          backgroundColor: color !== 'transparent' 
            ? theme === 'dark' ? `${color}22` : `${color}11` 
            : undefined,
          borderColor: color !== 'transparent' 
            ? theme === 'dark' ? `${color}44` : `${color}33` 
            : undefined
        }}
      >
        {isExpanded && (
          <motion.input
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            type="text"
            placeholder="Judul Catatan..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(
              "w-full bg-transparent border-none outline-none text-xl font-semibold mb-3",
              theme === 'dark' ? "placeholder:text-white/30 text-white" : "placeholder:text-slate-400 text-slate-900"
            )}
          />
        )}
        
        {mode === 'list' ? (
          <ListEditor 
            items={listItems} 
            onUpdate={setListItems} 
            theme={theme} 
          />
        ) : mode === 'schedule' ? (
          <ScheduleEditor
            items={scheduleItems}
            onUpdate={setScheduleItems}
            theme={theme}
          />
        ) : (
          <textarea
            placeholder="Tulis sesuatu... (Mendukung Markdown & Kode)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className={cn(
              "w-full bg-transparent border-none outline-none resize-none min-h-[40px]",
              theme === 'dark' ? "placeholder:text-white/30 text-white" : "placeholder:text-slate-400 text-slate-900"
            )}
            rows={isExpanded ? 4 : 1}
          />
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {imageUrl && (
                <div className={cn(
                  "relative w-full h-32 mb-4 rounded-lg overflow-hidden border",
                  theme === 'dark' ? "border-white/10" : "border-slate-200"
                )}>
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className={cn(
                "flex items-center justify-between pt-4 border-t",
                theme === 'dark' ? "border-white/10" : "border-slate-100"
              )}>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Masukkan URL Gambar:');
                      if (url) setImageUrl(url);
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark' ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                    )}
                    title="Tambah Gambar"
                  >
                    <ImageIcon size={20} />
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        showColorPicker 
                          ? "text-blue-500 bg-blue-500/10" 
                          : theme === 'dark' ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                      )}
                      title="Pilih Warna"
                    >
                      <Palette size={20} />
                    </button>

                    <AnimatePresence>
                      {showColorPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className={cn(
                            "absolute bottom-full left-0 mb-2 p-2 rounded-xl border shadow-2xl z-50 flex gap-1.5",
                            theme === 'dark' ? "bg-[#1a1a1c] border-white/10" : "bg-white border-slate-200"
                          )}
                        >
                          {colors.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => {
                                setColor(c.value);
                                setShowColorPicker(false);
                              }}
                              className={cn(
                                "w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 active:scale-95",
                                color === c.value 
                                  ? "border-blue-500" 
                                  : "border-transparent"
                              )}
                              style={{ backgroundColor: c.value === 'transparent' ? 'white' : c.value }}
                              title={c.name}
                            >
                              {c.value === 'transparent' && <div className="w-full h-full border-b-2 border-red-500 rotate-45" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      theme === 'dark' ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-600"
                    )}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
