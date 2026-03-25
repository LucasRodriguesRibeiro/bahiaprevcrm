import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { View } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { LeadManagement } from './components/LeadManagement';
import { NewLead } from './components/NewLead';
import { WaitingPayment } from './components/WaitingPayment';
import { LeadDetails } from './components/LeadDetails';
import { CompletedSales } from './components/CompletedSales';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { MassMessage } from './components/MassMessage';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Loader2, AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center">
          <AlertCircle size={48} className="mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Erro de Renderização</h1>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200 max-w-2xl w-full">
            <p className="font-semibold mb-2">Detalhes do erro:</p>
            <pre className="text-sm bg-slate-50 p-4 rounded overflow-auto whitespace-pre-wrap">
              {this.state.error?.message || "Erro desconhecido"}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  console.log("App: Componente App está sendo executado");
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingLead, setEditingLead] = useState<any>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log("App: Iniciando verificação de sessão...");
    
    const checkSession = async () => {
      // Aplicar tema salvo
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }

      try {
        // Timeout de 5 segundos para a conexão com Supabase
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout ao conectar com Supabase")), 5000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        console.log("App: Sessão recuperada:", session ? "Sim" : "Não");
        setSession(session);
      } catch (error: any) {
        console.error('App: Erro ao verificar sessão:', error);
        setInitError(error.message || "Erro de conexão com o banco de dados");
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("App: Mudança de estado de autenticação:", _event);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getViewTitle = (view: View): string => {
    switch (view) {
      case 'dashboard': return 'Dashboard Geral';
      case 'leads': return 'Gestão de Leads';
      case 'new-lead': return 'Novo Lead';
      case 'waiting-payment': return 'Fila de Liquidação';
      case 'lead-details': return 'Detalhes do Lead';
      case 'completed-sales': return 'Vendas Concluídas';
      case 'settings': return 'Configurações';
      default: return '';
    }
  };

  const renderView = () => {
    try {
      switch (currentView) {
        case 'dashboard': return <Dashboard onViewChange={setCurrentView} user={session?.user} />;
        case 'leads': return <LeadManagement onViewChange={setCurrentView} onEditLead={(lead) => { setEditingLead(lead); setCurrentView('new-lead'); }} onViewLead={(l) => { setSelectedLead(l); setCurrentView('lead-details'); }} />;
        case 'atendimento': return <LeadManagement onViewChange={setCurrentView} initialStatus="atendimento" onEditLead={(lead) => { setEditingLead(lead); setCurrentView('new-lead'); }} onViewLead={(l) => { setSelectedLead(l); setCurrentView('lead-details'); }} />;
        case 'sem-resposta': return <LeadManagement onViewChange={setCurrentView} initialStatus="sem-resposta" onEditLead={(lead) => { setEditingLead(lead); setCurrentView('new-lead'); }} onViewLead={(l) => { setSelectedLead(l); setCurrentView('lead-details'); }} />;
        case 'new-lead': return <NewLead onViewChange={(v) => { setEditingLead(null); setCurrentView(v); }} lead={editingLead} />;
        case 'waiting-payment': return <WaitingPayment onViewChange={setCurrentView} />;
        case 'lead-details': return <LeadDetails onViewChange={setCurrentView} user={session?.user} lead={selectedLead} />;
        case 'completed-sales': return <CompletedSales onViewChange={setCurrentView} />;
        case 'settings': return <Settings onViewChange={setCurrentView} />;
        case 'mass-message': return <MassMessage onViewChange={setCurrentView} />;
        default: return <Dashboard onViewChange={setCurrentView} user={session?.user} />;
      }
    } catch (e: any) {
      return (
        <div className="p-8 bg-red-50 rounded-xl border border-red-200">
          <h2 className="text-red-800 font-bold mb-2">Erro ao carregar visualização</h2>
          <p className="text-red-600">{e.message}</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-600 font-medium animate-pulse">Carregando Bahia Prev...</p>
      </div>
    );
  }

  // Removido temporariamente o bloqueio de erro de inicialização em desenvolvimento
  /*
  if (initError) {
    return (
      // ...
    );
  }
  */

  // Removida temporariamente a tela de login
  /*
  if (!session) {
    console.log("App: Renderizando Login");
    return <Login />;
  }
  */

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface font-sans text-on-background selection:bg-blue-100 selection:text-blue-900">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="pl-64 min-h-screen relative">
          <TopBar onViewChange={setCurrentView} title={getViewTitle(currentView)} user={session?.user} />
          
          <div className="p-6">
            {renderView()}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
