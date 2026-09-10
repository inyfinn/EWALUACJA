import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ManagedSurvey, SurveyField, SurveyFieldType } from '../types';
import { newField, updateSurveyApi } from '../utils/cmsApi';

const FIELD_TYPES: { id: SurveyFieldType; label: string }[] = [
  { id: 'short_text', label: 'Krótki tekst' },
  { id: 'long_text', label: 'Długi tekst' },
  { id: 'single_choice', label: 'Jednokrotny wybór' },
  { id: 'multi_choice', label: 'Wielokrotny wybór' },
  { id: 'scale', label: 'Skala liczbowa' },
  { id: 'yes_no', label: 'Tak / Nie' },
  { id: 'number', label: 'Liczba' },
];

export function SurveyEditPage() {
  const { survey, reload } = useOutletContext<{ survey: ManagedSurvey; reload: () => Promise<void> }>();
  const [title, setTitle] = useState(survey.title);
  const [description, setDescription] = useState(survey.description);
  const [slug, setSlug] = useState(survey.slug);
  const [status, setStatus] = useState(survey.status);
  const [fields, setFields] = useState<SurveyField[]>(survey.fields || []);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateSurveyApi(survey.id, { title, description, slug, status, fields });
      setStatusMsg('Zapisano na serwerze Synology.');
      await reload();
    } catch (e: any) {
      setStatusMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const updateField = (id: string, patch: Partial<SurveyField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const move = (index: number, dir: -1 | 1) => {
    setFields((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
        <label className="block">
          <span className="text-xs font-bold">Tytuł ankiety</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-bold">Opis</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]" />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold">Slug w adresie (/s/…)</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono" />
          </label>
          <label className="block">
            <span className="text-xs font-bold">Status publikacji</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="live">Opublikowana (można wypełniać)</option>
              <option value="draft">Szkic</option>
              <option value="closed">Zamknięta</option>
            </select>
          </label>
        </div>
      </div>

      {survey.engine === '360' ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-5 text-sm text-indigo-950">
          To ankieta w silniku 360° (4 filary, suwaki, czynniki behawioralne). Tytuł, opis i linki edytujesz tutaj.
          Dodatkowe pola własne poniżej pojawią się na końcu formularza wypełniania.
        </div>
      ) : null}

      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-extrabold">Pola formularza</h3>
          <div className="flex flex-wrap gap-1.5">
            {FIELD_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFields((prev) => [...prev, newField(t.id)])}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer"
              >
                + {t.label}
              </button>
            ))}
          </div>
        </div>

        {fields.length === 0 && (
          <p className="text-xs text-slate-500">Brak własnych pól. Kliknij typ pytania powyżej.</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase text-slate-400">
                {FIELD_TYPES.find((t) => t.id === field.type)?.label}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(index, -1)} className="p-1.5 rounded-lg hover:bg-white cursor-pointer"><ChevronUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => move(index, 1)} className="p-1.5 rounded-lg hover:bg-white cursor-pointer"><ChevronDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setFields((prev) => prev.filter((f) => f.id !== field.id))} className="p-1.5 rounded-lg text-rose-600 hover:bg-white cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <input
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
            />
            <input
              value={field.help || ''}
              onChange={(e) => updateField(field.id, { help: e.target.value })}
              placeholder="Podpowiedź (opcjonalnie)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} />
              Wymagane
            </label>
            {(field.type === 'single_choice' || field.type === 'multi_choice') && (
              <textarea
                value={(field.options || []).join('\n')}
                onChange={(e) => updateField(field.id, { options: e.target.value.split('\n').filter(Boolean) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono min-h-[80px]"
                placeholder={'Jedna opcja w wierszu'}
              />
            )}
            {field.type === 'scale' && (
              <div className="flex gap-3 text-xs">
                <label>Min <input type="number" className="ml-1 w-16 rounded-lg border px-2 py-1" value={field.scaleMin ?? 1} onChange={(e) => updateField(field.id, { scaleMin: Number(e.target.value) })} /></label>
                <label>Max <input type="number" className="ml-1 w-16 rounded-lg border px-2 py-1" value={field.scaleMax ?? 10} onChange={(e) => updateField(field.id, { scaleMax: Number(e.target.value) })} /></label>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={save} disabled={busy} className="px-5 py-3 rounded-2xl bg-emerald-700 text-white font-bold text-sm disabled:opacity-50">
        {busy ? 'Zapisywanie…' : 'Zapisz ankietę'}
      </button>
      {statusMsg && <p className="text-xs font-semibold text-slate-600">{statusMsg}</p>}
    </div>
  );
}
