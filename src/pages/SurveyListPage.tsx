import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Copy, ExternalLink, FileEdit, Link2, Plus, Trash2 } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { deleteSurveyApi, duplicateSurveyApi, fetchSurveys } from '../utils/cmsApi';
import { fillUrl } from '../utils/routerBase';
import { CmsHomeHint } from './CmsLayout';

function engineLabel(survey: ManagedSurvey) {
  if (survey.engine === '360') return 'Ewaluacja pracownika';
  if (survey.subject === 'company') return 'Firma / kontrahent';
  if (survey.subject === 'printshop') return 'Drukarnia';
  if (survey.subject === 'workplace') return 'Miejsce pracy';
  return 'Własne pytania';
}

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

  useEffect(() => { load(); }, []);

  const handleDelete = async (survey: ManagedSurvey) => {
    if (!window.confirm(`Przenieść „${survey.title}” do kosza (wraz z odpowiedziami)?`)) return;
    try {
      await deleteSurveyApi(survey.id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDuplicate = async (survey: ManagedSurvey) => {
    try {
      const copy = await duplicateSurveyApi(survey.id);
      navigate(`/cms/surveys/${copy.id}/edit`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <CmsHomeHint />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-dk-ink">Ankiety</h2>
          <p className="text-sm text-dk-ink/70 mt-1">
            Twórz formularze, edytuj na żywo, publikuj linki i zbieraj wyniki na Synology.
          </p>
        </div>
        <Link to="/cms/new" className="btn-dk-primary text-sm py-2.5">
          <Plus className="w-4 h-4" /> Nowa ankieta
        </Link>
      </div>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>
      )}

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <article key={survey.id} className="bg-white rounded-3xl border border-dk-violet-soft p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-extrabold text-dk-ink text-lg truncate">{survey.title}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    survey.archived ? 'bg-amber-100 text-amber-800' :
                    survey.status === 'live' ? 'bg-green-100 text-green-800' :
                    survey.status === 'draft' ? 'bg-dk-violet-soft text-dk-violet-text' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {survey.archived ? 'Zarchiwizowana' : survey.status === 'live' ? 'Opublikowana' : survey.status === 'draft' ? 'Szkic' : 'Zamknięta'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dk-violet-soft text-dk-violet-text">
                    {engineLabel(survey)}
                  </span>
                </div>
                <p className="text-xs text-dk-ink/70">{survey.description || 'Brak opisu'}</p>
                <p className="text-[11px] font-mono text-dk-violet/60 mt-2 break-all">{fillUrl(survey.slug)}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button type="button" onClick={() => navigate(`/cms/surveys/${survey.id}/edit`)} className="btn-dk-primary">
                  <FileEdit className="w-3.5 h-3.5" /> Edytuj treść
                </button>
                <button type="button" onClick={() => navigate(`/cms/surveys/${survey.id}/links`)} className="btn-dk-soft">
                  <Link2 className="w-3.5 h-3.5" /> Linki
                </button>
                <button type="button" onClick={() => navigate(`/cms/surveys/${survey.id}/results`)} className="btn-dk-soft">
                  <BarChart3 className="w-3.5 h-3.5" /> Wyniki
                </button>
                <button type="button" onClick={() => handleDuplicate(survey)} className="btn-dk-ghost">
                  <Copy className="w-3.5 h-3.5" /> Duplikuj
                </button>
                <a href={fillUrl(survey.slug)} className="btn-dk-ghost">
                  <ExternalLink className="w-3.5 h-3.5" /> Wypełnij
                </a>
                <button type="button" onClick={() => handleDelete(survey)} className="btn-dk-danger">
                  <Trash2 className="w-3.5 h-3.5" /> Do kosza
                </button>
              </div>
            </div>
          </article>
        ))}
        {surveys.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-dk-violet-soft p-10 text-center text-dk-ink/50 text-sm">
            Nie ma jeszcze ankiet. Kliknij „Nowa ankieta”.
          </div>
        )}
      </div>
    </div>
  );
}
