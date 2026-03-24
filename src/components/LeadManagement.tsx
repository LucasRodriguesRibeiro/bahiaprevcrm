import React, { useEffect, useState } from 'react';
import { 
  Filter, 
  Download, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { View, Lead } from '../types';
import { supabase } from '../lib/supabase';

interface LeadManagementProps {
  onViewChange: (view: View) => void;
  initialStatus?: Lead['status'];
  onEditLead: (lead: Lead) => void;
  onViewLead?: (lead: Lead) => void;
}

export const LeadManagement: React.FC<LeadManagementProps> = ({ onViewChange, initialStatus, onEditLead, onViewLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    fetchLeads();
  }, [initialStatus]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' });

      if (initialStatus) {
        query = query.eq('status', initialStatus);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
      setTotalLeads(count || 0);
    } catch (error: any) {
      console.error('Erro ao buscar leads:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('Lead excluído com sucesso!');
      fetchLeads();
    } catch (error: any) {
      alert('Erro ao excluir lead: ' + error.message);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      if (newStatus === 'concluida') {
        const lead = leads.find(l => l.id === id);
        if (lead) {
          await supabase
            .from('sales')
            .insert([{
              client_name: lead.name,
              contract_number: `BP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
              value: lead.plan === 'Esmeralda' ? 40 : lead.plan === 'Diamante' ? 45 : 65,
              plan_type: lead.plan,
              lead_id: lead.id
            }]);
        }
      }
      
      fetchLeads();
    } catch (error: any) {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const getStatusBadge = (id: string, status: Lead['status']) => {
    const statusColors: Record<string, string> = {
      novo: 'bg-blue-100 text-blue-600',
      atendimento: 'bg-amber-100 text-amber-600',
      pagamento: 'bg-emerald-100 text-emerald-600',
      'sem-resposta': 'bg-rose-100 text-rose-600',
      concluida: 'bg-slate-100 text-slate-600',
    };

    const statusLabels: Record<string, string> = {
      novo: 'Novo',
      atendimento: 'Em Atendimento',
      pagamento: 'Pagamento',
      'sem-resposta': 'Sem Resposta',
      concluida: 'Concluída',
    };

    return (
      <select 
        value={status}
        onChange={(e) => handleUpdateStatus(id, e.target.value)}
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-none focus:ring-0 cursor-pointer ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}
      >
        {Object.keys(statusLabels).map((key) => (
          <option key={key} value={key}>{statusLabels[key]}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="p-8 pt-28 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Gestão de Leads</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie e acompanhe todos os seus leads em um só lugar.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Filter size={18} />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download size={18} />
            Exportar
          </button>
          <button 
            onClick={() => onViewChange('new-lead')}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <UserPlus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, email ou telefone..." 
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            Exibindo <span className="text-slate-900 dark:text-slate-50 font-bold mx-1">{leads.length}</span> de <span className="text-slate-900 dark:text-slate-50 font-bold mx-1">{totalLeads}</span> leads
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Carregando Leads...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">Nome do Lead</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Cidade / Origem</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-medium">
                      Nenhum lead encontrado. Comece cadastrando um novo!
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {lead.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 transition-colors">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{lead.email}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">{lead.phone}</span>
                            <a 
                              href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
                            >
                              <MessageSquare size={10} className="fill-emerald-600" />
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{lead.city}</span>
                          <span className="text-xs text-slate-500 font-medium">{lead.origin}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(lead.id, lead.status)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onViewLead ? onViewLead(lead) : onViewChange('lead-details')}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          >
                            <Eye size={18} />
                          </button>
                           <button 
                             onClick={() => onEditLead(lead)}
                             className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                           >
                             <Edit2 size={18} />
                           </button>
                          <button 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 rounded-lg transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-white dark:hover:bg-slate-950 hover:text-blue-600 transition-all disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md">1</button>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-white dark:hover:bg-slate-950 hover:text-blue-600 transition-all disabled:opacity-50" disabled>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
