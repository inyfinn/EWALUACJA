import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Loader2, AlertCircle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { customApi } from '../../customApi';
import { CustomSurvey, CustomQuestion } from '../../customTypes';
import { CustomGestureSlider } from './CustomGestureSlider';

type AnswerValue = number | string | string[] | undefined;

interface Props {
  surveyId: string;
  token?: string;
}

export const CustomSurveyFill: React.FC<Props> = ({ surveyId, token }) => {
  const [survey, setSurvey] = useState<CustomSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await customApi.getPublicSurvey(surveyId);
        if (active) setSurvey(s);
      } catch (e: any) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [surveyId]);

  const questions = survey?.questions || [];
  const set = (id: string, v: AnswerValue) => setAnswers((p) => ({ ...p, [id]: v }));

  const missingRequired = useMemo(() => {
    return questions.some((q) => {
      if (q.type === 'section' || !q.required) return false;
      const v = answers[q.id];
      if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return true;
      return false;
    });
  }, [questions, answers]);

  const submit = async () => {
    if (!survey) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const cleanAnswers: Record<string, number | string | string[]> = {};
      for (const [k, v] of Object.entries(answers)) {
        if (v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) cleanAnswers[k] = v as number | string | string[];
      }
      await customApi.submitResponse(survey.id, { tokenUsed: token, answers: cleanAnswers, comments });
      setDone(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Centered><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></Centered>;
  if (error || !survey)
    return (
      <Centered>
        <div className="max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-900">Nie można otworzyć ankiety</h1>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
        </div>
      </Centered>
    );

  const Header = (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base">
            {(survey.subjectName || survey.title).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight leading-tight">{survey.title}</h1>
            {(survey.subjectName || survey.companyName) && (
              <p className="text-[11px] text-slate-500 font-medium">
                {survey.subjectName}{survey.subjectName && survey.companyName ? ' • ' : ''}{survey.companyName}
              </p>
            )}
          </div>
        </div>
        {survey.isAnonymous && (
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> <span className="hidden sm:inline">Formularz anonimowy</span>
          </div>
        )}
      </div>
    </header>
  );

  if (done)
    return (
      <div className="min-h-screen bg-slate-100/90">
        {Header}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-10">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Dziękujemy za odpowiedź!</h2>
            <p className="text-slate-500 mt-3">Twoja opinia została zapisana.</p>
          </div>
        </main>
      </div>
    );

  if (!started)
    return (
      <div className="min-h-screen bg-slate-100/90">
        {Header}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-10">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-slate-900 text-white px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Ankieta
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-4 leading-tight">{survey.description || survey.title}</h2>
            {survey.introText && <p className="text-slate-500 mt-3">{survey.introText}</p>}
            <button
              onClick={() => setStarted(true)}
              className="mt-6 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl transition-colors cursor-pointer shadow-sm"
            >
              Rozpocznij Ankietę <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100/90 pb-16">
      {Header}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          {questions.map((q) =>
            q.type === 'section' ? (
              <div key={q.id} className="pt-2 first:pt-0">
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{q.title}</h3>
                {q.subtitle && <p className="text-sm text-slate-500 mt-1">{q.subtitle}</p>}
                {q.help && <p className="text-xs text-slate-400 mt-1">{q.help}</p>}
                <div className="border-b border-slate-100 mt-3" />
              </div>
            ) : (
              <div key={q.id} className="border-t border-slate-100 pt-5 first:border-t-0 first:pt-0">
                <p className="text-base font-bold text-slate-800 leading-snug">
                  {q.title}
                  {q.required && <span className="text-rose-400 ml-1">*</span>}
                </p>
                {q.subtitle && <p className="text-xs text-slate-500 mt-0.5">{q.subtitle}</p>}
                <QuestionField
                  q={q}
                  value={answers[q.id]}
                  comment={comments[q.id] || ''}
                  onChange={(v) => set(q.id, v)}
                  onComment={(c) => setComments((p) => ({ ...p, [q.id]: c }))}
                />
              </div>
            ),
          )}

          {submitError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={submit}
              disabled={submitting || missingRequired}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-3 rounded-2xl transition-colors cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Wyślij ankietę
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">{children}</div>
);

const QuestionField: React.FC<{
  q: CustomQuestion;
  value: AnswerValue;
  comment: string;
  onChange: (v: AnswerValue) => void;
  onComment: (c: string) => void;
}> = ({ q, value, comment, onChange, onComment }) => {
  const choices = (opts: { value: string; label: string }[], multi: boolean) => {
    const selected = multi ? (Array.isArray(value) ? value : []) : typeof value === 'string' ? [value] : [];
    const toggle = (v: string) => {
      if (multi) {
        const set = new Set(selected);
        set.has(v) ? set.delete(v) : set.add(v);
        onChange(Array.from(set));
      } else onChange(v);
    };
    return (
      <div className={`grid gap-2 mt-3 ${opts.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {opts.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={`text-left flex items-start gap-2.5 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                active ? 'border-emerald-500 bg-emerald-50 text-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className={`mt-0.5 w-5 h-5 ${multi ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center shrink-0 ${active ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 text-transparent'}`}>
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="leading-snug">{o.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  let field: React.ReactNode = null;
  if (q.type === 'slider') {
    field = (
      <CustomGestureSlider
        value={typeof value === 'number' ? value : undefined}
        onChange={(v) => onChange(v)}
        min={q.min ?? 1}
        max={q.max ?? 5}
        minLabel={q.minLabel}
        maxLabel={q.maxLabel}
      />
    );
  } else if (q.type === 'text') {
    field = (
      <textarea
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Wpisz odpowiedź..."
        className="w-full mt-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
    );
  } else {
    field = choices(q.options || [], q.type === 'multi_choice');
  }

  return (
    <div>
      {field}
      {q.allowComment && q.type !== 'text' && (
        <textarea
          value={comment}
          onChange={(e) => onComment(e.target.value)}
          rows={2}
          placeholder="Komentarz (opcjonalnie)..."
          className="w-full mt-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      )}
    </div>
  );
};
