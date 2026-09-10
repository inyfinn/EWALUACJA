import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  Send, 
  ShieldCheck, 
  Users, 
  Plus, 
  Trash2, 
  ExternalLink, 
  MessageSquare, 
  AlertCircle, 
  AlertTriangle,
  Clock, 
  CheckCircle2,
  Globe,
  Settings2,
  HelpCircle,
  Sparkles,
  Link as LinkIcon,
  PlayCircle,
  RotateCcw,
  EyeOff,
  FileArchive,
  Upload,
} from 'lucide-react';
import { VoterToken, SurveyResponse } from '../types';
import { 
  getSurveyUrl, 
  getSurveyBaseUrlInfo, 
  setSurveyUrlMode,
  setSurveyCustomBaseUrl, 
  SurveyBaseUrlInfo, 
  addCustomTokenAsync, 
  deleteTokenAsync,
  toggleExcludeResponseAsync,
  resetTokenAsync,
  importResponseFromFileAsync
} from '../utils/surveyStorage';
import { parseSurveyFile } from '../utils/surveyTransfer';
import { fillUrl } from '../utils/routerBase';

interface TokenManagerProps {
  tokens: VoterToken[];
  responses?: SurveyResponse[];
  surveyId?: string;
  surveySlug?: string;
  onTokensUpdated: () => void;
  onSelectTokenToFill?: (code: string) => void;
  onGenerateToken?: (label?: string) => void;
  onBatchGenerate?: (count: number) => void;
  onDeleteToken?: (id: string) => void;
}

export const TokenManager: React.FC<TokenManagerProps> = ({
  tokens,
  responses,
  surveyId,
  surveySlug,
  onTokensUpdated,
  onSelectTokenToFill,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessageFor, setCopiedMessageFor] = useState<string | null>(null);

  // URL configuration state
  const [baseUrlInfo, setBaseUrlInfo] = useState<SurveyBaseUrlInfo>(getSurveyBaseUrlInfo());
  const [showUrlSettings, setShowUrlSettings] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [urlSaveSuccess, setUrlSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const info = getSurveyBaseUrlInfo();
    setBaseUrlInfo(info);
    setCustomUrlInput(info.customUrl || info.url);
  }, []);

  const handleSelectMode = (mode: 'shared' | 'dev' | 'custom') => {
    setSurveyUrlMode(mode);
    const updated = getSurveyBaseUrlInfo();
    setBaseUrlInfo(updated);
    setCustomUrlInput(updated.customUrl || updated.url);
  };

  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveyCustomBaseUrl(customUrlInput.trim() || null);
    const updated = getSurveyBaseUrlInfo();
    setBaseUrlInfo(updated);
    setCustomUrlInput(updated.customUrl || updated.url);
    setUrlSaveSuccess(true);
    setTimeout(() => setUrlSaveSuccess(false), 2500);
  };

  const handleUseAiStudioPre = () => {
    handleSelectMode('shared');
    setUrlSaveSuccess(true);
    setTimeout(() => setUrlSaveSuccess(false), 2500);
  };

  const handleResetUrl = () => {
    handleSelectMode(baseUrlInfo.isAiStudioDev ? 'shared' : 'dev');
    setUrlSaveSuccess(true);
    setTimeout(() => setUrlSaveSuccess(false), 2500);
  };

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCustomTokenAsync(newLabel.trim() || `Współpracownik ${tokens.length + 1}`, surveyId);
    setNewLabel('');
    onTokensUpdated();
  };

  const handleBatch = async (count: number) => {
    for (let i = 0; i < count; i++) {
      await addCustomTokenAsync(`Współpracownik ${tokens.length + i + 1}`, surveyId);
    }
    onTokensUpdated();
  };

  const handleDelete = async (id: string) => {
    const token = tokens.find(t => t.id === id);
    const msg = token?.used
      ? `Ten link (${token.label || token.code}) został już wypełniony. Usunięcie go usunie również zapisany wynik ankiety z raportu. Czy na pewno usunąć?`
      : 'Czy na pewno chcesz usunąć ten link?';
    if (window.confirm(msg)) {
      await deleteTokenAsync(id);
      onTokensUpdated();
    }
  };

  const handleToggleExclude = async (responseId: string, currentExcluded: boolean) => {
    await toggleExcludeResponseAsync(responseId, !currentExcluded);
    onTokensUpdated();
  };

  const handleResetToken = async (tokenId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć wynik ankiety i odblokować ten link do ponownego wypełnienia?')) {
      await resetTokenAsync(tokenId);
      onTokensUpdated();
    }
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    setIsImporting(true);
    setImportStatus(null);
    try {
      const parsed = await parseSurveyFile(file);
      const result = await importResponseFromFileAsync(parsed);
      if (!result.success) {
        setImportStatus({ type: 'err', text: result.error || 'Import nie powiódł się.' });
      } else {
        setImportStatus({
          type: 'ok',
          text: `Wgrano wynik z pliku (${parsed.tokenUsed}). Jest już w raporcie i na liście linków.`,
        });
        onTokensUpdated();
      }
    } catch (err: any) {
      setImportStatus({ type: 'err', text: err?.message || 'Nie udało się odczytać pliku.' });
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(identifier);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const copyInvitationTemplate = (token: VoterToken) => {
    const directLink = getSurveyUrl(token.code, surveySlug);

    const message = `Cześć! 👋
Mija rok mojej pracy w firmie Kubara Sp. z o.o. Zwracam się z uprzejmą prośbą o wypełnienie krótkiej, w 100% anonimowej ankiety dotyczącej naszej codziennej współpracy (Ocena pracownika: Krzysztof Wieczorek).

Ankieta obejmuje 4 kluczowe obszary:
1. Komunikacja i relacje
2. Terminowość i niezawodność
3. Jakość pracy i samodzielność
4. Wkład własny i inicjatywa

Zależy mi na szczerym, obiektywnym feedbacku: co funkcjonuje bardzo dobrze, a jakie kwestie warto jeszcze doszlifować we wspólnej pracy.

👉 Twój bezpośredni link do ankiety (bez logowania):
${directLink}

(Ankieta jest całkowicie anonimowa i NIE wymaga logowania na konto Google ani rejestracji. Kod służy wyłącznie do zapobiegania wielokrotnemu głosowaniu. Wypełnienie zajmuje ok. 2–3 minuty).

Dziękuję za Twój czas i pomoc!`;

    navigator.clipboard.writeText(message);
    setCopiedMessageFor(token.id);
    setTimeout(() => setCopiedMessageFor(null), 3000);
  };

  const usedCount = tokens.filter(t => t.used).length;
  const pendingCount = tokens.length - usedCount;

  return (
    <div className="space-y-6">
      {/* Bento Grid: Overview & Real-time Live Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Bento Info Tile - Col 8 */}
        <div className="lg:col-span-8 bg-white text-dk-ink rounded-3xl p-6 sm:p-7 shadow-xs ring-1 ring-dk-violet-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Bezpieczne linki i automatyczny status
              </span>
              <span className="text-xs text-dk-ink/50">Kubara Sp. z o.o.</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-dk-ink">
              Unikalne linki z ankietą dla współpracowników
            </h2>
            <p className="text-sm text-dk-ink/70 mt-2 leading-relaxed max-w-[65ch]">
              Każdy współpracownik otrzymuje swój <strong>indywidualny link</strong>.
              Gdy wejdzie w link i wyśle odpowiedzi, aplikacja <strong>oznacza ten link jako wypełniony</strong> i dolicza wyniki do raportu, bez konta Google i bez haseł.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-dk-violet-soft grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-dk-ink/75">
            <div className="flex items-center gap-2 bg-dk-bg p-3 rounded-2xl border border-dk-violet-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-dk-green"></span>
              <span>Wejście bezpośrednio z linku</span>
            </div>
            <div className="flex items-center gap-2 bg-dk-bg p-3 rounded-2xl border border-dk-violet-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-dk-green"></span>
              <span>Zero kont Google i haseł</span>
            </div>
            <div className="flex items-center gap-2 bg-dk-bg p-3 rounded-2xl border border-dk-violet-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-dk-green"></span>
              <span>100% anonimowość</span>
            </div>
          </div>
        </div>

        {/* Stats Bento Tile - Col 4 */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-dk-ink/50 uppercase tracking-wide">
            Status zwrotów na żywo
          </span>

          <div className="grid grid-cols-2 gap-4 my-3">
            <div className="bg-dk-bg p-4 rounded-2xl border border-dk-violet-soft">
              <span className="text-2xl sm:text-3xl font-semibold text-dk-ink block tracking-tight">
                {tokens.length}
              </span>
              <span className="text-xs text-dk-ink/60 font-normal">wygenerowanych linków</span>
            </div>
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70">
              <span className="text-2xl sm:text-3xl font-semibold text-emerald-700 block tracking-tight">
                {usedCount}
              </span>
              <span className="text-xs text-emerald-800 font-normal">ukończonych ankiet</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Oczekujące na wypełnienie:</span>
            <strong className="text-amber-600 font-bold">{pendingCount}</strong>
          </div>
        </div>
      </div>

      {/* EXPLANATION OF 404 & URL MODE SWITCHER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-dk-violet-soft text-dk-violet-text border border-dk-violet-soft">
                Format linku dla współpracowników
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Aktywny adres bazowy: <strong className="text-slate-800 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{baseUrlInfo.url}</strong>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-dk-ink">
              Wybierz tryb generowania linków
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUrlSettings(!showUrlSettings)}
              className="btn-dk-ghost whitespace-nowrap"
            >
              <Settings2 className="w-3.5 h-3.5 text-dk-violet" />
              <span>{showUrlSettings ? 'Ukryj edycję' : 'Własny URL'}</span>
            </button>
            {tokens.length > 0 && (
              <a
                href={getSurveyUrl(tokens[0].code, surveySlug)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-dk-primary whitespace-nowrap"
                title="Otwórz przykładowy link w nowej karcie"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testuj link</span>
              </a>
            )}
          </div>
        </div>

        {/* 2 Main Choice Cards: Shared vs Dev */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Card 1: Shared Public (ais-pre) */}
          <button
            type="button"
            onClick={() => handleSelectMode('shared')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              baseUrlInfo.mode === 'shared'
                ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${baseUrlInfo.mode === 'shared' ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span className="font-bold text-slate-900 text-sm">
                    Link Publiczny (dla Współpracowników)
                  </span>
                </div>
                {baseUrlInfo.mode === 'shared' && (
                  <span className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-md bg-dk-green text-white">
                    Aktywny
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adres publiczny na Synology: <code className="text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-indigo-700">https://inyfinn.synology.me/panel-ankiet</code>.
                <strong> Nie wymaga konta ani logowania Google.</strong> Wypełnienia zapisują się w bazie na NAS.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Dostępny publicznie dla każdego bez konieczności logowania.</span>
            </div>
          </button>

          {/* Card 2: Dev Link (ais-dev) */}
          <button
            type="button"
            onClick={() => handleSelectMode('dev')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              baseUrlInfo.mode === 'dev'
                ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${baseUrlInfo.mode === 'dev' ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span className="font-bold text-slate-900 text-sm">
                    Link Deweloperski (Bieżący podgląd)
                  </span>
                </div>
                {baseUrlInfo.mode === 'dev' && (
                  <span className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-md bg-dk-green text-white">
                    Aktywny
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Używa adresu roboczego <code className="text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-slate-700">ais-dev-...</code>.
                Działa w Twoim bieżącym podglądzie.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>Wewnętrzny link do testów</span>
            </div>
          </button>
        </div>

        {/* Collapsible URL Settings Panel */}
        {showUrlSettings && (
          <form onSubmit={handleSaveCustomUrl} className="pt-3 border-t border-indigo-100 space-y-3 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Wpisz własny adres URL (np. po wdrożeniu na własnym serwerze lub Cloud Run):</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={e => setCustomUrlInput(e.target.value)}
                placeholder="np. https://ankieta.twojadomena.pl"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                Zapisz adres
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <button
                type="button"
                onClick={handleUseAiStudioPre}
                className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-semibold cursor-pointer transition-colors"
              >
                Użyj publicznego adresu (ais-pre)
              </button>
              <button
                type="button"
                onClick={handleResetUrl}
                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Przywróć domyślny
              </button>
              {urlSaveSuccess && (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs animate-fade-in">
                  <Check className="w-3.5 h-3.5" /> Zapisano!
                </span>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Action Bar: Create Token & Batch Generation */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form onSubmit={handleAddSingle} className="flex-1 flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Nazwa współpracownika (np. Dział Logistyki, Jan Kowalski)..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-dk-violet-soft text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dk-violet/40 bg-dk-bg/50"
            />
            <button
              type="submit"
              className="btn-dk-primary shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj osobę</span>
            </button>
          </form>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Generuj pakiet:</span>
            <button
              type="button"
              onClick={() => handleBatch(3)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              +3 linki
            </button>
            <button
              type="button"
              onClick={() => handleBatch(5)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              +5 linków
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-emerald-700" />
              <h3 className="font-semibold text-dk-ink text-base">Dodaj wynik z pliku</h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Gdy ktoś wypełni ankietę offline albo pobierze kopię na końcu (JSON, ZIP, PDF z danymi importu),
              wgraj ten plik tutaj — wynik trafi do tej samej bazy na Synology i do raportu.
              JPG/PNG to tylko podgląd; do importu potrzebny jest <strong>.kw360.json</strong> albo <strong>ZIP</strong> z pakietu.
            </p>
          </div>
          <label className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs sm:text-sm font-bold cursor-pointer shadow-2xs ${isImporting ? 'bg-slate-400' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
            <FileArchive className="w-4 h-4" />
            <span>{isImporting ? 'Wgrywanie...' : 'Wybierz plik wyniku'}</span>
            <input
              type="file"
              className="hidden"
              accept=".json,.zip,.pdf,.txt,.html,.kw360.json,application/json,application/zip,application/pdf"
              disabled={isImporting}
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                e.target.value = '';
                await handleImportFile(file);
              }}
            />
          </label>
        </div>
        {importStatus && (
          <div className={`mt-3 text-xs font-semibold rounded-xl px-3 py-2 border ${
            importStatus.type === 'ok'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {importStatus.text}
          </div>
        )}
      </div>

      {/* List of Tokens with Direct Links and One-Click Copy */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-dk-ink text-base">Linki do wysłania współpracownikom</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kliknij „Kopiuj Zaproszenie” i wklej współpracownikowi (na Teams, Slack, mailu lub SMS).
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">Łącznie: {tokens.length}</span>
        </div>

        {tokens.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">Brak wygenerowanych linków.</p>
            <p className="text-xs text-slate-400 mt-1">Kliknij powyżej przycisk „+3 linki” lub wpisz nazwę współpracownika.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tokens.map((token, idx) => {
              const directLink = getSurveyUrl(token.code, surveySlug);
              const linkedResponse = responses?.find(
                r => r.id === token.responseId || r.tokenUsed.trim().toUpperCase() === token.code.trim().toUpperCase()
              );
              const isExcluded = Boolean(linkedResponse?.excludedFromReport);

              return (
                <div
                  key={token.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4 transition-colors ${
                    token.used ? (isExcluded ? 'bg-amber-50/30' : 'bg-emerald-50/20') : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-6">#{idx + 1}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {token.label || `Współpracownik ${idx + 1}`}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          kod: {token.code}
                        </span>
                        {token.used ? (
                          <>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Wypełniona ({token.usedAt ? new Date(token.usedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : 'Tak'})
                            </span>
                            {isExcluded ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <EyeOff className="w-3 h-3 text-amber-700" />
                                Wykluczona z raportu (Test)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                ✓ Wliczana do raportu
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Oczekuje na wypełnienie
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-1 truncate max-w-md">
                        {directLink}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end w-full lg:max-w-[46%]">
                    {/* Exclude / Include toggle for used survey */}
                    {token.used && linkedResponse && (
                      <button
                        type="button"
                        onClick={() => handleToggleExclude(linkedResponse.id, isExcluded)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isExcluded
                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                        title={isExcluded ? "Przywróć tę ankietę do wyliczeń raportu" : "Oznacz tę ankietę jako test i wyklucz z wyników raportu"}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{isExcluded ? 'Przywróć do raportu' : 'Nie uwzględniaj (Test)'}</span>
                      </button>
                    )}

                    {/* Reset used token to empty and remove response */}
                    {token.used && (
                      <button
                        type="button"
                        onClick={() => handleResetToken(token.id)}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                        title="Usuń zapisany wynik tej ankiety i odblokuj link do ponownego wypełnienia"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>Usuń wynik / Resetuj</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => copyInvitationTemplate(token)}
                      className="btn-dk-primary"
                      title="Kopiuj gotową, uprzejmą wiadomość z linkiem do wklejenia na Teams/Slack/Mail"
                    >
                      {copiedMessageFor === token.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span className="text-white">Skopiowano wiadomość!</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Kopiuj Zaproszenie</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(directLink, token.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Kopiuj sam link"
                    >
                      {copiedCode === token.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Link skopiowany</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kopiuj Link</span>
                        </>
                      )}
                    </button>

                    {onSelectTokenToFill && (
                      <button
                        type="button"
                        onClick={() => onSelectTokenToFill(token.code)}
                        className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Otwórz i przetestuj ankietę bezpośrednio w tej aplikacji (bez nowej karty)"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Wypełnij</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(token.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Usuń link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


