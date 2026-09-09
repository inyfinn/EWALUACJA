import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Key, 
  Trash2, 
  Lock, 
  Eye, 
  ChevronLeft,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_QUESTIONS } from './data/surveyQuestions';
import { 
  getStoredTokens, 
  getStoredResponses, 
  computeDimensionsAnalytics, 
  clearAllResponses, 
  validateTokenCode,
  fetchTokensFromServer,
  fetchResponsesFromServer,
  clearAllResponsesAsync,
  saveResponseAsync
} from './utils/surveyStorage';
import { TokenManager } from './components/TokenManager';
import { ReportDashboard } from './components/ReportDashboard';
import { SurveyFillView } from './components/SurveyFillView';
import { AdminLoginView } from './components/AdminLoginView';

export function App() {
  // Modes: 'survey' (for employee respondent) vs 'admin' (for Krzysztof Wieczorek)
  const [viewMode, setViewMode] = useState<'survey' | 'admin'>('survey');
  const [adminTab, setAdminTab] = useState<'tokens' | 'report'>('tokens');
  
  // Strict admin authentication check
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('kw_organizer_authed') === 'true';
    }
    return false;
  });

  // Track if current visitor arrived via an invitation link / token
  const [isRespondentMode, setIsRespondentMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return Boolean(params.get('token') || params.get('kod') || sessionStorage.getItem('is_respondent_link') === 'true');
    }
    return false;
  });

  const [tokens, setTokens] = useState(getStoredTokens());
  const [responses, setResponses] = useState(getStoredResponses());
  const [urlToken, setUrlToken] = useState<string>('');

  const refreshData = async () => {
    try {
      const [serverTokens, serverResponses] = await Promise.all([
        fetchTokensFromServer(),
        fetchResponsesFromServer()
      ]);
      setTokens(serverTokens);
      setResponses(serverResponses);

      // Auto-sync any local responses from this browser to server if missing
      const local = getStoredResponses();
      let didSync = false;
      for (const item of local) {
        if (!serverResponses.some(s => s.id === item.id)) {
          await saveResponseAsync(item);
          didSync = true;
        }
      }
      if (didSync) {
        const updatedResponses = await fetchResponsesFromServer();
        setResponses(updatedResponses);
      }
    } catch {
      setTokens(getStoredTokens());
      setResponses(getStoredResponses());
    }
  };

  useEffect(() => {
    refreshData();

    // Check URL parameters for direct token or admin access
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token') || params.get('kod');
      const adminParam = params.get('admin') || params.get('panel');

      if (tokenParam) {
        // Arrived via invitation link with token
        setUrlToken(tokenParam.trim().toUpperCase());
        setIsRespondentMode(true);
        setViewMode('survey');
      } else if (adminParam === 'true' || adminParam === '1' || sessionStorage.getItem('kw_organizer_authed') === 'true') {
        setIsRespondentMode(false);
        setViewMode('admin');
        setUrlToken('');
      } else {
        setIsRespondentMode(false);
        setUrlToken('');
        // When visiting root without token:
        if (sessionStorage.getItem('kw_organizer_authed') === 'true') {
          setViewMode('admin');
        } else {
          setViewMode('survey');
        }
      }
    }

    // Live background polling every 4 seconds to reflect survey completions in real time
    const interval = setInterval(() => {
      refreshData();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const stats = computeDimensionsAnalytics(DEFAULT_QUESTIONS, responses);

  const handleClearData = async () => {
    if (window.confirm('Czy na pewno chcesz wyczyścić wszystkie odpowiedzi i zresetować raport do 0 (pusty stan na prawdziwe głosy)?')) {
      await clearAllResponsesAsync();
      await refreshData();
    }
  };

  const handleTestTokenFromAdmin = (tokenCode: string) => {
    setUrlToken(tokenCode);
    setViewMode('survey');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('kw_organizer_authed');
    setViewMode('survey');
  };

  // ==========================================
  // VIEW 1: DLA WSPÓŁPRACOWNIKA (Czysta Ankieta)
  // ==========================================
  if (viewMode === 'survey') {
    return (
      <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-16 font-sans antialiased selection:bg-slate-200 print:bg-white print:pb-0">
        
        {/* Banner only for authenticated admin previewing the survey */}
        {isAdminAuthenticated && (
          <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Tryb podglądu ankiety (Zalogowany jako Organizator: Krzysztof Wieczorek)</span>
            </div>
            <button
              onClick={() => setViewMode('admin')}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Wróć do Panelu Organizatora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
            
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Formularz anonimowy</span>
              </div>

              {!urlToken && (
                <button
                  onClick={() => setViewMode('admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Panel Organizatora</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Survey Form */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <SurveyFillView
            questions={DEFAULT_QUESTIONS}
            prefilledToken={urlToken}
            isPreviewMode={!urlToken}
            onOpenAdminLogin={() => {
              setViewMode('admin');
            }}
            onSwitchToAdmin={() => {
              setViewMode('admin');
            }}
            onCompleted={() => {
              refreshData();
            }}
          />
        </main>

        {/* Footer: Discrete organizer access protected by password */}
        <footer className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 text-center text-xs text-slate-400 print:hidden space-y-2.5">
          <p className="text-[11px] text-slate-400 font-medium">
            Ewaluacja 360° • Kubara Sp. z o.o. • Wszelkie odpowiedzi są w 100% anonimowe i poufne
          </p>
          <div className="pt-1">
            {isAdminAuthenticated ? (
              <button
                onClick={() => setViewMode('admin')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Przejdź do Panelu Organizatora</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('admin')}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Panel Organizatora (Krzysztof Wieczorek – wymaga hasła)</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: LOGOWANIE DO PANELU ORGANIZATORA
  // ==========================================
  if (!isAdminAuthenticated) {
    return (
      <AdminLoginView
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          sessionStorage.setItem('kw_organizer_authed', 'true');
          sessionStorage.removeItem('is_respondent_link');
          setIsRespondentMode(false);
        }}
        onCancel={() => {
          setViewMode('survey');
        }}
      />
    );
  }

  // ==========================================
  // VIEW 3: DLA ORGANIZATORA (Panel Zarządzania & Raporty)
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

              {responses.length > 0 && (
                <button
                  onClick={handleClearData}
                  title="Wyczyść dane (zresetuj do 0)"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Wyczyść odpowiedzi ({responses.length})</span>
                </button>
              )}

              <button
                onClick={handleAdminLogout}
                title="Wyloguj z Panelu Organizatora"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Wyloguj</span>
              </button>
            </div>
          </div>

          {/* 2 Clear Tabs */}
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
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {adminTab === 'tokens' && (
          <TokenManager
            tokens={tokens}
            responses={responses}
            onTokensUpdated={refreshData}
            onSelectTokenToFill={handleTestTokenFromAdmin}
          />
        )}

        {adminTab === 'report' && (
          <ReportDashboard
            stats={stats}
            questions={DEFAULT_QUESTIONS}
            responses={responses}
            tokens={tokens}
            onRefreshData={refreshData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
