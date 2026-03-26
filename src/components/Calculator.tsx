import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNoteStore } from '../store/useNoteStore';
import { cn } from '../lib/utils';
import { Delete, RotateCcw, Equal } from 'lucide-react';

export const Calculator: React.FC = () => {
  const { theme } = useNoteStore();
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      // Using Function constructor as a safer alternative to eval for simple math
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${fullEquation.replace(/x/g, '*')}`)();
      setDisplay(String(result));
      setEquation('');
    } catch (error) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    { label: 'C', action: clear, type: 'danger' },
    { label: '⌫', action: backspace, type: 'action', icon: <Delete size={20} /> },
    { label: '%', action: () => setDisplay(String(Number(display) / 100)), type: 'action' },
    { label: '/', action: () => handleOperator('/'), type: 'operator' },
    { label: '7', action: () => handleNumber('7') },
    { label: '8', action: () => handleNumber('8') },
    { label: '9', action: () => handleNumber('9') },
    { label: 'x', action: () => handleOperator('x'), type: 'operator' },
    { label: '4', action: () => handleNumber('4') },
    { label: '5', action: () => handleNumber('5') },
    { label: '6', action: () => handleNumber('6') },
    { label: '-', action: () => handleOperator('-'), type: 'operator' },
    { label: '1', action: () => handleNumber('1') },
    { label: '2', action: () => handleNumber('2') },
    { label: '3', action: () => handleNumber('3') },
    { label: '+', action: () => handleOperator('+'), type: 'operator' },
    { label: '0', action: () => handleNumber('0'), span: 2 },
    { label: '.', action: () => handleNumber('.') },
    { label: '=', action: calculate, type: 'equals', icon: <Equal size={20} /> },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-sm p-6 rounded-[2.5rem] shadow-2xl border",
          theme === 'dark' ? "bg-[#1A202C] border-white/10" : "bg-white border-slate-200"
        )}
      >
        <div className="mb-6 text-right px-4">
          <div className={cn(
            "text-sm font-medium h-6 mb-1",
            theme === 'dark' ? "text-white/30" : "text-slate-400"
          )}>
            {equation}
          </div>
          <div className={cn(
            "text-5xl font-black tracking-tighter truncate",
            theme === 'dark' ? "text-white" : "text-slate-900"
          )}>
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className={cn(
                "h-16 rounded-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-95",
                btn.span === 2 && "col-span-2",
                !btn.type && (theme === 'dark' ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"),
                btn.type === 'operator' && "bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white",
                btn.type === 'action' && (theme === 'dark' ? "bg-white/10 text-white/60 hover:text-white" : "bg-slate-200 text-slate-600 hover:text-slate-900"),
                btn.type === 'danger' && "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white",
                btn.type === 'equals' && "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
              )}
            >
              {btn.icon || btn.label}
            </button>
          ))}
        </div>
      </motion.div>
      
      <p className={cn(
        "mt-8 text-sm font-medium flex items-center gap-2",
        theme === 'dark' ? "text-white/20" : "text-slate-400"
      )}>
        <RotateCcw size={14} />
        Kalkulator Sederhana untuk DailyStory.co
      </p>
    </div>
  );
};
