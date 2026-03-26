import React from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ListItem {
  text: string;
  checked: boolean;
}

interface ListEditorProps {
  items: ListItem[];
  onUpdate: (items: ListItem[]) => void;
  theme: 'light' | 'dark';
}

export const ListEditor: React.FC<ListEditorProps> = ({ items, onUpdate, theme }) => {
  const addListItem = () => {
    onUpdate([...items, { text: '', checked: false }]);
  };

  const updateListItem = (index: number, text: string) => {
    const newList = [...items];
    newList[index].text = text;
    onUpdate(newList);
  };

  const removeListItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const toggleListItem = (index: number) => {
    const newList = [...items];
    newList[index].checked = !newList[index].checked;
    onUpdate(newList);
  };

  return (
    <div className="space-y-2 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 group">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => toggleListItem(index)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateListItem(index, e.target.value)}
            placeholder="Tambah item..."
            className={cn(
              "flex-1 bg-transparent border-none outline-none text-sm",
              theme === 'dark' ? "text-white" : "text-slate-900",
              item.checked && "line-through opacity-50"
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addListItem();
              }
            }}
          />
          <button
            type="button"
            onClick={() => removeListItem(index)}
            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addListItem}
        className={cn(
          "flex items-center gap-2 text-sm font-medium mt-2 transition-colors",
          theme === 'dark' ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
        )}
      >
        <Plus size={16} />
        Tambah Item
      </button>
    </div>
  );
};
