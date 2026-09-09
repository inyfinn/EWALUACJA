import React, { useEffect, useState } from 'react';
import { Plus, FileBarChart, Users, Loader2, Lock, Star, Trash2, ChevronLeft, LayoutGrid } from 'lucide-react';
import { customApi } from '../../customApi';
import { SurveyListItem } from '../../customTypes';

interface Props {
  onOpenBuiltin: () => void;
  onOpenCustom: (id: string) => void;
  onCreate: () => void;
  onBack: () => void;
}

export const SurveyManager: React.FC<Props> = ({ onOpenBuiltin, onOpenCustom, onCreate, onBack }) => {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setSurveys(await customApi.listSurveys());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Usunąć ankietę „${title}" wraz z odpowiedziami? Nieodwracalne.`)) return;
    setBusy(true);
    try { await customApi.deleteSurvey(id); await load(); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100/90">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center"><LayoutGrid className="w-4.5 h-4.5" /></div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm leading-tight">Menedżer Ankiet</div>
              <div className="text-[11px] text-slate-500">System zarządzania ankietami</div>
            </div>
          </div>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" /> Panel Organizatora
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Twoje ankiety</h2>
            <p className="text-sm text-slate-500 mt-1">Otwórz istniejącą ankietę lub utwórz nową z dowolnymi typami pytań.</p>
          </div>
          <button onClick={onCreate} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-2xl cursor-pointer">
            <Plus className="w-4 h-4" /> Nowa ankieta
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {surveys.map((s) => (
              <div
                key={s.id}
                onClick={() => (s.builtIn ? onOpenBuiltin() : onOpenCustom(s.id))}
                className="group bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer relative"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                    {(s.subjectName || s.title).charAt(0).toUpperCase()}
                  </div>
                  {s.builtIn ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3" /> Główna ankieta
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${s.status === 'active' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                      {s.status === 'active' ? 'Aktywna' : 'Wstrzymana'}
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-slate-900 mt-4 leading-tight pr-6">{s.title}</h3>
                {s.companyName && <p className="text-xs text-slate-500 mt-1">{s.companyName}</p>}
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                  {!s.builtIn && (
                    <span className="inline-flex items-center gap-1.5"><FileBarChart className="w-3.5 h-3.5" /> {s.questionsCount ?? 0} pytań</span>
                  )}
                  <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {s.responsesCount} odpowiedzi</span>
                </div>
                {s.builtIn ? (
                  <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Oryginalna ankieta 360° (pełny, dedykowany widok)</p>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(s.id, s.title); }}
                    disabled={busy}
                    className="absolute bottom-4 right-4 p-2 text-slate-300 hover:text-rose-500 cursor-pointer"
                    title="Usuń ankietę"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
