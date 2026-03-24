import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  TimerOff, 
  CheckCircle, 
  Rocket, 
  Megaphone, 
  Calendar, 
  Edit2, 
  List, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { View } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface DashboardProps {
  onViewChange: (view: View) => void;
  user?: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange, user }) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [pendingLeads, setPendingLeads] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [noResponseCount, setNoResponseCount] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [convertedLeads, setConvertedLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        // 1. Vendas
        const { data: sales } = await supabase.from('sales').select('value');
        setSalesData(sales || []);

        // 2. Aguardando Pagamento
        const { data: pending } = await supabase.from('leads').select('*').eq('status', 'pagamento');
        setPendingLeads(pending || []);

        // 3. Sem Resposta
        const { count: noResp } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'sem-resposta');
        setNoResponseCount(noResp || 0);

        // 4. Recentes
        const { data: recent } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(3);
        setRecentLeads(recent || []);

        // 5. Conversão
        const { count: total } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        const { count: conv } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'concluida');
        setTotalLeads(total || 0);
        setConvertedLeads(conv || 0);
      } catch (err) {
        console.error(err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchData(true);

    const leadsChannel = supabase
      .channel('dashboard-leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchData(false);
      })
      .subscribe();

    const salesChannel = supabase
      .channel('dashboard-sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        fetchData(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(salesChannel);
    };
  }, []);

  const totalRevenue = salesData.reduce((acc, s) => acc + Number(s.value), 0);
  const pendingRevenue = pendingLeads.reduce((acc, l) => acc + (l.plan === 'Esmeralda' ? 40 : l.plan === 'Diamante' ? 45 : 65), 0);
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  
  const targetGoal = 5000;
  const monthlyPercentage = targetGoal > 0 ? Math.round((totalRevenue / targetGoal) * 100) : 0;

  const stats = [
    { label: 'Vendas Concluídas', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'bg-emerald-500', text: 'text-emerald-600', trend: 'Faturamento real' },
    { label: 'Aguardando Pagamento', value: `R$ ${pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Clock, color: 'bg-amber-500', text: 'text-amber-600', trend: `${pendingLeads.length} leads na fila` },
    { label: 'Sem Resposta', value: `${noResponseCount} Leads`, icon: TimerOff, color: 'bg-rose-500', text: 'text-rose-600', trend: 'Acompanhar status' },
    { label: 'Taxa de Conversão', value: `${conversionRate}%`, icon: CheckCircle, color: 'bg-blue-500', text: 'text-blue-600', trend: `Total: ${totalLeads} leads` },
  ];


  return (
    <div className="p-8 pt-28 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Bem-vindo de volta, {user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-slate-500 font-medium mt-1">Aqui está o resumo das suas atividades e desempenho hoje.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
          <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-md">Hoje</button>
          <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">Semana</button>
          <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">Mês</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-full ${stat.text}`}>{stat.trend}</span>
            </div>
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{stat.label}</h3>
            <p className="text-2xl font-headline font-extrabold text-slate-900 dark:text-slate-50">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <List className="text-blue-600" size={24} />
                Leads Recentes
              </h3>
              <button 
                onClick={() => onViewChange('leads')}
                className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentLeads.length === 0 ? (
                <p className="text-center text-slate-500 py-10 font-medium">Nenhum lead recente encontrado.</p>
              ) : (
                recentLeads.map((lead, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 transition-colors">{lead.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">Plano: {lead.plan || 'Não informado'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        lead.status === 'novo' ? 'bg-blue-100 text-blue-600' : 
                        lead.status === 'atendimento' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {lead.status === 'novo' ? 'Novo' : lead.status === 'atendimento' ? 'Atendimento' : lead.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '--'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <ShieldCheck className="mb-4 opacity-80" size={32} />
            <h3 className="font-headline text-xl font-bold mb-2">Meta Mensal</h3>
            <p className="text-blue-100 text-sm font-medium mb-6">Você já atingiu {monthlyPercentage >= 100 ? '100%+' : `${monthlyPercentage}%`} da sua meta de vendas este mês. {monthlyPercentage >= 100 ? 'Parabéns!' : 'Continue assim!'}</p>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-2">
              <div className="bg-white h-full rounded-full shadow-sm transition-all duration-500" style={{ width: `${Math.min(100, monthlyPercentage)}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-80">
              <span>R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>R$ {targetGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};
