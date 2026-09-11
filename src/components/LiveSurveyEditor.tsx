import { SurveyField, SurveyFieldType } from '../types';
import { newField } from '../utils/cmsApi';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { HintTooltip } from './HintTooltip';

const FIELD_TYPES: { id: SurveyFieldType; label: string; hint: string }[] = [
  { id: 'short_text', label: 'Krótka odpowiedź', hint: 'Jedna linia, np. nazwa firmy' },
  { id: 'long_text', label: 'Dłuższy komentarz', hint: 'Kilka zdań od respondenta' },
  { id: 'single_choice', label: 'Wybór jednej opcji', hint: 'Kółka — respondent klika jedną' },
  { id: 'multi_choice', label: 'Wybór wielu opcji', hint: 'Ptaszki — można zaznaczyć kilka' },
  { id: 'scale', label: 'Suwak / ocena', hint: 'Liczba od–do, jak w ewaluacji pracownika' },
  { id: 'yes_no', label: 'Tak albo nie', hint: 'Dwa przyciski' },
  { id: 'number', label: 'Liczba', hint: 'Np. liczba zleceń' },
];

interface Props {
  fields: SurveyField[];
  onChange: (fields: SurveyField[]) => void;
}

export function LiveSurveyEditor({ fields, onChange }: Props) {
  const update = (id: string, patch: Partial<SurveyField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

  const addOption = (field: SurveyField) => {
    const options = [...(field.options || []), 'Nowa opcja'];
    update(field.id, { options });
  };

  return (
    <div className="space-y-4">
      <div className="bg-dk-violet-soft text-dk-ink rounded-3xl p-5">
        <h3 className="font-semibold text-base">Jak to działa: bez przecinków i surowych pól</h3>
        <ol className="mt-3 space-y-2 text-sm text-dk-ink/80 list-decimal list-inside leading-relaxed">
          <li>Poniżej widzisz ankietę <strong>tak, jak zobaczy ją respondent</strong>.</li>
          <li>Kliknij w tytuł pytania i po prostu go przepisz.</li>
          <li>Opcje wyboru to osobne przyciski — nie wpisujesz ich w jednym polu. Kliknij „Dodaj opcję”, a zbędną skasuj krzyżykiem.</li>
          <li>Nowe pytanie dodajesz przyciskiem na dole. Od razu pojawia się w podglądzie.</li>
        </ol>
      </div>

      {fields.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center text-sm text-slate-500">
          Ta ankieta nie ma jeszcze pytań. Dodaj pierwsze poniżej — od razu zobaczysz, jak będzie wyglądać.
        </div>
      )}

      {fields.map((field, index) => (
        <article key={field.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {FIELD_TYPES.find((t) => t.id === field.type)?.label}
            </span>
            <div className="flex items-center gap-1">
              <HintTooltip text="Przesuwa to pytanie wyżej na liście.">
                <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => move(index, -1)}><ChevronUp className="w-4 h-4" /></button>
              </HintTooltip>
              <HintTooltip text="Przesuwa to pytanie niżej na liście.">
                <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => move(index, 1)}><ChevronDown className="w-4 h-4" /></button>
              </HintTooltip>
              <HintTooltip text="Usuwa to pytanie z ankiety.">
                <button type="button" className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer" onClick={() => onChange(fields.filter((f) => f.id !== field.id))}><Trash2 className="w-4 h-4" /></button>
              </HintTooltip>
            </div>
          </div>

          <input
            value={field.label}
            onChange={(e) => update(field.id, { label: e.target.value })}
            className="w-full text-base font-black text-slate-900 bg-transparent border-b border-transparent focus:border-indigo-400 outline-none py-1"
          />
          <input
            value={field.help || ''}
            onChange={(e) => update(field.id, { help: e.target.value })}
            placeholder="Podpowiedź pod pytaniem (opcjonalnie) — kliknij, żeby dopisać"
            className="w-full text-xs text-slate-500 bg-transparent outline-none"
          />

          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
            <input type="checkbox" checked={field.required} onChange={(e) => update(field.id, { required: e.target.checked })} />
            Wymagane (gwiazdka)
          </label>

          {field.type === 'short_text' && (
            <input disabled placeholder="Tak będzie wyglądać krótka odpowiedź" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50" />
          )}
          {field.type === 'long_text' && (
            <textarea disabled placeholder="Tak będzie wyglądać dłuższy komentarz" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 min-h-[80px]" />
          )}
          {field.type === 'number' && (
            <input disabled type="number" placeholder="0" className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50" />
          )}
          {field.type === 'yes_no' && (
            <div className="flex gap-2">
              <span className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold">Tak</span>
              <span className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold">Nie</span>
            </div>
          )}
          {field.type === 'scale' && (
            <div className="space-y-2">
              <input type="range" disabled min={field.scaleMin ?? 1} max={field.scaleMax ?? 11} className="w-full" />
              <div className="flex gap-3 text-xs font-bold text-slate-600">
                <label>Od <input type="number" className="ml-1 w-16 rounded-lg border px-2 py-1" value={field.scaleMin ?? 1} onChange={(e) => update(field.id, { scaleMin: Number(e.target.value) })} /></label>
                <label>Do <input type="number" className="ml-1 w-16 rounded-lg border px-2 py-1" value={field.scaleMax ?? 11} onChange={(e) => update(field.id, { scaleMax: Number(e.target.value) })} /></label>
              </div>
            </div>
          )}
          {(field.type === 'single_choice' || field.type === 'multi_choice') && (
            <div className="space-y-2">
              {(field.options || []).map((opt, oi) => (
                <div key={`${field.id}-${oi}`} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-slate-400 shrink-0" />
                  <input
                    value={opt}
                    onChange={(e) => {
                      const options = [...(field.options || [])];
                      options[oi] = e.target.value;
                      update(field.id, { options });
                    }}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
                  />
                  <HintTooltip text="Kasuje tę jedną odpowiedź do wyboru.">
                    <button
                      type="button"
                      className="text-rose-600 text-xs font-bold cursor-pointer"
                      onClick={() => update(field.id, { options: (field.options || []).filter((_, i) => i !== oi) })}
                    >
                      Usuń
                    </button>
                  </HintTooltip>
                </div>
              ))}
              <HintTooltip text="Dopisuje kolejną pozycję na liście do wyboru. Każda osobno, nie przecinkami.">
                <button type="button" onClick={() => addOption(field)} className="text-xs font-bold text-indigo-700 cursor-pointer">
                  + Dodaj opcję (osobny przycisk, nie przecinek)
                </button>
              </HintTooltip>
            </div>
          )}
        </article>
      ))}

      <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-4">
        <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Dodaj pytanie — od razu widać je powyżej</p>
        <div className="flex flex-wrap gap-2">
          {FIELD_TYPES.map((t) => (
            <span key={t.id} className="inline-flex">
            <HintTooltip text={t.hint}>
              <button
                type="button"
                onClick={() => onChange([...fields, newField(t.id)])}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {t.label}
              </button>
            </HintTooltip>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
