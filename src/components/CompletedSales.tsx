import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  Download, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowRight,
  Calendar,
  Clock,
  Building2,
  Loader2
} from 'lucide-react';
import { View, Sale } from '../types';
import { supabase } from '../lib/supabase';

interface CompletedSalesProps {
  onViewChange: (view: View) => void;
}

export const CompletedSales: React.FC<CompletedSalesProps> = ({ onViewChange }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const formattedSales: Sale[] = (data || []).map(s => ({
          id: s.id,
          clientName: s.client_name,
          contractNumber: s.contract_number,
          value: Number(s.value),
          date: s.date || new Date(s.created_at).toLocaleDateString('pt-BR'),
          time: s.time || new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          planType: s.plan_type as 'Esmeralda' | 'Diamante' | 'Rubi',
          created_at: s.created_at
        }));

        setSales(formattedSales);
      } catch (error: any) {
        console.error('Erro ao buscar vendas:', error.message);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchSales(true);

    const salesChannel = supabase
      .channel('completed-sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        fetchSales(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(salesChannel);
    };
  }, []);

  const planSummary = {
    Esmeralda: sales.filter(s => s.planType === 'Esmeralda').length,
    Diamante: sales.filter(s => s.planType === 'Diamante').length,
    Rubi: sales.filter(s => s.planType === 'Rubi').length,
  };

  const totalRevenue = sales.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="p-8 pt-28 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600" size={32} />
            Vendas Concluídas
          </h1>
          <p className="text-slate-500 font-medium mt-1">Histórico completo de todas as vendas de planos de assistência familiar.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Faturamento Total</p>
              <p className="text-xl font-headline font-extrabold text-emerald-900 dark:text-emerald-100">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: 'Plano Esmeralda', value: planSummary.Esmeralda, icon: CheckCircle2, color: 'bg-emerald-500', trend: 'R$ 40,00' },
          { label: 'Plano Diamante', value: planSummary.Diamante, icon: TrendingUp, color: 'bg-blue-500', trend: 'R$ 45,00' },
          { label: 'Plano Rubi', value: planSummary.Rubi, icon: Clock, color: 'bg-indigo-500', trend: 'R$ 65,00' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-full text-emerald-600">{stat.trend}</span>
            </div>
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{stat.label}</h3>
            <p className="text-2xl font-headline font-extrabold text-slate-900 dark:text-slate-50">{stat.value} Vendas</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente ou contrato..." 
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm">
            <Filter size={18} />
            Filtrar por Plano
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-emerald-600" size={40} />
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Carregando Vendas...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Nº do Contrato</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Data e Hora</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-medium">
                      Nenhuma venda concluída encontrada.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">
                            {sale.clientName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-emerald-600 transition-colors">{sale.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          sale.planType === 'Esmeralda' ? 'bg-emerald-100 text-emerald-600' : 
                          sale.planType === 'Diamante' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {sale.planType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                        {sale.contractNumber}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-50">{sale.date}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sale.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                            <Download size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 rounded-lg transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
