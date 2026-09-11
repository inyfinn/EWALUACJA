import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { ScoreLevelDescription, SurveyQuestion } from '../types';
import { blankEvalQuestion } from '../data/surveyQuestions';
import { HintTooltip } from './HintTooltip';

interface Props {
  questions: SurveyQuestion[];
  onChange: (questions: SurveyQuestion[]) => void;
}

function FactorList({
  title,
  hint,
  tone,
  items,
  onChange,
}: {
  title: string;
  hint: string;
  tone: 'positive' | 'neutral' | 'negative';
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, text]);
    setDraft('');
  };
  const toneClass =
    tone === 'positive' ? 'border-emerald-200 bg-emerald-50' :
    tone === 'neutral' ? 'border-amber-200 bg-amber-50' :
    'border-rose-200 bg-rose-50';

  return (
    <div className={`rounded-2xl border p-3 space-y-2 ${toneClass}`}>
      <div>
        <p className="text-xs font-black uppercase tracking-wider">{title}</p>
        <p className="text-[11px] text-slate-600 mt-0.5">{hint}</p>
      </div>
      {items.map((item, i) => (
        <div key={`${title}-${i}`} className="flex items-start gap-2">
          <textarea
            value={item}
            rows={2}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-xl border border-white/80 bg-white px-3 py-1.5 text-sm"
          />
          <HintTooltip text="Usuwa tę pozycję z listy czynników.">
            <button
              type="button"
              className="text-rose-700 text-[11px] font-bold shrink-0 cursor-pointer"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              Usuń
            </button>
          </HintTooltip>
        </div>
      ))}
      <div className="flex items-start gap-2">
        <textarea
          value={draft}
          rows={2}
          placeholder="Napisz nową opcję i dodaj…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              add();
            }
          }}
          className="flex-1 rounded-xl border border-white/80 bg-white px-3 py-1.5 text-sm"
        />
        <HintTooltip text="Dopisuje nowy czynnik do tej listy (pozytywne, neutralne albo negatywne).">
          <button type="button" onClick={add} className="btn-dk-primary shrink-0 self-end">
            Dodaj
          </button>
        </HintTooltip>
      </div>
    </div>
  );
}

function ScoreList({
  items,
  onChange,
}: {
  items: ScoreLevelDescription[];
  onChange: (next: ScoreLevelDescription[]) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <HintTooltip text="Pokazuje lub ukrywa opisy, które respondent widzi przy każdej liczbie na suwaku.">
        <button type="button" className="text-xs font-bold text-indigo-800 cursor-pointer" onClick={() => setOpen(!open)}>
          {open ? 'Ukryj' : 'Pokaż'} opisy suwaka (1–11) — respondent widzi je przy ocenie
        </button>
      </HintTooltip>
      {open && (
        <div className="mt-3 space-y-2">
          {items.map((row, i) => (
            <div key={row.score} className="grid sm:grid-cols-[48px_1fr] gap-2 items-start">
              <span className="text-xs font-black text-slate-500 pt-2">{row.score}/11</span>
              <div className="space-y-1">
                <input
                  value={row.shortLabel}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...row, shortLabel: e.target.value };
                    onChange(next);
                  }}
                  className="w-full rounded-lg border px-2 py-1 text-xs font-semibold"
                />
                <textarea
                  value={row.summary}
                  rows={2}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...row, summary: e.target.value };
                    onChange(next);
                  }}
                  className="w-full rounded-lg border px-2 py-1 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EvalQuestionsEditor({ questions, onChange }: Props) {
  const update = (index: number, patch: Partial<SurveyQuestion>) => {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-dk-violet-soft p-5">
        <h3 className="font-semibold text-base text-dk-ink">Obszary oceny (suwaki + co wpłynęło)</h3>
        <p className="text-sm text-dk-ink/70 mt-2 leading-relaxed">
          To jest treść, którą widzi respondent: pytania, suwak 1–11 oraz opcje
          <strong> pozytywne / neutralne / negatywne</strong> („co wpłynęło na Twoją ocenę”).
          Każdą pozycję możesz przepisać. Nową dopisujesz ręcznie i klikasz Dodaj.
        </p>
      </div>

      {questions.map((q, index) => (
        <article key={q.id} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              Obszar {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <HintTooltip text="Przesuwa ten obszar oceny wyżej.">
                <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => move(index, -1)}><ChevronUp className="w-4 h-4" /></button>
              </HintTooltip>
              <HintTooltip text="Przesuwa ten obszar oceny niżej.">
                <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => move(index, 1)}><ChevronDown className="w-4 h-4" /></button>
              </HintTooltip>
              <HintTooltip text="Usuwa cały obszar razem z pytaniami i czynnikami.">
                <button type="button" className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer" onClick={() => onChange(questions.filter((_, i) => i !== index))}><Trash2 className="w-4 h-4" /></button>
              </HintTooltip>
            </div>
          </div>

          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">Tytuł obszaru</span>
            <input
              value={q.dimensionTitle}
              onChange={(e) => update(index, { dimensionTitle: e.target.value })}
              className="mt-1 w-full text-lg font-black text-slate-900 bg-transparent border-b border-slate-200 focus:border-indigo-400 outline-none py-1"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">Podtytuł</span>
            <input
              value={q.dimensionSubtitle}
              onChange={(e) => update(index, { dimensionSubtitle: e.target.value })}
              className="mt-1 w-full text-sm text-slate-700 rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">Podpowiedź przy wypełnianiu</span>
            <textarea
              value={q.contextHelp}
              onChange={(e) => update(index, { contextHelp: e.target.value })}
              className="mt-1 w-full text-sm rounded-xl border border-slate-200 px-3 py-2 min-h-[64px]"
            />
          </label>

          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Pytania ze suwakiem</p>
            {q.subQuestions.map((sq, si) => (
              <div key={sq.id} className="rounded-2xl border border-slate-200 p-3 space-y-2 bg-slate-50/80">
                <div className="flex justify-between gap-2">
                  <input
                    value={sq.label}
                    onChange={(e) => {
                      const subQuestions = q.subQuestions.map((s, j) => j === si ? { ...s, label: e.target.value } : s);
                      update(index, { subQuestions });
                    }}
                    className="flex-1 rounded-lg border px-2 py-1 text-xs font-bold"
                  />
                  <HintTooltip text="Usuwa to pytanie ze suwakiem z obszaru.">
                    <button
                      type="button"
                      className="text-[11px] font-bold text-rose-700 cursor-pointer"
                      onClick={() => update(index, { subQuestions: q.subQuestions.filter((_, j) => j !== si) })}
                    >
                      Usuń pytanie
                    </button>
                  </HintTooltip>
                </div>
                <textarea
                  value={sq.text}
                  onChange={(e) => {
                    const subQuestions = q.subQuestions.map((s, j) => j === si ? { ...s, text: e.target.value } : s);
                    update(index, { subQuestions });
                  }}
                  className="w-full rounded-xl border px-3 py-2 text-sm min-h-[64px]"
                />
                <ScoreList
                  items={sq.scoreDescriptions || []}
                  onChange={(scoreDescriptions) => {
                    const subQuestions = q.subQuestions.map((s, j) => j === si ? { ...s, scoreDescriptions } : s);
                    update(index, { subQuestions });
                  }}
                />
              </div>
            ))}
            <HintTooltip text="Dodaje kolejne pytanie ze skalą 1–11 w tym obszarze.">
              <button
                type="button"
                className="text-xs font-bold text-indigo-700 cursor-pointer"
                onClick={() => {
                  const stamp = `${Date.now().toString(36)}`;
                  update(index, {
                    subQuestions: [
                      ...q.subQuestions,
                      { id: `sq_${stamp}`, label: 'Nowe pytanie', text: 'Jak oceniasz…?' },
                    ],
                  });
                }}
              >
                + Dodaj pytanie ze suwakiem
              </button>
            </HintTooltip>
          </div>

          <div className="grid gap-3">
            <FactorList
              title="Pozytywne"
              hint="Widać je, gdy ocena jest wysoka — i zawsze w „inne czynniki”."
              tone="positive"
              items={q.factors.high}
              onChange={(high) => update(index, { factors: { ...q.factors, high } })}
            />
            <FactorList
              title="Neutralne"
              hint="Środkowy zakres oceny — rzeczy do oszlifowania, bez dramatu."
              tone="neutral"
              items={q.factors.mid}
              onChange={(mid) => update(index, { factors: { ...q.factors, mid } })}
            />
            <FactorList
              title="Negatywne"
              hint="Niski zakres — konkretne problemy, które wpłynęły na ocenę."
              tone="negative"
              items={q.factors.low}
              onChange={(low) => update(index, { factors: { ...q.factors, low } })}
            />
          </div>
        </article>
      ))}

      <HintTooltip className="w-full" text="Nowy blok oceny: suwaki oraz czynniki pozytywne, neutralne i negatywne.">
        <button
          type="button"
          onClick={() => onChange([...questions, blankEvalQuestion()])}
          className="w-full rounded-3xl border-2 border-dashed border-dk-violet/40 bg-white py-4 text-sm font-bold text-dk-violet-text hover:bg-dk-violet-soft cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Dodaj obszar oceny (suwaki + pozytywne / neutralne / negatywne)
        </button>
      </HintTooltip>
    </div>
  );
}
