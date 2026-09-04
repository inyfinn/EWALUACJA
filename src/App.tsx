import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Key, 
  BookOpen, 
  FileQuestion, 
  Trash2, 
  Database,
  Lock,
  ArrowRight,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { DEFAULT_QUESTIONS } from './data/surveyQuestions';
import { 
  getStoredTokens, 
  getStoredResponses, 
  computeDimensionsAnalytics, 
  clearAllResponses, 
  loadSampleDemoData,
  validateTokenCode
} from './utils/surveyStorage';
import { TokenManager } from './components/TokenManager';
import { ReportDashboard } from './components/ReportDashboard';
import { SurveyFillView } from './components/SurveyFillView';
import { EvaluationStrategyGuide } from './components/EvaluationStrategyGuide';

export function App() {
  // Modes: 'survey' (for employee respondent) vs 'admin' (for Krzysztof Wieczorek)
  const [viewMode, setViewMode] = useState<'survey' | 'admin'>('survey');
  const [adminTab, setAdminTab] = useState<'tokens' | 'report' | 'guide'>('tokens');
  
  const [tokens, setTokens] = useState(getStoredTokens());
  const [responses, setResponses] = useState(getStoredResponses());
  const [urlToken, setUrlToken] = useState<string>('');

  const refreshData = () => {
    setTokens(getStoredTokens());
    setResponses(getStoredResponses());
  };

  useEffect(() => {
    refreshData();

    // Check URL parameters for direct token or admin access
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token') || params.get('kod');
      const adminParam = params.get('admin') || params.get('panel');

      if (tokenParam) {
        setUrlToken(tokenParam.trim().toUpperCase());
        setViewMode('survey');
      } else if (adminParam === 'true' || adminParam === '1') {
        setViewMode('admin');
      } else {
        // Default: if no tokens or params, keep survey mode with podgląd option
        setUrlToken('');
      }
    }
  }, []);

  const stats = computeDimensionsAnalytics(DEFAULT_QUESTIONS, responses);

  const handleClearData = () => {
    if (window.confirm('Czy na pewno chcesz wyczyścić wszystkie odpowiedzi i zresetować raport do 0 (pusty stan na prawdziwe głosy)?')) {
      clearAllResponses();
      refreshData();
    }
  };

  const handleLoadDemo = () => {
    loadSampleDemoData();
    refreshData();
  };

  const handleTestTokenFromAdmin = (tokenCode: string) => {
    setUrlToken(tokenCode);
    setViewMode('survey');
  };

  // ==========================================
  // VIEW 1: DLA WSPÓŁPRACOWNIKA (Czysta Ankieta)
  // ==========================================
  if (viewMode === 'survey') {
    return (
      <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-16 font-sans antialiased selection:bg-slate-200 print:bg-white print:pb-0">
        {/* Minimal, elegant, distraction-free header for survey taker */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs print:hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-2xs">
                K
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight leading-tight">
                  Ewaluacja Współpracy
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Krzysztof Wieczorek • Kubara Sp. z o.o.
                </p>
              </div>
            </div>
            
            <div className="text-[11px] text-slate-400 font-medium">
              Formularz anonimowy
            </div>
          </div>
        </header>

        {/* Survey Form */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <SurveyFillView
            questions={DEFAULT_QUESTIONS}
            prefilledToken={urlToken}
            isPreviewMode={!urlToken}
            onCompleted={() => {
              refreshData();
            }}
            onSwitchToAdmin={() => {
              setViewMode('admin');
            }}
          />
        </main>

        {/* Discreet Switch to Organizer Panel in Footer */}
        <footer className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 text-center text-xs text-slate-400 print:hidden">
          <button
            onClick={() => setViewMode('admin')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-300/80 text-slate-600 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Panel Organizatora (Krzysztof Wieczorek)</span>
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DLA ORGANIZATORA (Panel Zarządzania & Raporty)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-16 font-sans antialiased selection:bg-slate-200">
      {/* Top Brand & Context Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tight text-lg shadow-2xs">
                K
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-tight">
                    Kubara Sp. z o.o. • Panel Organizatora
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                    Krzysztof Wieczorek
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                  Zarządzanie linkami, statusy zwrotów na żywo i raport roczny
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setUrlToken('');
                  setViewMode('survey');
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Zobacz jak ankietę widzi współpracownik"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Podgląd Ankiety</span>
                <span className="sm:hidden">Ankieta</span>
              </button>

              {responses.length > 0 ? (
                <button
                  onClick={handleClearData}
                  title="Wyczyść dane (przygotuj czysty formularz dla współpracowników)"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Wyczyść ({responses.length})</span>
                </button>
              ) : (
                <button
                  onClick={handleLoadDemo}
                  title="Wczytaj idealne odpowiedzi (100%), aby przetestować raport"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Wygeneruj 100% idealną ankietę (test)</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Intuitive Tabs */}
          <div className="flex items-center gap-2 border-t border-slate-100 overflow-x-auto py-2.5">
            <button
              onClick={() => setAdminTab('tokens')}
              className={`py-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                adminTab === 'tokens'
                  ? 'text-white bg-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>1. Kody i Linki do Rozesłania ({tokens.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('report')}
              className={`py-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                adminTab === 'report'
                  ? 'text-white bg-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>2. Raport & Wyniki 4 Filarów ({responses.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('guide')}
              className={`py-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                adminTab === 'guide'
                  ? 'text-white bg-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>3. Przewodnik Rozmowy Rocznej</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {adminTab === 'tokens' && (
          <TokenManager
            tokens={tokens}
            onTokensUpdated={refreshData}
            onSelectTokenToFill={handleTestTokenFromAdmin}
          />
        )}

        {adminTab === 'report' && (
          <ReportDashboard
            stats={stats}
            questions={DEFAULT_QUESTIONS}
            responses={responses}
          />
        )}

        {adminTab === 'guide' && <EvaluationStrategyGuide />}
      </main>
    </div>
  );
}

export default App;
