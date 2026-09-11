import { useState, FormEvent } from 'react';
import { ManagedSurvey, SurveyResponse } from '../types';
import { saveResponseAsync } from '../utils/surveyStorage';

interface Props {
  survey: ManagedSurvey;
  token: string;
  onDone?: () => void;
}

export function GenericFillView({ survey, token, onDone }: Props) {
  const [values, setValues] = useState<Record<string, string | number | string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const closed = survey.status === 'closed';

  const setVal = (id: string, value: string | number | string[]) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    for (const field of survey.fields) {
      if (!field.required) continue;
      const v = values[field.id];
      if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
        setError(`Uzupełnij pole: ${field.label}`);
        return;
      }
    }
    if (!token.trim()) {
      setError('Brak kodu zaproszenia. Otwórz ankietę z unikalnego linku.');
      return;
    }
    setBusy(true);
    const payload: SurveyResponse = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      tokenUsed: token,
      surveyId: survey.id,
      answers: values,
      selectedFactors: {},
      dimensionComments: {},
      collaborationContext: '',
      teamRelation: '',
    };
    const res = await saveResponseAsync(payload);
    setBusy(false);
    if (!res.success) {
      setError(res.error || 'Nie zapisano na serwerze.');
      return;
    }
    setDone(true);
    onDone?.();
  };

  if (closed) {
    return <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl border text-sm">Ta ankieta jest zamknięta.</div>;
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl border text-center">
        <h2 className="text-2xl font-black">Dziękujemy</h2>
        <p className="text-sm text-slate-600 mt-2">Odpowiedzi zostały zapisane na serwerze.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 py-8 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h1 className="text-2xl font-black tracking-tight">{survey.title}</h1>
        {survey.description && <p className="text-sm text-slate-600 mt-2">{survey.description}</p>}
      </div>
      {survey.fields.map((field) => (
        <div key={field.id} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-2">
          <label className="block text-sm font-bold">
            {field.label} {field.required && <span className="text-rose-600">*</span>}
          </label>
          {field.help && <p className="text-xs text-slate-500">{field.help}</p>}
          {field.type === 'short_text' && (
            <input className="w-full rounded-xl border px-3 py-2 text-sm" value={(values[field.id] as string) || ''} onChange={(e) => setVal(field.id, e.target.value)} />
          )}
          {field.type === 'long_text' && (
            <textarea className="w-full rounded-xl border px-3 py-2 text-sm min-h-[100px]" value={(values[field.id] as string) || ''} onChange={(e) => setVal(field.id, e.target.value)} />
          )}
          {field.type === 'number' && (
            <input type="number" className="w-full rounded-xl border px-3 py-2 text-sm" value={(values[field.id] as number) ?? ''} onChange={(e) => setVal(field.id, Number(e.target.value))} />
          )}
          {field.type === 'yes_no' && (
            <div className="flex gap-3">
              {['Tak', 'Nie'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm font-semibold">
                  <input type="radio" name={field.id} checked={values[field.id] === opt} onChange={() => setVal(field.id, opt)} />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {field.type === 'single_choice' && (
            <div className="space-y-1.5">
              {(field.options || []).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={field.id} checked={values[field.id] === opt} onChange={() => setVal(field.id, opt)} />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {field.type === 'multi_choice' && (
            <div className="space-y-1.5">
              {(field.options || []).map((opt) => {
                const arr = Array.isArray(values[field.id]) ? (values[field.id] as string[]) : [];
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={arr.includes(opt)}
                      onChange={(e) => {
                        const next = e.target.checked ? [...arr, opt] : arr.filter((x) => x !== opt);
                        setVal(field.id, next);
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}
          {field.type === 'scale' && (
            <input
              type="range"
              min={field.scaleMin ?? 1}
              max={field.scaleMax ?? 10}
              value={(values[field.id] as number) ?? field.scaleMin ?? 1}
              onChange={(e) => setVal(field.id, Number(e.target.value))}
              className="w-full"
            />
          )}
          {field.type === 'scale' && (
            <div className="text-xs font-bold text-slate-500">Wybrano: {String(values[field.id] ?? (field.scaleMin ?? 1))}</div>
          )}
        </div>
      ))}
      {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}
      <button type="submit" disabled={busy} className="w-full py-3 rounded-2xl bg-emerald-700 text-white font-black disabled:opacity-50">
        {busy ? 'Zapisywanie…' : 'Wyślij odpowiedzi'}
      </button>
    </form>
  );
}
