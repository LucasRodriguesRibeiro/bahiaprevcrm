import React, { useEffect, useState } from 'react';
import { 
  Megaphone, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  Loader2
} from 'lucide-react';
import { View, Lead } from '../types';
import { supabase } from '../lib/supabase';

interface MassMessageProps {
  onViewChange: (view: View) => void;
}

export const MassMessage: React.FC<MassMessageProps> = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [template, setTemplate] = useState('Olá {{nome}}, temos uma novidade sobre o seu plano Bahia Prev!');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleSendMessages = async () => {
    if (selectedLeads.length === 0) return alert('Selecione pelo menos um lead.');
    if (!template.trim()) return alert('Escreva uma mensagem para o template.');
    
    setSending(true);
    setLogs(['[Dica] Se as abas não abrirem, verifique o bloqueador de pop-ups do navegador.']);
    let successCount = 0;

    for (const leadId of selectedLeads) {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) continue;

      const messageContent = template.replace('{{nome}}', lead.name);
      setLogs(prev => [...prev, `[Abrindo] para ${lead.name}...`]);

      let cleanPhone = lead.phone.replace(/\D/g, '');
      if (!cleanPhone.startsWith('55')) {
        cleanPhone = '55' + cleanPhone;
      }

      const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageContent)}`;
      window.open(url, '_blank');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      successCount++;
    }

    setSending(false);
    alert(`Abas abertas! ${successCount} conversas carregarão no WhatsApp Web.`);
  };

  return (
    <div className="p-8 pt-28 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
          <Megaphone className="text-blue-600" size={32} />
          Disparo via WhatsApp Web
        </h1>
        <p className="text-slate-500 font-medium mt-1">Selecione os leads e abra as conversas pré-preenchidas em novas abas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedLeads.length === leads.length && leads.length > 0} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700" />
                  <h4 className="font-headline font-bold text-slate-900 dark:text-slate-50 text-sm">Selecionar todos os {leads.length}</h4>
                </div>
                <span className="text-xs font-bold text-blue-600">{selectedLeads.length} selecionados</span>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-900 max-h-[400px] overflow-y-auto">
                {leads.map((lead) => (
                  <label key={lead.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(lead.id)} 
                        onChange={() => handleSelectLead(lead.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700" 
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-50">{lead.name}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{lead.plan} • {lead.phone}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-bold text-slate-600">{lead.origin}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-headline font-bold text-slate-900 dark:text-slate-50 mb-4">Template de Mensagem</h3>
              <p className="text-[10px] text-slate-400 mb-2">Use <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded font-bold">{"{{nome}}"}</code> para citar o nome do cliente.</p>
              
              <textarea 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none mb-4"
              ></textarea>

              <button 
                onClick={handleSendMessages}
                disabled={sending}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                {sending ? 'Abrindo...' : 'Abrir Conversas no WhatsApp'}
              </button>
            </div>

            {logs.length > 0 && (
              <div className="bg-slate-900 rounded-3xl p-6 text-slate-100 shadow-sm max-h-[250px] overflow-y-auto">
                <h4 className="font-headline text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Logs de Envio</h4>
                <pre className="text-[10px] font-mono whitespace-pre-wrap space-y-1">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};
