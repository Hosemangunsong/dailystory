import React from 'react';
import { Settings, X, Bell, Trash2, Download, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNoteStore } from '../store/useNoteStore';
import { NotificationService } from '../services/NotificationService';
import { cn } from '../lib/utils';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, notes, clearAllNotes } = useNoteStore();

  const handleRequestPermission = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      NotificationService.showNotification("DailyStory.co", "Notifikasi telah diaktifkan!");
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "dailystory_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-md border rounded-3xl shadow-2xl overflow-hidden flex flex-col",
              theme === 'dark' ? "bg-[#1A202C] border-white/10" : "bg-white border-slate-200"
            )}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Pengaturan</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">Tampilan & Notifikasi</h3>
                
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                    theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-amber-500" />}
                    <span className="font-medium">Mode {theme === 'dark' ? 'Gelap' : 'Terang'}</span>
                  </div>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    theme === 'dark' ? "bg-blue-600" : "bg-slate-300"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      theme === 'dark' ? "left-6" : "left-1"
                    )} />
                  </div>
                </button>

                <button
                  onClick={handleRequestPermission}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                    theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-purple-400" />
                    <span className="font-medium">Aktifkan Notifikasi</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase opacity-50">Minta Izin</span>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">Data & Backup</h3>
                
                <button
                  onClick={handleExport}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                    theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Download size={20} className="text-green-400" />
                    <span className="font-medium">Export Semua Catatan</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase opacity-50">JSON</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm("Apakah Anda yakin ingin menghapus semua catatan? Tindakan ini tidak dapat dibatalkan.")) {
                      clearAllNotes();
                      onClose();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                    "bg-red-500/10 hover:bg-red-500/20 text-red-500"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={20} />
                    <span className="font-medium">Hapus Semua Data</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase opacity-50">Berbahaya</span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-black/20 text-center">
              <p className="text-[10px] opacity-30 uppercase tracking-widest font-bold">DailyStory.co v1.2.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const SettingsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme } = useNoteStore();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "p-2 rounded-xl transition-all",
          theme === 'dark' ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
        )}
      >
        <Settings size={20} />
      </button>
      <SettingsDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
