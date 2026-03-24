import React from 'react';
import { Bell, Search, UserPlus } from 'lucide-react';
import { View } from '../types';
import { User } from '@supabase/supabase-js';

interface TopBarProps {
  onViewChange: (view: View) => void;
  title: string;
  user?: User | null;
}

export const TopBar: React.FC<TopBarProps> = ({ onViewChange, title, user }) => {
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-6 flex-1">
        <h2 className="font-headline text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar leads, contratos ou clientes..." 
            className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => onViewChange('new-lead')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <UserPlus size={18} />
          Novo Lead
        </button>
        
        <div className="flex items-center gap-2">
          <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{userName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
