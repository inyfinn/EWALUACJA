import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Save, GripVertical } from 'lucide-react';
import { customApi, defaultQuestion } from '../../customApi';
import { CustomQuestion, CustomQuestionType, CustomSurvey, QUESTION_TYPE_LABELS, QUESTION_TYPE_HINTS } from '../../customTypes';

interface Props {
  surveyId: string | null; // null = create new
  onBack: () => void;
  onSaved: (surveyId: string) => void;
}

export const SurveyBuilder: React.FC<Props> = ({ surveyId, onBack, onSaved }) => {
  const [loading, setLoading] = useState(Boolean(surveyId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [introText, setIntroText] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [requireToken, setRequireToken] = useState(false);
  const [questions, setQuestions] = useState<CustomQuestion[]>([defaultQuestion('slider')]);

  useEffect(() => {
    if (!surveyId) return;
    (async () => {
      try {
        const s = await customApi.getSurvey(surveyId);
        setTitle(s.title); setSubjectName(s.subjectName || ''); setCompanyName(s.companyName || '');
        setDescription(s.description || ''); setIntroText(s.introText || '');
        setStatus(s.status); setIsAnonymous(s.isAnonymous !== false); setRequireToken(Boolean(s.requireToken));
        setQuestions(s.questions.length ? s.questions : [defaultQuestion('slider')]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [surveyId]);

  const patchQ = (i: number, patch: Partial<CustomQuestion>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const changeType = (i: number, type: CustomQuestionType) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...defaultQuestion(type), id: q.id, title: q.title, subtitle: q.subtitle, help: q.help, required: q.required } : q)));
  const addQ = () => setQuestions((qs) => [...qs, defaultQuestion('slider')]);
  const delQ = (i: number) => setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => setQuestions((qs) => {
    const t = i + dir; if (t < 0 || t >= qs.length) return qs;
    const next = [...qs]; [next[i], next[t]] = [next[t], next[i]]; return next;
  });

  const save = async () => {
    if (!title.trim()) { setError('Podaj nazwę ankiety.'); return; }
    setSaving(true); setError(null);
    try {
      const payload: Partial<CustomSurvey> = {
        title, subjectName, companyName, description, introText, status, isAnonymous, requireToken,
        questions: questions.filter((q) => q.type === 'section' || q.title.trim()),
      };
      const saved = surveyId ? await customApi.updateSurvey(surveyId, payload) : await customApi.createSurvey(payload);
      onSaved(saved.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-slate-100"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-100/90 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
            <ChevronLeft className="w-4 h-4" /> Menedżer ankiet
          </button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-2xl cursor-pointer">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {surveyId ? 'Zapisz zmiany' : 'Utwórz ankietę'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-5">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-extrabold text-slate-900">{surveyId ? 'Edytuj ankietę' : 'Nowa ankieta'}</h2>
          <Field label="Nazwa ankiety *" value={title} onChange={setTitle} placeholder="np. Ankieta satysfakcji zespołu" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Osoba / temat (opcjonalnie)" value={subjectName} onChange={setSubjectName} />
            <Field label="Firma / organizacja" value={companyName} onChange={setCompanyName} />
          </div>
          <Area label="Opis / nagłówek na stronie startowej" value={description} onChange={setDescription} />
          <Area label="Tekst powitalny" value={introText} onChange={setIntroText} />
          <div className="grid sm:grid-cols-3 gap-3 items-center pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3 cursor-pointer">
                <option value="active">Aktywna</option>
                <option value="inactive">Wstrzymana</option>
              </select>
            </div>
            <Toggle label="Anonimowa" checked={isAnonymous} onChange={setIsAnonymous} />
            <Toggle label="Wymagaj kodu" checked={requireToken} onChange={setRequireToken} />
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={i}
              total={questions.length}
              onPatch={(patch) => patchQ(i, patch)}
              onType={(t) => changeType(i, t)}
              onMove={(d) => move(i, d)}
              onDelete={() => delQ(i)}
            />
          ))}
        </div>

        <button onClick={addQ} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Dodaj pytanie
        </button>

        {error && <p className="text-sm text-rose-600">{error}</p>}
      </main>
    </div>
  );
};

const QuestionCard: React.FC<{
  q: CustomQuestion; index: number; total: number;
  onPatch: (p: Partial<CustomQuestion>) => void;
  onType: (t: CustomQuestionType) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
}> = ({ q, index, total, onPatch, onType, onMove, onDelete }) => {
  const isChoice = q.type === 'single_choice' || q.type === 'multi_choice';
  const opts = q.options || [];
  const setOpt = (i: number, label: string) =>
    onPatch({ options: opts.map((o, idx) => (idx === i ? { ...o, label, value: o.value || slugish(label) } : o)) });
  const addOpt = () => onPatch({ options: [...opts, { value: `opcja-${opts.length + 1}`, label: `Opcja ${opts.length + 1}` }] });
  const delOpt = (i: number) => onPatch({ options: opts.filter((_, idx) => idx !== i) });

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 ${q.type === 'section' ? 'bg-slate-50' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-bold text-slate-400">#{index + 1}</span>
        <select value={q.type} onChange={(e) => onType(e.target.value as CustomQuestionType)} className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 cursor-pointer">
          {Object.entries(QUESTION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span className="text-[11px] text-slate-400 hidden sm:inline flex-1">{QUESTION_TYPE_HINTS[q.type]}</span>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1.5 text-slate-300 hover:text-slate-700 disabled:opacity-30 cursor-pointer"><ArrowUp className="w-4 h-4" /></button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="p-1.5 text-slate-300 hover:text-slate-700 disabled:opacity-30 cursor-pointer"><ArrowDown className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <input
        value={q.title}
        onChange={(e) => onPatch({ title: e.target.value })}
        placeholder={q.type === 'section' ? 'Tytuł sekcji' : 'Treść pytania'}
        className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      <input
        value={q.subtitle || ''}
        onChange={(e) => onPatch({ subtitle: e.target.value })}
        placeholder="Podtytuł / etykieta (opcjonalnie)"
        className="w-full text-xs mt-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
      />

      {q.type === 'slider' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <NumberField label="Min" value={q.min ?? 1} onChange={(v) => onPatch({ min: v })} />
          <NumberField label="Max" value={q.max ?? 5} onChange={(v) => onPatch({ max: v })} />
          <Field label="Etykieta min" value={q.minLabel || ''} onChange={(v) => onPatch({ minLabel: v })} small />
          <Field label="Etykieta max" value={q.maxLabel || ''} onChange={(v) => onPatch({ maxLabel: v })} small />
        </div>
      )}

      {isChoice && (
        <div className="mt-3">
          <label className="block text-xs font-bold text-slate-600 mb-2">Opcje odpowiedzi</label>
          <div className="space-y-2">
            {opts.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                <input value={o.label} onChange={(e) => setOpt(i, e.target.value)} placeholder={`Opcja ${i + 1}`}
                  className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900" />
                <button onClick={() => delOpt(i)} className="text-slate-300 hover:text-rose-500 cursor-pointer shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={addOpt} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Dodaj opcję</button>
        </div>
      )}

      {(q.type === 'yes_no' || q.type === 'yes_no_dontknow') && (
        <p className="text-xs text-slate-400 mt-3">Opcje: {(q.options || []).map((o) => o.label).join(' / ')}</p>
      )}

      {q.type !== 'section' && (
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-100">
          <Toggle label="Wymagane" checked={Boolean(q.required)} onChange={(v) => onPatch({ required: v })} small />
          {(q.type === 'slider' || isChoice) && (
            <Toggle label="Pozwól na komentarz" checked={Boolean(q.allowComment)} onChange={(v) => onPatch({ allowComment: v })} small />
          )}
        </div>
      )}
    </div>
  );
};

function slugish(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'opcja'; }

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; small?: boolean }> = ({ label, value, onChange, placeholder, small }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full ${small ? 'text-xs' : 'text-sm'} bg-slate-50 border border-slate-200 rounded-2xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900`} />
  </div>
);
const Area: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2}
      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900" />
  </div>
);
const NumberField: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
    <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-2xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900" />
  </div>
);
const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void; small?: boolean }> = ({ label, checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-left cursor-pointer">
    <span className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
    <span className="text-xs font-semibold text-slate-700">{label}</span>
  </button>
);
