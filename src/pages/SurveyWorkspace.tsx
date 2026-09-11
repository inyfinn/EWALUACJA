import { useEffect, useState, ReactNode } from 'react';
import { NavLink, Outlet, useParams, Link, useNavigate } from 'react-router-dom';
import { BarChart3, ExternalLink, FileEdit, Link2 } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { deleteSurveyApi, fetchSurvey, setSurveyStatusApi } from '../utils/cmsApi';
import { fillUrl } from '../utils/routerBase';
import { SurveyStatusBar } from '../components/SurveyStatusBar';
import { HintTooltip } from '../components/HintTooltip';

function navCardClass(active: boolean) {
  return [
    'flex items-start gap-3 w-full h-full min-h-[5.75rem] text-left rounded-3xl border p-4 transition-all cursor-pointer',
    active
      ? 'bg-white border-dk-violet/45 shadow-sm ring-2 ring-dk-violet/20'
      : 'bg-white border-dk-violet-soft hover:border-dk-violet/40 hover:shadow-sm',
  ].join(' ');
}

function navIconClass(active: boolean) {
  return [
    'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
    active ? 'bg-dk-violet-soft text-dk-violet-text' : 'bg-dk-bg text-dk-ink/70',
  ].join(' ');
}

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

  const tab = (to: string, label: string, blurb: string, icon: ReactNode, hint: string) => (
    <HintTooltip className="w-full h-full" text={hint}>
      <NavLink to={to} className={({ isActive }) => navCardClass(isActive)}>
        {({ isActive }) => (
          <>
            <span className={navIconClass(isActive)}>{icon}</span>
            <span className="min-w-0">
              <span className={`block text-sm font-semibold ${isActive ? 'text-dk-violet-text' : 'text-dk-ink'}`}>
                {label}
              </span>
              <span className="block text-[11px] leading-snug text-dk-ink/60 mt-0.5">{blurb}</span>
            </span>
          </>
        )}
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

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-dk-ink/50 mb-2">
          Przełącz widok tej ankiety
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {tab(
            'edit',
            'Treść ankiety',
            'Pytania, opis i ustawienia',
            <FileEdit className="w-5 h-5" />,
            'Otwiera edycję pytań, opisu i ustawień tej ankiety.',
          )}
          {tab(
            'links',
            'Zarządzaj',
            'Osoby, linki i zaproszenia',
            <Link2 className="w-5 h-5" />,
            'Osoby z dostępem do panelu, unikalne linki ankietowanych i status wypełnień.',
          )}
          {tab(
            'results',
            'Wyniki',
            'Raport i odpowiedzi',
            <BarChart3 className="w-5 h-5" />,
            'Raport zbiorczy i poszczególne odpowiedzi.',
          )}
          <HintTooltip
            className="w-full h-full"
            text="Otwiera ankietę tak, jak widzi ją osoba wypełniająca. To tylko podgląd: wynik się nie zapisze."
          >
            <a
              href={fillUrl(survey.slug, 'PODGLAD')}
              target="_blank"
              rel="opener"
              className={navCardClass(false)}
            >
              <span className={navIconClass(false)}>
                <ExternalLink className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-dk-ink">Podgląd formularza</span>
                <span className="block text-[11px] leading-snug text-dk-ink/60 mt-0.5">
                  Nowa karta, wynik się nie zapisze
                </span>
              </span>
            </a>
          </HintTooltip>
        </div>
      </div>

      <Outlet context={{ survey, reload }} />
    </div>
  );
}
