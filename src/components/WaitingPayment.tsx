import React, { useEffect, useState } from 'react';
import { 
  Banknote, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowRight,
  CreditCard,
  Building2,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { View, Lead } from '../types';
import { supabase } from '../lib/supabase';

interface WaitingPaymentProps {
  onViewChange: (view: View) => void;
  onViewLead?: (lead: Lead) => void;
}

export const WaitingPayment: React.FC<WaitingPaymentProps> = ({ onViewChange, onViewLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'pagamento')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pagamentos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidate = async (lead: Lead) => {
    setProcessingId(lead.id);
    try {
      // 1. Criar registro na tabela de vendas
      const { error: saleError } = await supabase
        .from('sales')
        .insert([{
          client_name: lead.name,
          contract_number: `BP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          value: lead.plan === 'Esmeralda' ? 40 : lead.plan === 'Diamante' ? 45 : 65,
          plan_type: lead.plan,
          lead_id: lead.id
        }]);

      if (saleError) throw saleError;

      // 2. Atualizar status do lead para 'concluida'
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'concluida' })
        .eq('id', lead.id);

      if (updateError) throw updateError;

      fetchPendingPayments(); // Recarregar lista
    } catch (error: any) {
      alert('Erro ao liquidar contrato: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const totalPending = leads.reduce((acc, lead) => {
    const value = lead.plan === 'Esmeralda' ? 40 : lead.plan === 'Diamante' ? 45 : 65;
    return acc + value;
  }, 0);

  return (
    <div className="p-8 pt-28 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
            <Banknote className="text-emerald-600" size={32} />
            Fila de Liquidação
          </h1>
          <p className="text-slate-500 font-medium mt-1">Acompanhe os pagamentos pendentes e a liquidação dos contratos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Total Pendente</p>
              <p className="text-xl font-headline font-extrabold text-emerald-900 dark:text-emerald-100">
                R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Aguardando', value: leads.length, icon: Clock, color: 'bg-amber-500', text: 'text-amber-600' },
          { label: 'Liquidados', value: '--', icon: CheckCircle2, color: 'bg-emerald-500', text: 'text-emerald-600' },
          { label: 'Atrasados', value: '00', icon: AlertCircle, color: 'bg-rose-500', text: 'text-rose-600' },
          { label: 'Processando', value: '00', icon: CreditCard, color: 'bg-blue-500', text: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div>
                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{stat.label}</h3>
                <p className="text-2xl font-headline font-extrabold text-slate-900 dark:text-slate-50">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente..." 
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm">
            <Filter size={18} />
            Filtrar por Status
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-emerald-600" size={40} />
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Carregando Fila...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Valor Estimado</th>
                  <th className="px-6 py-4">Data de Cadastro</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-medium">
                      Nenhum pagamento pendente na fila.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const value = lead.plan === 'Esmeralda' ? 40 : lead.plan === 'Diamante' ? 45 : 65;
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div 
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => onViewLead ? onViewLead(lead) : onViewChange('lead-details')}
                          >
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">
                              {lead.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-emerald-600 hover:underline transition-all">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            lead.plan === 'Esmeralda' ? 'bg-emerald-100 text-emerald-600' : 
                            lead.plan === 'Diamante' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            {lead.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">
                          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '--'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-600">
                            Aguardando
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleLiquidate(lead)}
                              disabled={processingId === lead.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === lead.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              Liquidar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
