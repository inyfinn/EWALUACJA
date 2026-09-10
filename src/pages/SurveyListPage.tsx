import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Copy, ExternalLink, FileEdit, Link2, Plus } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { deleteSurveyApi, duplicateSurveyApi, fetchSurveys, setSurveyStatusApi } from '../utils/cmsApi';
import { fillUrl } from '../utils/routerBase';
import { SurveyStatusBar } from '../components/SurveyStatusBar';
import { HintTooltip } from '../components/HintTooltip';

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-dk-ink">Ankiety</h2>
        </div>
        <HintTooltip text="Otwiera kreator nowej ankiety: nazwa, szablon i zapis.">
          <Link to="/cms/new" className="btn-dk-primary text-sm py-2.5 sm:hidden">
            <Plus className="w-4 h-4" /> Nowa ankieta
          </Link>
        </HintTooltip>
      </div>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>
      )}

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <article
            key={survey.id}
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/cms/surveys/${survey.id}/edit`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/cms/surveys/${survey.id}/edit`);
              }
            }}
            className="bg-white rounded-3xl border border-dk-violet-soft p-5 sm:p-6 cursor-pointer hover:border-dk-violet/40 hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-dk-ink text-lg truncate">{survey.title}</h3>
                  <SurveyStatusBar
                    survey={survey}
                    onPublish={async () => { await setSurveyStatusApi(survey.id, 'live'); await load(); }}
                    onPause={async () => { await setSurveyStatusApi(survey.id, 'closed'); await load(); }}
                    onDelete={() => handleDelete(survey)}
                  />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dk-violet-soft text-dk-violet-text">
                    {engineLabel(survey)}
                  </span>
                </div>
                <p className="text-xs text-dk-ink/70">{survey.description || 'Brak opisu'}</p>
                <p className="text-[11px] font-mono text-dk-violet/60 mt-2 break-all">{fillUrl(survey.slug)}</p>
              </div>
              <div
                className="flex flex-wrap gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <HintTooltip text="Edycja pytań, opisu i statusu tej ankiety.">
                  <button type="button" onClick={() => navigate(`/cms/surveys/${survey.id}/edit`)} className="btn-dk-primary">
                    <FileEdit className="w-3.5 h-3.5" /> Edytuj treść
                  </button>
                </HintTooltip>
                <HintTooltip text="Unikalne linki dla osób wypełniających, kopiowanie zaproszeń i test wypełnienia.">
                  <button type="button" onClick={() => navigate(`/cms/surveys/${survey.id}/links`)} className="btn-dk-soft">
                    <Link2 className="w-3.5 h-3.5" /> Zarządzaj
                  </button>
                </HintTooltip>
                <HintTooltip text="Raport i lista odpowiedzi zapisanych na serwerze.">
                  <button type="button" onClick={() => navigate(`/cms/surveys/${survey.id}/results`)} className="btn-dk-soft">
                    <BarChart3 className="w-3.5 h-3.5" /> Wyniki
                  </button>
                </HintTooltip>
                <HintTooltip text="Tworzy kopię ankiety z tymi samymi pytaniami, bez dotychczasowych odpowiedzi.">
                  <button type="button" onClick={() => handleDuplicate(survey)} className="btn-dk-ghost">
                    <Copy className="w-3.5 h-3.5" /> Duplikuj
                  </button>
                </HintTooltip>
                <HintTooltip text="Otwiera publiczny formularz. Bez kodu w adresie nikt nie wyśle odpowiedzi.">
                  <a href={fillUrl(survey.slug)} className="btn-dk-ghost">
                    <ExternalLink className="w-3.5 h-3.5" /> Wypełnij
                  </a>
                </HintTooltip>
              </div>
            </div>
          </article>
        ))}
        {surveys.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-dk-violet-soft p-10 text-center text-dk-ink/50 text-sm">
            Nie ma jeszcze ankiet.
          </div>
        )}
      </div>
    </div>
  );
}
