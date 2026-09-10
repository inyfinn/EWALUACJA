import React, { useState } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ExternalLink, 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  EyeOff,
  FileArchive,
  Upload,
} from 'lucide-react';
import { VoterToken, SurveyResponse } from '../types';
import { 
  getSurveyUrl, 
  addCustomTokenAsync, 
  deleteTokenAsync,
  toggleExcludeResponseAsync,
  resetTokenAsync,
  importResponseFromFileAsync
} from '../utils/surveyStorage';
import { parseSurveyFile } from '../utils/surveyTransfer';
import { HintTooltip } from './HintTooltip';
import { ConfirmPopover } from './ConfirmPopover';

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
  const [createAsTest, setCreateAsTest] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessageFor, setCopiedMessageFor] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCustomTokenAsync(newLabel.trim() || `Ankietowany ${tokens.length + 1}`, surveyId, createAsTest);
    setNewLabel('');
    onTokensUpdated();
  };

  const handleBatch = async (count: number) => {
    for (let i = 0; i < count; i++) {
      await addCustomTokenAsync(`Ankietowany ${tokens.length + i + 1}`, surveyId, createAsTest);
    }
    onTokensUpdated();
  };

  const handleDelete = async (id: string) => {
    await deleteTokenAsync(id);
    setSelectedIds((ids) => ids.filter((x) => x !== id));
    onTokensUpdated();
  };

  const handleToggleExclude = async (responseId: string, currentExcluded: boolean) => {
    await toggleExcludeResponseAsync(responseId, !currentExcluded);
    onTokensUpdated();
  };

  const handleResetToken = async (tokenId: string) => {
    await resetTokenAsync(tokenId);
    onTokensUpdated();
  };

  const toggleToken = (id: string) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const selectedTokens = tokens.filter((t) => selectedIds.includes(t.id));
  const allTokensSelected = tokens.length > 0 && selectedIds.length === tokens.length;

  const bulkDeleteTokens = async () => {
    for (const token of selectedTokens) {
      await deleteTokenAsync(token.id);
    }
    setSelectedIds([]);
    onTokensUpdated();
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

👉 Twój bezpośredni link do ankiety:
${directLink}

Ankieta jest anonimowa. Link działa jeden raz. Wypełnienie zajmuje ok. 2–3 minuty.

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
              Unikalne linki dla ankietowanych
            </h2>
            <p className="text-sm text-dk-ink/70 mt-2 leading-relaxed max-w-[65ch]">
              Każdy ankietowany dostaje swój <strong>indywidualny link</strong> do wypełnienia.
              Gdy wyśle odpowiedzi, link zostaje oznaczony jako wypełniony, a wynik trafia do raportu.
              To nie daje dostępu do Panelu Ankiet.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-dk-violet-soft grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-dk-ink/75">
            <div className="flex items-center gap-2 bg-dk-bg p-3 rounded-2xl border border-dk-violet-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-dk-green"></span>
              <span>Wejście bezpośrednio z linku</span>
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

      {/* Action Bar: Create Token & Batch Generation */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form onSubmit={handleAddSingle} className="flex-1 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Nazwa ankietowanego (np. Dział Logistyki, Jan Kowalski)..."
                className="flex-1 min-w-[180px] px-4 py-2.5 rounded-2xl border border-dk-violet-soft text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dk-violet/40 bg-dk-bg/50"
            />
            <HintTooltip text="Włącza tryb testowy: wynik z tego linku nie wlicza się do raportu.">
              <button
                type="button"
                role="switch"
                aria-checked={createAsTest}
                onClick={() => setCreateAsTest((v) => !v)}
                className="inline-flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${createAsTest ? 'bg-dk-green' : 'bg-slate-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${createAsTest ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </span>
                <span className="text-xs font-semibold text-dk-ink">Link testowy</span>
              </button>
            </HintTooltip>
            <HintTooltip text="Tworzy nowy unikalny link do wypełnienia. Ta osoba nie dostaje dostępu do panelu.">
              <button
                type="submit"
                className="btn-dk-primary shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj ankietowanego (nowy link)</span>
              </button>
            </HintTooltip>
          </form>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Generuj pakiet:</span>
            <HintTooltip text="Dodaje od razu trzy nowe linki do wypełnienia.">
              <button
                type="button"
                onClick={() => handleBatch(3)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                +3 linki
              </button>
            </HintTooltip>
            <HintTooltip text="Dodaje od razu pięć nowych linków do wypełnienia.">
              <button
                type="button"
                onClick={() => handleBatch(5)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                +5 linków
              </button>
            </HintTooltip>
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
          <HintTooltip text="Wgrywa wynik z pliku JSON albo ZIP do tej ankiety na serwerze.">
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
          </HintTooltip>
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
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-16 z-20 bg-white">
          <div>
            <h3 className="font-semibold text-dk-ink text-base">Linki do wysłania ankietowanym</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kliknij „Kopiuj Zaproszenie” i wklej osobie, która ma wypełnić ankietę (Teams, Slack, mail lub SMS).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tokens.length > 0 && (
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-dk-ink cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-dk-violet"
                  checked={allTokensSelected}
                  onChange={() => setSelectedIds(allTokensSelected ? [] : tokens.map((t) => t.id))}
                />
                Zaznacz wszystkie
              </label>
            )}
            {selectedTokens.length > 0 && (
              <ConfirmPopover
                message={
                  selectedTokens.some((t) => t.used)
                    ? `Usunąć ${selectedTokens.length} zaznaczonych linków? Wypełnione znikną też z raportu.`
                    : `Usunąć ${selectedTokens.length} zaznaczonych linków?`
                }
                onConfirm={bulkDeleteTokens}
              >
                <button type="button" className="btn-dk-danger !py-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Usuń zaznaczone
                </button>
              </ConfirmPopover>
            )}
            <span className="text-xs font-bold text-slate-400">Łącznie: {tokens.length}</span>
          </div>
        </div>

        {tokens.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">Brak wygenerowanych linków.</p>
            <p className="text-xs text-slate-400 mt-1">Wpisz nazwę ankietowanego albo kliknij „Dodaj ankietowanego (nowy link)”.</p>
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
                    selectedIds.includes(token.id)
                      ? 'bg-dk-violet-soft/40'
                      : token.used ? (isExcluded ? 'bg-amber-50/30' : 'bg-emerald-50/20') : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 shrink-0 rounded accent-dk-violet cursor-pointer"
                      checked={selectedIds.includes(token.id)}
                      aria-label={`Zaznacz ${token.label || token.code}`}
                      onChange={() => toggleToken(token.id)}
                    />
                    <span className="text-xs font-mono font-bold text-slate-400 w-6">#{idx + 1}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {token.label || `Ankietowany ${idx + 1}`}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          kod: {token.code}
                        </span>
                        {token.test && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Testowy
                          </span>
                        )}
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
                      <HintTooltip text={isExcluded ? 'Znowu wlicza tę odpowiedź do średnich w raporcie.' : 'Oznacza odpowiedź jako test i wyłącza ją ze średnich raportu.'}>
                      <button
                        type="button"
                        onClick={() => handleToggleExclude(linkedResponse.id, isExcluded)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isExcluded
                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{isExcluded ? 'Przywróć do raportu' : 'Nie uwzględniaj (Test)'}</span>
                      </button>
                      </HintTooltip>
                    )}

                    {token.used && (
                      <HintTooltip text="Kasuje zapisany wynik i odblokowuje ten sam link do ponownego wypełnienia.">
                      <ConfirmPopover
                        message="Usunąć wynik tej ankiety i odblokować ten sam link do ponownego wypełnienia?"
                        confirmLabel="Usuń wynik"
                        onConfirm={() => handleResetToken(token.id)}
                      >
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>Usuń wynik / Resetuj</span>
                      </button>
                      </ConfirmPopover>
                      </HintTooltip>
                    )}

                    <HintTooltip text="Kopiuje gotową wiadomość z linkiem, do wklejenia na Teams, Slack albo mail.">
                    <button
                      type="button"
                      onClick={() => copyInvitationTemplate(token)}
                      className="btn-dk-primary"
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
                    </HintTooltip>

                    <HintTooltip text="Kopiuje sam adres linku, bez treści wiadomości.">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(directLink, token.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
                    </HintTooltip>

                    {onSelectTokenToFill && (
                      <HintTooltip text="Otwiera ten unikalny link w tej samej aplikacji, żeby sprawdzić formularz.">
                      <button
                        type="button"
                        onClick={() => onSelectTokenToFill(token.code)}
                        className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Wypełnij</span>
                      </button>
                      </HintTooltip>
                    )}

                    <HintTooltip text="Usuwa ten kod. Osoba z tym linkiem nie wypełni już ankiety.">
                    <ConfirmPopover
                      message={
                        token.used
                          ? `Ten link (${token.label || token.code}) został już wypełniony. Usunięcie skasuje też wynik z raportu.`
                          : `Usunąć link „${token.label || token.code}”?`
                      }
                      onConfirm={() => handleDelete(token.id)}
                    >
                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      aria-label="Usuń link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    </ConfirmPopover>
                    </HintTooltip>
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


