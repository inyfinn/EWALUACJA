import { useEffect, useState, ReactNode } from 'react';
import { NavLink, Outlet, useParams, Link, useNavigate } from 'react-router-dom';
import { BarChart3, ExternalLink, FileEdit, Link2 } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { deleteSurveyApi, fetchSurvey, setSurveyStatusApi } from '../utils/cmsApi';
import { fillUrl } from '../utils/routerBase';
import { SurveyStatusBar } from '../components/SurveyStatusBar';
import { HintTooltip } from '../components/HintTooltip';

export function SurveyWorkspace() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<ManagedSurvey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    if (!surveyId) return;
    try {
      setSurvey(await fetchSurvey(surveyId));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    reload();
  }, [surveyId]);

  if (error) {
    return <div className="text-rose-700 text-sm bg-rose-50 border border-rose-200 rounded-xl p-4">{error}</div>;
  }
  if (!survey) {
    return <div className="text-slate-500 text-sm">Wczytywanie ankiety…</div>;
  }

  const tab = (to: string, label: string, icon: ReactNode, hint: string) => (
    <HintTooltip text={hint}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `py-2 px-4 text-xs font-medium rounded-full flex items-center gap-2 whitespace-nowrap ${
            isActive ? 'bg-dk-violet-soft text-dk-violet-text' : 'text-dk-ink/70 hover:bg-white'
          }`
        }
      >
        {icon}
        {label}
      </NavLink>
    </HintTooltip>
  );

  return (
    <div className="space-y-5">
      <div>
        <HintTooltip text="Wraca do listy wszystkich ankiet w Twoim panelu.">
          <Link to="/cms" className="text-xs font-medium text-dk-violet-text hover:underline">← Wszystkie ankiety</Link>
        </HintTooltip>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight break-words min-w-0">{survey.title}</h2>
          <SurveyStatusBar
            survey={survey}
            onPublish={async () => { await setSurveyStatusApi(survey.id, 'live'); await reload(); }}
            onPause={async () => { await setSurveyStatusApi(survey.id, 'closed'); await reload(); }}
            onDelete={async () => {
              await deleteSurveyApi(survey.id);
              navigate('/cms');
            }}
          />
        </div>
        <p className="text-xs text-slate-500 font-mono mt-1 break-all">{fillUrl(survey.slug)}</p>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tab('edit', 'Treść ankiety', <FileEdit className="w-4 h-4" />, 'Pytania, opis i ustawienia tej ankiety.')}
        {tab('links', 'Zarządzaj', <Link2 className="w-4 h-4" />, 'Osoby z dostępem do panelu, unikalne linki ankietowanych i status wypełnień.')}
        {tab('results', 'Wyniki', <BarChart3 className="w-4 h-4" />, 'Raport zbiorczy i poszczególne odpowiedzi.')}
        <HintTooltip text="Otwiera ankietę tak, jak widzi ją osoba wypełniająca. To tylko podgląd: wynik się nie zapisze. Prawdziwe odpowiedzi zbierasz unikalnym linkiem z zakładki Zarządzaj.">
          <a
            href={fillUrl(survey.slug, 'PODGLAD')}
            target="_blank"
            className="py-2 px-4 text-xs font-medium rounded-full flex items-center gap-2 text-dk-ink/70 hover:bg-white"
          >
            <ExternalLink className="w-4 h-4" /> Podgląd formularza
          </a>
        </HintTooltip>
      </div>
      <Outlet context={{ survey, reload }} />
    </div>
  );
}
