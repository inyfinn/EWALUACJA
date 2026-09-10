import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSurveyApi, newField } from '../utils/cmsApi';

export function NewSurveyPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<'blank' | 'feedback' | '360'>('blank');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fields =
        template === 'feedback'
          ? [
              { ...newField('scale'), label: 'Ogólna ocena współpracy', scaleMin: 1, scaleMax: 10 },
              { ...newField('long_text'), label: 'Co działa dobrze?', required: false },
              { ...newField('long_text'), label: 'Co warto poprawić?', required: false },
              { ...newField('yes_no'), label: 'Czy polecisz dalszą współpracę?', required: true },
            ]
          : template === '360'
            ? []
            : [newField('short_text'), newField('long_text')];

      const survey = await createSurveyApi({
        title: title.trim() || (template === '360' ? 'Nowa ewaluacja 360°' : 'Nowa ankieta'),
        description: description.trim(),
        engine: template === '360' ? '360' : 'generic',
        status: 'live',
        fields,
      });
      navigate(`/cms/surveys/${survey.id}/edit`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Nowa ankieta</h2>
        <p className="text-sm text-slate-600 mt-1">Wybierz szablon, potem dodasz i edytujesz pola.</p>
      </div>

      <div className="grid gap-3">
        {([
          { id: 'blank' as const, title: 'Pusta ankieta', text: 'Sam dodajesz pytania: tekst, wybór, skala, tak/nie.' },
          { id: 'feedback' as const, title: 'Opinia o współpracy', text: 'Gotowy zestaw: ocena, plusy, minusy, rekomendacja.' },
          { id: '360' as const, title: 'Szablon ewaluacji 360°', text: 'Ten sam silnik co ankieta Krzysztofa (4 filary, suwaki).' },
        ]).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTemplate(item.id)}
            className={`text-left p-4 rounded-2xl border cursor-pointer ${
              template === item.id ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="font-bold text-slate-900 text-sm">{item.title}</div>
            <div className="text-xs text-slate-600 mt-1">{item.text}</div>
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-xs font-bold text-slate-700">Tytuł</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          placeholder="np. Satysfakcja ze szkolenia BHP"
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-slate-700">Opis dla respondentów</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm min-h-[90px]"
          placeholder="Krótko: po co ta ankieta i ile zajmuje."
        />
      </label>

      {error && <div className="text-sm text-rose-700">{error}</div>}

      <button
        type="submit"
        disabled={busy}
        className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm disabled:opacity-50"
      >
        {busy ? 'Tworzenie…' : 'Utwórz i edytuj pola'}
      </button>
    </form>
  );
}
