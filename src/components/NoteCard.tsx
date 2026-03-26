import React, { useState } from 'react';
import { Note, useNoteStore } from '../store/useNoteStore';
import { Pin, Trash2, Edit3, Maximize2, X, Image as ImageIcon, ImageMinus, Eye, FileText, Palette, AlertTriangle, Book, ListTodo, Calendar, History, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'motion/react';
import { ListEditor } from './ListEditor';
import { ScheduleEditor } from './ScheduleEditor';
import { ScheduleItem } from '../store/useNoteStore';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const { togglePin, updateNote, revertToVersion, theme } = useNoteStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [localContent, setLocalContent] = useState(note.content);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleToggleEdit = () => {
    if (isEditing) {
      updateNote(note.id, { content: localContent });
    }
    setIsEditing(!isEditing);
  };

  const getScheduleItems = (content: string): ScheduleItem[] => {
    try {
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  };

  const setScheduleItems = (items: ScheduleItem[]) => {
    setLocalContent(JSON.stringify(items));
    updateNote(note.id, { content: JSON.stringify(items) });
  };

  const exportToExcel = () => {
    try {
      const items = JSON.parse(note.content);
      const worksheet = XLSX.utils.json_to_sheet(items.map((item: ScheduleItem) => ({
        'Tugas': item.task,
        'Tanggal': item.date,
        'Waktu': item.time,
        'Batas Waktu': item.dueDate,
        'Status': item.completed ? 'Selesai' : 'Belum Selesai'
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Jadwal");
      XLSX.writeFile(workbook, `${note.title || 'Jadwal'}.xlsx`);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  React.useEffect(() => {
    setLocalContent(note.content);
  }, [note.content]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar (maksimal 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateNote(note.id, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateNote(note.id, { imageUrl: undefined });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const getTypeIcon = () => {
    switch (note.type) {
      case 'diary': return <Book size={14} />;
      case 'list': return <ListTodo size={14} />;
      case 'schedule': return <Calendar size={14} />;
      default: return null;
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        className={cn(
          "group relative backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl",
          theme === 'dark' 
            ? "bg-white/10 border-white/10 hover:border-white/20" 
            : "bg-white border-slate-200 hover:border-blue-200 shadow-sm",
          note.isPinned && (theme === 'dark' ? "ring-1 ring-amber-500/50" : "ring-1 ring-amber-500 border-amber-200")
        )}
        style={{ 
          backgroundColor: note.color && note.color !== 'transparent' 
            ? theme === 'dark' ? `${note.color}22` : `${note.color}11` 
            : undefined,
          borderColor: note.color && note.color !== 'transparent' 
            ? theme === 'dark' ? `${note.color}44` : `${note.color}33` 
            : undefined
        }}
      >
      {note.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={note.imageUrl} 
            alt={note.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
            theme === 'dark' ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-500"
          )}>
            {getTypeIcon()}
            {note.type}
          </div>
        </div>
        <div className="flex justify-between items-start mb-3">
          <h3 className={cn(
            "text-lg font-bold line-clamp-2",
            theme === 'dark' ? "text-white/90" : "text-slate-900"
          )}>{note.title || 'Tanpa Judul'}</h3>
          <div className="flex gap-1">
            <button 
              onClick={() => setIsFullscreen(true)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                theme === 'dark' ? "text-white/20 hover:text-amber-400 hover:bg-amber-400/10" : "text-slate-300 hover:text-amber-600 hover:bg-slate-100"
              )}
              title="Layar Penuh"
            >
              <Maximize2 size={16} />
            </button>
            <button 
              onClick={() => togglePin(note.id)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                note.isPinned 
                  ? "text-amber-500 bg-amber-500/10" 
                  : theme === 'dark' 
                    ? "text-white/20 hover:text-white/60 hover:bg-white/5" 
                    : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
              )}
            >
              <Pin size={16} fill={note.isPinned ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {isEditing ? (
          note.type === 'list' ? (
            <ListEditor 
              items={localContent.split('\n').map(line => {
                const match = line.match(/^- \[( |x)\] (.*)/);
                if (match) {
                  return { text: match[2], checked: match[1] === 'x' };
                }
                return null;
              }).filter(Boolean) as { text: string; checked: boolean }[]}
              onUpdate={(items) => setLocalContent(items.map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`).join('\n'))}
              theme={theme}
            />
          ) : note.type === 'schedule' ? (
            <ScheduleEditor
              items={getScheduleItems(localContent)}
              onUpdate={setScheduleItems}
              theme={theme}
              readOnly={false}
            />
          ) : (
            <textarea
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              className={cn(
                "w-full bg-transparent border-none outline-none resize-none min-h-[120px] mb-4 font-mono text-sm custom-scrollbar",
                theme === 'dark' ? "text-white/80" : "text-slate-800"
              )}
              placeholder="Tulis konten catatan..."
              autoFocus
            />
          )
        ) : (
          note.type === 'schedule' ? (
            <div className="space-y-4">
              <ScheduleEditor
                items={getScheduleItems(note.content)}
                onUpdate={setScheduleItems}
                theme={theme}
                readOnly={true}
              />
            </div>
          ) : (
            <div className={cn(
            "prose prose-sm max-w-none mb-4 line-clamp-6",
            theme === 'dark' ? "prose-invert text-white/60" : "text-slate-700"
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                li({ children, checked, ...props }: any) {
                  if (checked !== null && checked !== undefined) {
                    return (
                      <li className="flex items-center gap-2 list-none" {...props}>
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const index = note.content.indexOf(String(children[0]?.props?.children || children[0] || ''));
                            if (index !== -1) {
                              const lines = note.content.split('\n');
                              const lineIndex = lines.findIndex(l => l.includes(String(children[0]?.props?.children || children[0] || '')));
                              if (lineIndex !== -1) {
                                const line = lines[lineIndex];
                                const newLine = line.replace(/^- \[( |x)\]/, `- [${checked ? ' ' : 'x'}]`);
                                lines[lineIndex] = newLine;
                                updateNote(note.id, { content: lines.join('\n') });
                              }
                            }
                          }}
                        />
                        <span className={cn(checked && "line-through opacity-50")}>
                          {children}
                        </span>
                      </li>
                    );
                  }
                  return <li {...props}>{children}</li>;
                },
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg !bg-black/30 !my-2"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={cn(
                      "px-1 rounded",
                      theme === 'dark' ? "bg-white/10" : "bg-slate-100 text-blue-600",
                      className
                    )} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        ))}

        <div className={cn(
          "flex items-center justify-between pt-4 border-t transition-opacity",
          theme === 'dark' ? "border-white/5 text-white/30" : "border-slate-50 text-slate-400",
          "opacity-40 group-hover:opacity-100"
        )}>
          <span className="text-[10px]">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex flex-wrap gap-1 justify-end">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={exportToExcel}
              className={cn(
                "p-2 rounded-lg transition-all",
                theme === 'dark' ? "text-white/40 hover:text-green-400 hover:bg-green-400/10" : "text-slate-400 hover:text-green-600 hover:bg-slate-100"
              )}
              title="Export ke Excel"
            >
              <FileText size={16} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "p-2 rounded-lg transition-all",
                theme === 'dark' ? "text-white/40 hover:text-green-400 hover:bg-green-400/10" : "text-slate-400 hover:text-green-600 hover:bg-slate-100"
              )}
              title={note.imageUrl ? "Ganti Gambar" : "Unggah Gambar"}
            >
              <ImageIcon size={16} />
            </button>
            {note.imageUrl && (
              <button 
                onClick={handleRemoveImage}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  theme === 'dark' ? "text-white/40 hover:text-orange-400 hover:bg-orange-400/10" : "text-slate-400 hover:text-orange-600 hover:bg-slate-100"
                )}
                title="Hapus Gambar"
              >
                <ImageMinus size={16} />
              </button>
            )}
            <div className="relative">
              <button 
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  showColorPicker 
                    ? "text-blue-500 bg-blue-500/10" 
                    : theme === 'dark' ? "text-white/40 hover:text-blue-400 hover:bg-blue-400/10" : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                )}
                title="Warna Catatan"
              >
                <Palette size={16} />
              </button>
              
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className={cn(
                      "absolute bottom-full right-0 mb-2 p-2 rounded-xl border shadow-2xl z-50 flex gap-1.5",
                      theme === 'dark' ? "bg-[#1a1a1c] border-white/10" : "bg-white border-slate-200"
                    )}
                  >
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          updateNote(note.id, { color: c.value });
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 active:scale-95",
                          note.color === c.value || (!note.color && c.value === 'transparent') 
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

            <button 
              onClick={handleToggleEdit}
              className={cn(
                "p-2 rounded-lg transition-all",
                isEditing 
                  ? "text-blue-500 bg-blue-500/10" 
                  : theme === 'dark' ? "text-white/40 hover:text-blue-400 hover:bg-blue-400/10" : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
              )}
              title={isEditing ? "Lihat Preview" : "Edit Cepat"}
            >
              {isEditing ? <Eye size={16} /> : <FileText size={16} />}
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className={cn(
                "p-2 rounded-lg transition-all",
                theme === 'dark' ? "text-white/40 hover:text-blue-400 hover:bg-blue-400/10" : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
              )}
              title="Riwayat Versi"
            >
              <History size={16} />
            </button>
            <button 
              onClick={() => onEdit(note)}
              className={cn(
                "p-2 rounded-lg transition-all",
                theme === 'dark' ? "text-white/40 hover:text-blue-400 hover:bg-blue-400/10" : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
              )}
            >
              <Edit3 size={16} />
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className={cn(
                "p-2 rounded-lg transition-all",
                theme === 'dark' ? "text-white/40 hover:text-red-400 hover:bg-red-400/10" : "text-slate-400 hover:text-red-600 hover:bg-slate-100"
              )}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFullscreen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] border md:rounded-3xl shadow-2xl overflow-hidden flex flex-col",
                theme === 'dark' ? "bg-[#1A202C] border-white/10" : "bg-white border-slate-200"
              )}
            >
              {/* Action Buttons */}
              <div className="sticky top-0 right-0 p-4 md:p-6 flex justify-end gap-2 z-20 backdrop-blur-md bg-inherit border-b border-inherit">
                <button 
                  onClick={() => setShowHistory(true)}
                  className={cn(
                    "p-2 md:p-3 rounded-xl md:rounded-2xl transition-all",
                    theme === 'dark' ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white" : "bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white"
                  )}
                  title="Riwayat Versi"
                >
                  <History size={window.innerWidth <= 768 ? 20 : 24} />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className={cn(
                    "p-2 md:p-3 rounded-xl md:rounded-2xl transition-all",
                    theme === 'dark' ? "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white" : "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                  )}
                  title="Hapus Catatan"
                >
                  <Trash2 size={window.innerWidth <= 768 ? 20 : 24} />
                </button>
                <button 
                  onClick={() => setIsFullscreen(false)}
                  className={cn(
                    "p-2 md:p-3 rounded-xl md:rounded-2xl transition-all",
                    theme === 'dark' ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  )}
                >
                  <X size={window.innerWidth <= 768 ? 20 : 24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                {note.imageUrl && (
                  <div className="w-full mb-10 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src={note.imageUrl} 
                      alt={note.title} 
                      className="w-full object-contain max-h-[50vh]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="max-w-3xl mx-auto">
                  <div className={cn(
                    "flex items-center gap-2 mb-4 px-3 py-1 rounded-full w-fit text-xs font-bold uppercase tracking-widest",
                    theme === 'dark' ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-500"
                  )}>
                    {getTypeIcon()}
                    {note.type}
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    {note.isPinned && <Pin size={20} className="text-amber-500 fill-amber-500" />}
                    <h2 className={cn(
                      "text-3xl md:text-5xl font-black tracking-tight",
                      theme === 'dark' ? "text-white" : "text-slate-900"
                    )}>
                      {note.title || 'Tanpa Judul'}
                    </h2>
                  </div>

                  <div className={cn(
                    "prose prose-lg md:prose-xl max-w-none",
                    theme === 'dark' ? "prose-invert text-white/80" : "text-slate-800"
                  )}>
                    {isEditing ? (
                      note.type === 'schedule' ? (
                        <ScheduleEditor
                          items={getScheduleItems(localContent)}
                          onUpdate={setScheduleItems}
                          theme={theme}
                          readOnly={false}
                        />
                      ) : (
                        <textarea
                          value={localContent}
                          onChange={(e) => setLocalContent(e.target.value)}
                          className={cn(
                            "w-full bg-transparent border-none outline-none resize-none min-h-[400px] font-mono custom-scrollbar",
                            theme === 'dark' ? "text-white/90" : "text-slate-900"
                          )}
                          placeholder="Tulis konten catatan..."
                          autoFocus
                        />
                      )
                    ) : note.type === 'schedule' ? (
                      <div className="space-y-6">
                        <div className="flex justify-end">
                          <button
                            onClick={exportToExcel}
                            className={cn(
                              "px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
                            )}
                          >
                            <FileText size={20} />
                            Export ke Excel (.xlsx)
                          </button>
                        </div>
                        <ScheduleEditor
                          items={getScheduleItems(note.content)}
                          onUpdate={setScheduleItems}
                          theme={theme}
                          readOnly={true}
                        />
                      </div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          li({ children, checked, ...props }: any) {
                            if (checked !== null && checked !== undefined) {
                              return (
                                <li className="flex items-center gap-2 list-none" {...props}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const lines = note.content.split('\n');
                                      const lineIndex = lines.findIndex(l => l.includes(String(children[0]?.props?.children || children[0] || '')));
                                      if (lineIndex !== -1) {
                                        const line = lines[lineIndex];
                                        const newLine = line.replace(/^- \[( |x)\]/, `- [${checked ? ' ' : 'x'}]`);
                                        lines[lineIndex] = newLine;
                                        updateNote(note.id, { content: lines.join('\n') });
                                      }
                                    }}
                                  />
                                  <span className={cn(checked && "line-through opacity-50")}>
                                    {children}
                                  </span>
                                </li>
                              );
                            }
                            return <li {...props}>{children}</li>;
                          },
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-2xl !bg-black/50 !p-6 !my-8 shadow-inner"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={cn(
                                "px-2 py-0.5 rounded-lg font-mono text-sm",
                                theme === 'dark' ? "bg-white/10 text-blue-300" : "bg-slate-100 text-blue-600",
                                className
                              )} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {note.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  <div className={cn(
                    "mt-20 pt-8 border-t flex items-center justify-between text-sm font-medium",
                    theme === 'dark' ? "border-white/5 text-white/30" : "border-slate-100 text-slate-400"
                  )}>
                    <span>Dibuat pada {new Date(note.createdAt).toLocaleString()}</span>
                    <span>Terakhir diubah {new Date(note.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "relative w-full max-w-sm border rounded-3xl shadow-2xl p-8 text-center",
                theme === 'dark' ? "bg-[#1a1a1c] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Hapus Catatan?</h3>
              <p className={cn(
                "mb-8",
                theme === 'dark' ? "text-white/50" : "text-slate-500"
              )}>Tindakan ini tidak dapat dibatalkan. Catatan Anda akan dihapus selamanya.</p>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onDelete(note.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Ya, Hapus Sekarang
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={cn(
                    "w-full py-3 rounded-xl font-medium transition-colors",
                    theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-100"
                  )}
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-xl max-h-[80vh] border rounded-3xl shadow-2xl flex flex-col overflow-hidden",
                theme === 'dark' ? "bg-[#1a1a1c] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <History size={20} />
                  </div>
                  <h3 className="text-xl font-bold">Riwayat Versi</h3>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    theme === 'dark' ? "hover:bg-white/5 text-white/50" : "hover:bg-slate-100 text-slate-500"
                  )}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {(!note.versions || note.versions.length === 0) ? (
                  <div className="text-center py-12">
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? "text-white/30" : "text-slate-400"
                    )}>Belum ada riwayat perubahan untuk catatan ini.</p>
                  </div>
                ) : (
                  note.versions.map((version) => (
                    <div 
                      key={version.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all group",
                        theme === 'dark' ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn(
                          "text-xs font-medium",
                          theme === 'dark' ? "text-white/40" : "text-slate-500"
                        )}>
                          {new Date(version.updatedAt).toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            revertToVersion(note.id, version.id);
                            setShowHistory(false);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20"
                        >
                          <RotateCcw size={14} />
                          Kembalikan
                        </button>
                      </div>
                      <h4 className={cn(
                        "text-sm font-bold mb-1",
                        theme === 'dark' ? "text-white/90" : "text-slate-900"
                      )}>{version.title || 'Tanpa Judul'}</h4>
                      <p className={cn(
                        "text-xs line-clamp-2",
                        theme === 'dark' ? "text-white/40" : "text-slate-500"
                      )}>{version.content}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
