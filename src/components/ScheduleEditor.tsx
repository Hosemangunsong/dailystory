import React from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Bell, BellOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { ScheduleItem } from '../store/useNoteStore';

interface ScheduleEditorProps {
  items: ScheduleItem[];
  onUpdate: (items: ScheduleItem[]) => void;
  theme: 'light' | 'dark';
  readOnly?: boolean;
}

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ items, onUpdate, theme, readOnly }) => {
  const addItem = () => {
    const newItem: ScheduleItem = {
      id: crypto.randomUUID(),
      task: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      dependencies: [],
      reminder: false,
    };
    onUpdate([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<ScheduleItem>) => {
    onUpdate(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const isExpired = (date: string, time: string) => {
    if (!date || !time) return false;
    const scheduleDateTime = new Date(`${date}T${time}`);
    return scheduleDateTime < new Date();
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date || !time) return '';
    const dt = new Date(`${date}T${time}`);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(dt);
  };

  return (
    <div className="mb-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className={cn(
              "text-left border-b",
              theme === 'dark' ? "border-white/10 text-white/50" : "border-slate-200 text-slate-500"
            )}>
              <th className="pb-2 font-medium text-[10px] uppercase tracking-wider w-10 text-center">Status</th>
              <th className="pb-2 font-medium text-[10px] uppercase tracking-wider">Tugas / Kegiatan</th>
              <th className="pb-2 font-medium text-[10px] uppercase tracking-wider w-40">Waktu Pelaksanaan</th>
              <th className="pb-2 font-medium text-[10px] uppercase tracking-wider w-40">Batas Waktu</th>
              <th className="pb-2 font-medium text-[10px] uppercase tracking-wider w-10 text-center">Pengingat</th>
              <th className="pb-2 font-medium text-[10px] uppercase tracking-wider w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {items.map((item) => {
              const expired = isExpired(item.dueDate || item.date, item.time);
              const shouldHighlight = expired && !item.completed;

              return (
                <tr key={item.id} className="group">
                  <td className="py-3 text-center">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => updateItem(item.id, { completed: !item.completed })}
                        className={cn(
                          "transition-colors",
                          item.completed ? "text-green-500" : "text-slate-400 hover:text-blue-500",
                          readOnly && "cursor-default"
                        )}
                      >
                        {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {readOnly ? (
                      <div className={cn(
                        "text-sm",
                        theme === 'dark' ? "text-white" : "text-slate-900",
                        item.completed && "opacity-50"
                      )}>
                        {item.task}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item.task}
                        onChange={(e) => updateItem(item.id, { task: e.target.value })}
                        placeholder="Nama tugas..."
                        className={cn(
                          "w-full bg-transparent border-none outline-none text-sm transition-all",
                          theme === 'dark' ? "text-white" : "text-slate-900"
                        )}
                      />
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {readOnly ? (
                      <div className={cn(
                        "text-[10px] font-medium",
                        theme === 'dark' ? "text-white/60" : "text-slate-500"
                      )}>
                        {formatDateTime(item.date, item.time)}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItem(item.id, { date: e.target.value })}
                          className={cn(
                            "w-full bg-transparent border-none outline-none text-[10px] cursor-pointer",
                            theme === 'dark' ? "text-white" : "text-slate-900"
                          )}
                        />
                        <input
                          type="time"
                          value={item.time}
                          onChange={(e) => updateItem(item.id, { time: e.target.value })}
                          className={cn(
                            "w-full bg-transparent border-none outline-none text-[10px] cursor-pointer",
                            theme === 'dark' ? "text-white" : "text-slate-900"
                          )}
                        />
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {readOnly ? (
                      <div className={cn(
                        "text-[10px] font-medium",
                        theme === 'dark' ? "text-white/60" : "text-slate-500",
                        shouldHighlight && "text-red-400"
                      )}>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateItem(item.id, { dueDate: e.target.value })}
                        className={cn(
                          "w-full bg-transparent border-none outline-none text-sm cursor-pointer",
                          theme === 'dark' ? "text-white" : "text-slate-900",
                          shouldHighlight && "text-red-400"
                        )}
                      />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => updateItem(item.id, { reminder: !item.reminder })}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        item.reminder 
                          ? "text-amber-500 bg-amber-500/10" 
                          : theme === 'dark' ? "text-white/20 hover:text-white/40" : "text-slate-300 hover:text-slate-500",
                        readOnly && "cursor-default"
                      )}
                    >
                      {item.reminder ? <Bell size={16} /> : <BellOff size={16} />}
                    </button>
                  </td>
                  <td className="py-3">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => {
          const expired = isExpired(item.dueDate || item.date, item.time);
          const shouldHighlight = expired && !item.completed;

          return (
            <div 
              key={item.id}
              className={cn(
                "p-4 rounded-2xl border space-y-4",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => updateItem(item.id, { completed: !item.completed })}
                    className={cn(
                      "flex-shrink-0 transition-all transform active:scale-90",
                      item.completed ? "text-green-500" : "text-slate-400 hover:text-blue-500"
                    )}
                  >
                    {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  {readOnly ? (
                    <div className={cn(
                      "text-base font-semibold tracking-tight",
                      theme === 'dark' ? "text-white" : "text-slate-900",
                      item.completed && "opacity-50"
                    )}>
                      {item.task}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={item.task}
                      onChange={(e) => updateItem(item.id, { task: e.target.value })}
                      placeholder="Apa yang ingin dilakukan?"
                      className={cn(
                        "w-full bg-transparent border-none outline-none text-base font-semibold tracking-tight",
                        theme === 'dark' ? "text-white placeholder:text-white/20" : "text-slate-900 placeholder:text-slate-400"
                      )}
                    />
                  )}
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={cn(
                  "p-3 rounded-xl space-y-1",
                  theme === 'dark' ? "bg-white/5" : "bg-slate-50"
                )}>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Pelaksanaan</span>
                  {readOnly ? (
                    <div className="text-xs font-medium text-slate-600 dark:text-white/70">
                      {formatDateTime(item.date, item.time)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateItem(item.id, { date: e.target.value })}
                        className="bg-transparent text-xs font-medium outline-none dark:text-white w-full"
                      />
                      <input
                        type="time"
                        value={item.time}
                        onChange={(e) => updateItem(item.id, { time: e.target.value })}
                        className="bg-transparent text-xs font-medium outline-none dark:text-white w-full"
                      />
                    </div>
                  )}
                </div>
                <div className={cn(
                  "p-3 rounded-xl space-y-1",
                  theme === 'dark' ? "bg-white/5" : "bg-slate-50",
                  shouldHighlight && "bg-red-500/5 border border-red-500/20"
                )}>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">Batas Waktu</span>
                  {readOnly ? (
                    <div className={cn(
                      "text-xs font-medium",
                      shouldHighlight ? "text-red-500" : "text-slate-600 dark:text-white/70"
                    )}>
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => updateItem(item.id, { dueDate: e.target.value })}
                      className={cn(
                        "bg-transparent text-xs font-medium outline-none w-full",
                        shouldHighlight ? "text-red-500" : "dark:text-white"
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => updateItem(item.id, { reminder: !item.reminder })}
                  className={cn(
                    "px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider",
                    item.reminder 
                      ? "text-amber-600 bg-amber-500/20 shadow-sm shadow-amber-500/10" 
                      : "text-slate-400 bg-slate-100 dark:bg-white/5"
                  )}
                >
                  {item.reminder ? <Bell size={14} className="fill-current" /> : <BellOff size={14} />}
                  {item.reminder ? "Aktif" : "Ingatkan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className={cn(
          "text-center py-8 text-sm",
          theme === 'dark' ? "text-white/30" : "text-slate-400"
        )}>
          Belum ada jadwal. Klik tombol di bawah untuk menambah.
        </div>
      )}
      {!readOnly && (
        <button
          type="button"
          onClick={addItem}
          className={cn(
            "flex items-center gap-2 text-sm font-medium mt-4 px-3 py-2 rounded-lg transition-colors w-full md:w-auto justify-center md:justify-start",
            theme === 'dark' ? "bg-white/5 text-blue-400 hover:bg-white/10" : "bg-slate-100 text-blue-600 hover:bg-slate-200"
          )}
        >
          <Plus size={16} />
          Tambah Jadwal
        </button>
      )}
    </div>
  );
};
