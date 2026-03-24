import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  MessageSquare, 
  CheckCircle2,
  Rocket,
  Loader2
} from 'lucide-react';
import { View, Lead } from '../types';
import { supabase } from '../lib/supabase';

interface NewLeadProps {
  onViewChange: (view: View) => void;
  lead?: Lead | null;
}

export const NewLead: React.FC<NewLeadProps> = ({ onViewChange, lead }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    city: lead?.city || '',
    origin: lead?.origin || '',
    plan: lead?.plan || '',
    notes: lead?.notes || '',
    status: lead?.status || 'novo'
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      alert('Por favor, preencha pelo menos o nome e o telefone.');
      return;
    }

    setLoading(true);
    try {
      if (lead) {
        const { error } = await supabase
          .from('leads')
          .update({ 
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            origin: formData.origin,
            plan: formData.plan,
            notes: formData.notes,
            status: formData.status
          })
          .eq('id', lead.id);

        if (error) throw error;
        alert('Lead atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([
            { 
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              city: formData.city,
              origin: formData.origin,
              plan: formData.plan,
              notes: formData.notes,
              status: formData.status
            }
          ]);

        if (error) throw error;
        alert('Lead cadastrado com sucesso!');
      }
      onViewChange('leads');
    } catch (error: any) {
      console.error('Erro ao salvar lead:', error.message);
      alert('Erro ao salvar lead. Verifique sua conexão e as credenciais do Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-8 pt-28 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onViewChange('leads')}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Registro de Novo Lead</h1>
          <p className="text-slate-500 font-medium mt-1">Preencha as informações abaixo para cadastrar um novo cliente potencial.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-headline text-xl font-bold text-slate-900 dark:text-slate-50 mb-8 flex items-center gap-2">
              <User className="text-blue-600" size={24} />
              Informações Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: João da Silva" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ex: joao@email.com" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: (11) 98765-4321" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cidade / Estado</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ex: São Paulo, SP" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-headline text-xl font-bold text-slate-900 dark:text-slate-50 mb-8 flex items-center gap-2">
              <Globe className="text-blue-600" size={24} />
              Origem e Interesse
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Origem do Lead</label>
                <select 
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">Selecione a origem</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Site Oficial">Site Oficial</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Plano de Interesse</label>
                <select 
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">Selecione o plano</option>
                  <option value="Esmeralda">Plano Esmeralda (R$ 40)</option>
                  <option value="Diamante">Plano Diamante (R$ 45)</option>
                  <option value="Rubi">Plano Rubi (R$ 65)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Observações Iniciais</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Adicione detalhes importantes sobre o lead..." 
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-50 mb-6">Status Inicial</h3>
            <div className="space-y-3">
              {[
                { label: 'Novo', value: 'novo' },
                { label: 'Em Atendimento', value: 'atendimento' },
                { label: 'Aguardando Pagamento', value: 'pagamento' }
              ].map((status, i) => (
                <label key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors group">
                  <input 
                    type="radio" 
                    name="status" 
                    value={status.value}
                    checked={formData.status === status.value}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500" 
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Rocket size={20} />
              </div>
              <h3 className="font-headline text-lg font-bold text-blue-900 dark:text-blue-100">Pronto para salvar?</h3>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">Ao salvar, o lead será adicionado à sua lista e você poderá iniciar o atendimento imediatamente.</p>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {loading ? 'Salvando...' : 'Salvar e Cadastrar'}
            </button>
            <button 
              onClick={() => onViewChange('leads')}
              disabled={loading}
              className="w-full py-4 mt-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
