import React, { useState, useEffect } from 'react';
import { useNoteStore } from '../store/useNoteStore';
import { 
  Search, 
  LayoutGrid, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Star,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { SettingsDialog, SettingsMenu } from './SettingsMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { 
    searchQuery, 
    setSearchQuery, 
    theme,
    toggleTheme,
    activeView,
    setActiveView
  } = useNoteStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      theme === 'dark' ? "bg-[#2D3748] text-white dark" : "bg-[#F3F4F6] text-slate-900"
    )}>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth > 1024) && (
          <motion.aside
            initial={window.innerWidth <= 1024 ? { x: -280 } : false}
            animate={{ 
              width: isSidebarOpen ? 260 : 80,
              x: 0,
            }}
            exit={window.innerWidth <= 1024 ? { x: -280 } : undefined}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed left-0 top-0 h-full border-r z-50 flex flex-col transition-all",
              theme === 'dark' 
                ? "bg-white/10 border-white/5 backdrop-blur-2xl" 
                : "bg-white border-gray-200 shadow-xl",
              window.innerWidth <= 1024 && "w-[280px]"
            )}
          >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              DailyStory.co
            </motion.h1>
          )}
          <button 
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-xl transition-colors",
              theme === 'dark' ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-gray-600"
            )}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={<LayoutGrid size={20} />} 
            label="Semua Catatan" 
            active={activeView === 'notes'} 
            collapsed={!isSidebarOpen}
            onClick={() => {
              setActiveView('notes');
              if (window.innerWidth <= 1024) setIsSidebarOpen(false);
            }}
            theme={theme}
          />
          <SidebarItem 
            icon={<Star size={20} />} 
            label="Favorit" 
            collapsed={!isSidebarOpen}
            theme={theme}
          />
          
          <div className={cn(
            "my-4 mx-4 h-px transition-colors",
            theme === 'dark' ? "bg-white/10" : "bg-slate-200"
          )} />

          <SidebarItem 
            icon={<Calculator size={20} />} 
            label="Kalkulator" 
            active={activeView === 'calculator'}
            collapsed={!isSidebarOpen}
            onClick={() => {
              setActiveView('calculator');
              if (window.innerWidth <= 1024) setIsSidebarOpen(false);
            }}
            theme={theme}
          />
        </nav>

        <div className={cn(
          "p-4 border-t space-y-2",
          theme === 'dark' ? "border-white/5" : "border-gray-100"
        )}>
          <SidebarItem 
            icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} 
            label={theme === 'dark' ? "Mode Terang" : "Mode Gelap"} 
            collapsed={!isSidebarOpen}
            onClick={toggleTheme}
            theme={theme}
          />
        </div>
      </motion.aside>
        )}
      </AnimatePresence>

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        "lg:pl-[260px]",
        (!isSidebarOpen && window.innerWidth > 1024) && "lg:pl-[80px]",
        "pl-0"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-transparent backdrop-blur-md px-4 lg:px-8 py-4 flex items-center gap-4 justify-between">
          <button 
            onClick={toggleSidebar}
            className={cn(
              "lg:hidden p-2 rounded-xl transition-colors",
              theme === 'dark' ? "bg-white/5 text-white" : "bg-white text-slate-600 shadow-sm"
            )}
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full max-w-xl">
            {activeView === 'notes' ? (
              <>
                <Search className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2",
                  theme === 'dark' ? "text-white/30" : "text-slate-400"
                )} size={18} />
                <input 
                  type="text" 
                  placeholder="Cari catatan, ide, atau aset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full border rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all",
                    theme === 'dark' 
                      ? "bg-white/10 border-white/10 placeholder:text-white/20" 
                      : "bg-white border-slate-200 placeholder:text-slate-400 shadow-sm"
                  )}
                />
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveView('notes')}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    theme === 'dark' ? "hover:bg-white/5 text-white/50" : "hover:bg-slate-100 text-slate-500"
                  )}
                >
                  <LayoutGrid size={20} />
                </button>
                <h2 className={cn(
                  "text-2xl font-black tracking-tight",
                  theme === 'dark' ? "text-white" : "text-slate-900"
                )}>Kalkulator</h2>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={cn(
                "p-2 rounded-xl transition-all",
                theme === 'dark' ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  theme: 'light' | 'dark';
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, collapsed, onClick, theme }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative",
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
          : theme === 'dark'
            ? "hover:bg-white/5 text-white/60 hover:text-white"
            : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
      {collapsed && (
        <div className={cn(
          "absolute left-full ml-4 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg",
          theme === 'dark' ? "bg-white text-black" : "bg-gray-900 text-white"
        )}>
          {label}
        </div>
      )}
    </button>
  );
};
