import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  History, 
  FileText, 
  MoreVertical,
  Send,
  User,
  ArrowRight
} from 'lucide-react';
import { View, Lead } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface LeadDetailsProps {
  onViewChange: (view: View) => void;
  user?: SupabaseUser | null;
  lead?: Lead | null;
  onEditLead?: (lead: Lead) => void;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ onViewChange, user, lead, onEditLead }) => {
  const timeline = [
    { date: '24/03/2026', time: '14:30', event: 'Lead cadastrado via Facebook Ads', icon: CheckCircle2, color: 'text-emerald-500' },
    { date: '24/03/2026', time: '15:15', event: 'Primeiro contato realizado via WhatsApp', icon: MessageSquare, color: 'text-blue-500' },
    { date: '24/03/2026', time: '16:00', event: 'Interesse confirmado em Previdência Privada', icon: Clock, color: 'text-amber-500' },
  ];

  const leadName = lead?.name || 'Lead Desconhecido';
  const leadInitials = leadName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string>(lead?.status || 'novo');

  useEffect(() => {
    if (lead?.id) fetchComments();
  }, [lead?.id]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('lead_comments')
      .select('*')
      .eq('lead_id', lead?.id)
      .order('created_at', { ascending: false });
    setComments(data || []);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const { error } = await supabase
      .from('lead_comments')
      .insert([{
        lead_id: lead?.id,
        content: newComment,
        user_id: user?.id
      }]);
    if (!error) {
      setNewComment('');
      fetchComments();
    } else {
      alert('Erro ao adicionar comentário: ' + error.message);
    }
  };

  const statusLabels: Record<string, string> = {
    novo: 'Novo',
    atendimento: 'Em Atendimento',
    pagamento: 'Pagamento',
    'sem-resposta': 'Sem Resposta',
    concluida: 'Concluída',
  };
  
  const statusColors: Record<string, string> = {
    novo: 'bg-blue-100 text-blue-600',
    atendimento: 'bg-amber-100 text-amber-600',
    pagamento: 'bg-emerald-100 text-emerald-600',
    'sem-resposta': 'bg-rose-100 text-rose-600',
    concluida: 'bg-slate-100 text-slate-600',
  };

  const handleLiquidate = async () => {
    if (!lead) return;

    try {
      const { error: saleError } = await supabase
        .from('sales')
        .insert([{
          client_name: leadName,
          contract_number: `BP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          value: lead.plan === 'Esmeralda' ? 40 : lead.plan === 'Diamante' ? 45 : 65,
          plan_type: lead.plan,
          lead_id: lead.id
        }]);

      if (saleError) throw saleError;

      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'concluida' })
        .eq('id', lead.id);

      if (updateError) throw updateError;

      onViewChange('leads');
    } catch (error: any) {
      alert('Erro ao concluir venda: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!lead?.id) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', lead.id);
      if (error) throw error;
      onViewChange('leads');
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead?.id) return;
    try {
      setCurrentStatus(newStatus); // Atualização otimista da UI
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id);
      if (error) throw error;
    } catch (error: any) {
      setCurrentStatus(lead?.status || 'novo'); // Reverter em caso de erro
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  return (
    <div className="p-8 pt-28 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onViewChange('leads')}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-600/20">
              {leadInitials}
            </div>
            <div>
              <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{leadName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[currentStatus] || statusColors['novo']}`}>
                  {statusLabels[currentStatus] || statusLabels['novo']}
                </span>
                <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  Cadastrado em {lead?.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => lead && onEditLead?.(lead)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all shadow-sm"
          >
            <Edit2 size={20} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all shadow-sm"
          >
            <Trash2 size={20} />
          </button>
          <button 
            onClick={handleLiquidate}
            disabled={lead?.status === 'concluida'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 size={20} />
            Concluir Venda
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-headline text-xl font-bold text-slate-900 dark:text-slate-50 mb-8 flex items-center gap-2">
              <User className="text-blue-600" size={24} />
              Informações do Lead
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">E-mail</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{lead?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Telefone / WhatsApp</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{lead?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Localização</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{lead?.city || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Produto de Interesse</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Plano {lead?.plan || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <MessageSquare className="text-blue-600" size={24} />
                Anotações e Comentários
              </h3>
              <button className="text-blue-600 font-bold text-sm hover:underline">Ver todas</button>
            </div>
            
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma anotação disponível.</p>
              ) : (
                comments.map((comment, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-600">Anotação</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(comment.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="relative group">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione uma nova anotação..." 
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-4 pr-16 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
              ></textarea>
              <button 
                onClick={handleAddComment}
                className="absolute right-4 bottom-4 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-50 mb-8 flex items-center gap-2">
              <History className="text-blue-600" size={20} />
              Linha do Tempo
            </h3>
            
            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-900">
              {timeline.map((item, i) => (
                <div key={i} className="relative pl-12">
                  <div className={`absolute left-0 top-0 w-10 h-10 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-xl flex items-center justify-center ${item.color} z-10 shadow-sm`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.event}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.date} às {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-slate-900/20">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="font-headline text-lg font-bold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleStatusChange('atendimento')}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group/btn"
              >
                <span className="text-sm font-bold">Mover p/ Em Atendimento</span>
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => handleStatusChange('pagamento')}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group/btn"
              >
                <span className="text-sm font-bold">Mover p/ Em Pagamento</span>
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => handleStatusChange('sem-resposta')}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group/btn"
              >
                <span className="text-sm font-bold">Mover p/ Sem Resposta</span>
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
