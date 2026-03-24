import React from 'react';
import { View } from '../types';
import { Settings as SettingsIcon, User, Shield, Info, Palette } from 'lucide-react';

interface SettingsProps {
  onViewChange: (view: View) => void;
}

export const Settings: React.FC<SettingsProps> = () => {
  const sections = [
    { title: 'Perfil', icon: User, items: ['Nome de Usuário', 'Foto do Perfil', 'E-mail Corporativo'] },
    { title: 'Segurança', icon: Shield, items: ['Mudar Senha', 'Autenticação de Dois Fatores'] },
    { title: 'Tema e Visual', icon: Palette, items: ['Modo Escuro / Claro', 'Cores do Dashboard'] },
    { title: 'Sobre o Sistema', icon: Info, items: ['Versão 1.0.0', 'Termos de Serviço'] },
  ];

  return (
    <div className="p-8 pt-28 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-blue-600" size={32} />
          Configurações
        </h1>
        <p className="text-slate-500 font-medium mt-1">Gerencie suas preferências e informações do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                <section.icon size={20} />
              </div>
              <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-50">{section.title}</h3>
            </div>
            <ul className="space-y-3">
              {section.items.map((item, i) => {
                const isDarkModeItem = item === 'Modo Escuro / Claro';
                
                return (
                  <li key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                    {item}
                    {isDarkModeItem ? (
                      <button 
                        onClick={() => {
                          const isDark = document.documentElement.classList.toggle('dark');
                          localStorage.setItem('theme', isDark ? 'dark' : 'light');
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                      >
                        Alternar de Tema
                      </button>
                    ) : (
                      <button 
                        onClick={() => alert(`Acesso à configuração de '${item}' está em desenvolvimento.`)}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Gerenciar
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
