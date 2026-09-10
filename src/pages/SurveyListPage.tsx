import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, ExternalLink, FileEdit, Link2, Plus, Trash2 } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { deleteSurveyApi, fetchSurveys } from '../utils/cmsApi';
import { fillUrl } from '../utils/routerBase';
import { CmsHomeHint } from './CmsLayout';

export function SurveyListPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<ManagedSurvey[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setSurveys(await fetchSurveys());
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Błąd listy ankiet');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (survey: ManagedSurvey) => {
    if (!window.confirm(`Usunąć ankietę „${survey.title}” wraz z linkami i wynikami?`)) return;
    try {
      await deleteSurveyApi(survey.id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <CmsHomeHint />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Ankiety</h2>
          <p className="text-sm text-slate-600 mt-1">
            Twórz formularze, edytuj pola, publikuj linki do wypełniania i zbieraj wyniki na Synology.
          </p>
        </div>
        <Link
          to="/cms/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> Nowa ankieta
        </Link>
      </div>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>
      )}

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <article key={survey.id} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-extrabold text-slate-900 text-lg truncate">{survey.title}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    survey.status === 'live' ? 'bg-emerald-100 text-emerald-800' :
                    survey.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {survey.status === 'live' ? 'Opublikowana' : survey.status === 'draft' ? 'Szkic' : 'Zamknięta'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800">
                    {survey.engine === '360' ? 'Szablon 360°' : 'Pola własne'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{survey.description || 'Brak opisu'}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-2 break-all">{fillUrl(survey.slug)}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/cms/surveys/${survey.id}/edit`)}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5" /> Pola i treść
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/cms/surveys/${survey.id}/links`)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" /> Linki
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/cms/surveys/${survey.id}/results`)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Wyniki
                </button>
                <a
                  href={fillUrl(survey.slug)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Wypełnij
                </a>
                {survey.id !== 'survey_ewaluacja_360' && (
                  <button
                    type="button"
                    onClick={() => handleDelete(survey)}
                    className="px-3 py-2 rounded-xl text-rose-700 bg-rose-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Usuń
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
        {surveys.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500 text-sm">
            Nie ma jeszcze ankiet. Kliknij „Nowa ankieta”.
          </div>
        )}
      </div>
    </div>
  );
}
