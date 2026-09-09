import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, Key, BarChart3, Eye, Copy, Check, Plus, Trash2, Loader2, ExternalLink,
  MessageSquareQuote, EyeOff, RotateCcw,
} from 'lucide-react';
import { customApi } from '../../customApi';
import { CustomSurvey, CustomQuestion, CustomResponse } from '../../customTypes';
import { VoterToken } from '../../types';

interface Props {
  surveyId: string;
  onBack: () => void;
  onOpenFill: (slug: string, token?: string) => void;
  onEdit: (surveyId: string) => void;
}

export const CustomSurveyAdmin: React.FC<Props> = ({ surveyId, onBack, onOpenFill, onEdit }) => {
  const [survey, setSurvey] = useState<CustomSurvey | null>(null);
  const [tab, setTab] = useState<'tokens' | 'report'>('report');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setSurvey(await customApi.getSurvey(surveyId));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    const t = window.setInterval(load, 5000); // live sync like the built-in panel
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  if (loading || !survey) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const linkFor = (code?: string) =>
    `${window.location.origin}/?survey=${survey.slug}${code ? `&token=${code}` : ''}`;
  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const addToken = async () => {
    setBusy(true);
    try {
      await customApi.createToken(survey.id, newLabel.trim() || 'Respondent');
      setNewLabel('');
      await load();
    } finally {
      setBusy(false);
    }
  };
  const delToken = async (tid: string) => { setBusy(true); try { await customApi.deleteToken(survey.id, tid); await load(); } finally { setBusy(false); } };
  const delResp = async (rid: string) => {
    if (!window.confirm('Usunąć tę odpowiedź?')) return;
    setBusy(true); try { await customApi.deleteResponse(survey.id, rid); await load(); } finally { setBusy(false); }
  };
  const toggleExclude = async (r: CustomResponse) => {
    setBusy(true); try { await customApi.excludeResponse(survey.id, r.id, !r.excludedFromReport); await load(); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3">
            <ChevronLeft className="w-4 h-4" /> Menedżer ankiet
          </button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{survey.title}</h1>
              <p className="text-[11px] text-slate-500">
                {survey.subjectName}{survey.subjectName && survey.companyName ? ' • ' : ''}{survey.companyName}
                {' • '}{survey.status === 'active' ? 'Aktywna' : 'Wstrzymana'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(survey.id)} className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl cursor-pointer">
                Edytuj pytania
              </button>
              <button onClick={() => copy('link', linkFor())} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl cursor-pointer">
                {copied === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} Kopiuj link
              </button>
              <button onClick={() => onOpenFill(survey.slug)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" /> Podgląd
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 py-2.5 mt-3">
            <TabBtn active={tab === 'tokens'} onClick={() => setTab('tokens')} icon={<Key className="w-4 h-4" />} label={`Kody i Linki (${survey.tokens.length})`} />
            <TabBtn active={tab === 'report'} onClick={() => setTab('report')} icon={<BarChart3 className="w-4 h-4" />} label={`Raport & Odpowiedzi (${survey.responses.length})`} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {tab === 'tokens' ? (
          <div>
            <div className="flex gap-2 mb-5">
              <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Etykieta (np. Dział Handlowy)"
                className="flex-1 text-sm bg-white border border-slate-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-slate-900" />
              <button onClick={addToken} disabled={busy} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-2xl cursor-pointer">
                <Plus className="w-4 h-4" /> Wygeneruj kod
              </button>
            </div>
            {survey.tokens.length === 0 ? (
              <Empty icon={<Key className="w-9 h-9" />} text="Brak kodów. Ankietę można wypełnić także bez kodu (link ogólny powyżej)." />
            ) : (
              <div className="space-y-2">
                {survey.tokens.map((t: VoterToken) => (
                  <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                    <code className="text-sm font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg">{t.code}</code>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{t.label}</p>
                      <p className="text-[11px] text-slate-400">{t.used ? 'Wykorzystany' : 'Nieużyty'}</p>
                    </div>
                    <button onClick={() => copy(t.id, linkFor(t.code))} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl cursor-pointer">
                      {copied === t.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} Kopiuj link
                    </button>
                    <button onClick={() => delToken(t.id)} className="p-2 text-slate-300 hover:text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <CustomReport survey={survey} onToggleExclude={toggleExclude} onDelete={delResp} busy={busy} />
        )}
      </main>
    </div>
  );
};

const CustomReport: React.FC<{
  survey: CustomSurvey;
  onToggleExclude: (r: CustomResponse) => void;
  onDelete: (rid: string) => void;
  busy: boolean;
}> = ({ survey, onToggleExclude, onDelete }) => {
  const included = survey.responses.filter((r) => !r.excludedFromReport);
  const questions = survey.questions.filter((q) => q.type !== 'section');

  const stats = useMemo(() => {
    return questions.map((q) => {
      const nums: number[] = [];
      const counts: Record<string, number> = {};
      const texts: string[] = [];
      for (const r of included) {
        const v = r.answers[q.id];
        if (v === undefined) continue;
        if (q.type === 'slider' && typeof v === 'number') nums.push(v);
        else if (q.type === 'text' && typeof v === 'string') texts.push(v);
        else if (Array.isArray(v)) v.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
        else counts[String(v)] = (counts[String(v)] || 0) + 1;
      }
      const avg = nums.length ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : undefined;
      return { q, avg, counts, texts, answerCount: nums.length + Object.values(counts).reduce((a, b) => a + b, 0) + texts.length };
    });
  }, [questions, included]);

  const labelFor = (q: CustomQuestion, val: string) => q.options?.find((o) => o.value === val)?.label ?? val;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-slate-900 text-white rounded-2xl px-5 py-3">
          <div className="text-2xl font-black leading-none">{included.length}</div>
          <div className="text-[11px] text-slate-300 mt-1">liczonych odpowiedzi</div>
        </div>
        {survey.responses.length !== included.length && (
          <p className="text-xs text-slate-500">{survey.responses.length - included.length} wykluczonych z raportu (test).</p>
        )}
      </div>

      {included.length === 0 && survey.responses.length === 0 ? (
        <Empty icon={<BarChart3 className="w-9 h-9" />} text="Brak odpowiedzi. Rozešlij link do ankiety." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {stats.map(({ q, avg, counts, texts, answerCount }) => {
            const maxc = Math.max(1, ...Object.values(counts).map(Number));
            return (
              <div key={q.id} className="bg-white rounded-3xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{q.title}</h4>
                  {avg !== undefined && (
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-slate-900">{avg}</div>
                      <div className="text-[10px] text-slate-400">średnia ({q.min}–{q.max})</div>
                    </div>
                  )}
                </div>
                {Object.keys(counts).length > 0 && (
                  <div className="space-y-2 mt-4">
                    {Object.entries(counts).sort((a, b) => Number(b[1]) - Number(a[1])).map(([val, c]) => (
                      <div key={val}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600 font-medium truncate pr-2">{labelFor(q, val)}</span>
                          <span className="text-slate-400 font-bold">{Number(c)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-900 rounded-full" style={{ width: `${(Number(c) / maxc) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {texts.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                    {texts.map((t, i) => (
                      <p key={i} className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2">„{t}”</p>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-[11px] text-slate-400">{answerCount} odpowiedzi na to pytanie</div>
              </div>
            );
          })}
        </div>
      )}

      {survey.responses.length > 0 && (
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-2">Wszystkie nadesłane ankiety</h3>
          <div className="space-y-2">
            {survey.responses.map((r, i) => (
              <div key={r.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-3 ${r.excludedFromReport ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200'}`}>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">#{survey.responses.length - i}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {survey.isAnonymous ? 'Respondent anonimowy' : r.tokenUsed || '—'}
                    {r.excludedFromReport && <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Wykluczona z raportu (Test)</span>}
                  </p>
                  <p className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleString('pl-PL')}</p>
                </div>
                <button onClick={() => onToggleExclude(r)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl cursor-pointer">
                  {r.excludedFromReport ? <><RotateCcw className="w-3.5 h-3.5" /> Przywróć</> : <><EyeOff className="w-3.5 h-3.5" /> Nie uwzględniaj</>}
                </button>
                <button onClick={() => onDelete(r.id)} className="p-2 text-slate-300 hover:text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`py-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${active ? 'text-white bg-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}>
    {icon} <span>{label}</span>
  </button>
);

const Empty: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
    <div className="text-slate-300 mx-auto mb-3 flex justify-center">{icon}</div>
    <p className="text-slate-500 font-medium">{text}</p>
  </div>
);
