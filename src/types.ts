export type View = 
  | 'login' 
  | 'dashboard' 
  | 'leads' 
  | 'new-lead' 
  | 'waiting-payment' 
  | 'lead-details' 
  | 'completed-sales' 
  | 'atendimento'
  | 'sem-resposta'
  | 'settings'
  | 'mass-message';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  origin: string;
  plan: 'Esmeralda' | 'Diamante' | 'Rubi';
  status: 'novo' | 'atendimento' | 'pagamento' | 'sem-resposta' | 'concluida';
  created_at?: string;
  updated_at?: string;
  type?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  clientName: string;
  contractNumber: string;
  value: number;
  date: string;
  time: string;
  planType: 'Esmeralda' | 'Diamante' | 'Rubi';
  created_at?: string;
  updated_at?: string;
}
