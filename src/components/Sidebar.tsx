import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Banknote, 
  Ban, 
  CheckCircle2, 
  Settings, 
  Headset, 
  LogOut,
  Building2,
  Megaphone
} from 'lucide-react';
import { View } from '../types';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const handleLogout = async () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      await supabase.auth.signOut();
    }
  };

  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads' as View, label: 'Leads', icon: Users },
    { id: 'atendimento' as View, label: 'Em atendimento', icon: MessageSquare },
    { id: 'waiting-payment' as View, label: 'Esperando pagamento', icon: Banknote },
    { id: 'sem-resposta' as View, label: 'Sem resposta', icon: Ban },
    { id: 'completed-sales' as View, label: 'Vendas concluídas', icon: CheckCircle2 },
    { id: 'mass-message' as View, label: 'Disparo em Massa', icon: Megaphone },
    { id: 'settings' as View, label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-100 dark:bg-slate-950 flex flex-col p-4 gap-2 z-50">
      <div className="px-4 py-6 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-headline text-lg font-extrabold text-blue-900 dark:text-blue-50 leading-tight">Bahia Prev</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">CRM de Vendas</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm font-semibold' 
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:translate-x-1'
            }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'fill-current' : ''} />
            <span className="font-sans text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-high text-on-primary-fixed-variant rounded-xl font-semibold text-sm hover:translate-x-1 transition-transform active:scale-98">
          <Headset size={16} />
          Suporte Técnico
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-sans text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};
