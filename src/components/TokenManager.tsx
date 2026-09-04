import React, { useState } from 'react';
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
  Clock,
  CheckCircle2
} from 'lucide-react';
import { VoterToken } from '../types';
import { getSurveyUrl, addCustomToken, deleteToken } from '../utils/surveyStorage';

interface TokenManagerProps {
  tokens: VoterToken[];
  onTokensUpdated: () => void;
  onSelectTokenToFill?: (code: string) => void;
  onGenerateToken?: (label?: string) => void;
  onBatchGenerate?: (count: number) => void;
  onDeleteToken?: (id: string) => void;
}

export const TokenManager: React.FC<TokenManagerProps> = ({
  tokens,
  onTokensUpdated,
  onSelectTokenToFill,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessageFor, setCopiedMessageFor] = useState<string | null>(null);

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomToken(newLabel.trim() || undefined);
    setNewLabel('');
    onTokensUpdated();
  };

  const handleBatch = (count: number) => {
    for (let i = 0; i < count; i++) {
      addCustomToken(`Współpracownik ${tokens.length + i + 1}`);
    }
    onTokensUpdated();
  };

  const handleDelete = (id: string) => {
    deleteToken(id);
    onTokensUpdated();
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(identifier);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const copyInvitationTemplate = (token: VoterToken) => {
    const directLink = getSurveyUrl(token.code);

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

(Kliknięcie w powyższy link otwiera od razu ankietę bez logowania. Kod służy wyłącznie do zapobiegania wielokrotnemu głosowaniu i jest w 100% anonimowy. Wypełnienie zajmuje ok. 2–3 minuty).

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
        <div className="lg:col-span-8 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xs ring-1 ring-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Bezpieczne Linki & Automatyczny Status
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-medium">Kubara Sp. z o.o.</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Unikalne Linki z Ankietą dla Współpracowników
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Każdy współpracownik otrzymuje swój <strong>indywidualny link</strong>. 
              Gdy współpracownik wejdzie w link i wyśle odpowiedzi, aplikacja <strong>automatycznie oznacza ten link jako wypełniony</strong> i dolicza wyniki do Twojego raportu – bez konieczności logowania się kontem Google czy hasłami.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Wejście bezpośrednio z linku</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Zero kont i haseł</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>100% anonimowość</span>
            </div>
          </div>
        </div>

        {/* Stats Bento Tile - Col 4 */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Status Zwrotów na Żywo
          </span>

          <div className="grid grid-cols-2 gap-4 my-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
                {tokens.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">wygenerowanych linków</span>
            </div>
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 block tracking-tight">
                {usedCount}
              </span>
              <span className="text-xs text-emerald-800 font-medium">ukończonych ankiet</span>
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
          <form onSubmit={handleAddSingle} className="flex-1 flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Nazwa współpracownika (np. Dział Logistyki, Jan Kowalski)..."
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
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

      {/* List of Tokens with Direct Links and One-Click Copy */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Linki do wysłania współpracownikom</h3>
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
              const directLink = getSurveyUrl(token.code);

              return (
                <div
                  key={token.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    token.used ? 'bg-emerald-50/20' : 'hover:bg-slate-50/70'
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
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Wypełniona ({token.usedAt ? new Date(token.usedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : 'Tak'})
                          </span>
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

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => copyInvitationTemplate(token)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Kopiuj gotową, uprzejmą wiadomość z linkiem do wklejenia na Teams/Slack/Mail"
                    >
                      {copiedMessageFor === token.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Skopiowano wiadomość!</span>
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
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Otwórz i przetestuj ankietę jako ten współpracownik"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}

                    {!token.used && (
                      <button
                        type="button"
                        onClick={() => handleDelete(token.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Usuń link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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

