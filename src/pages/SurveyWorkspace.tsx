import { useEffect, useState, ReactNode } from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { BarChart3, ExternalLink, FileEdit, Link2 } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { fetchSurvey } from '../utils/cmsApi';
import { fillUrl } from '../utils/routerBase';

export function SurveyWorkspace() {
  const { surveyId } = useParams();
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

  const tab = (to: string, label: string, icon: ReactNode) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `py-2 px-4 text-xs font-bold rounded-full flex items-center gap-2 whitespace-nowrap ${
          isActive ? 'bg-dk-violet-soft text-dk-violet-text' : 'text-dk-ink/70 hover:bg-white'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );

  return (
    <div className="space-y-5">
      <div>
        <Link to="/cms" className="text-xs font-bold text-indigo-700 hover:underline">← Wszystkie ankiety</Link>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">{survey.title}</h2>
        <p className="text-xs text-slate-500 font-mono mt-1 break-all">{fillUrl(survey.slug)}</p>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tab('edit', 'Treść ankiety', <FileEdit className="w-4 h-4" />)}
        {tab('links', 'Zarządzaj', <Link2 className="w-4 h-4" />)}
        {tab('results', 'Wyniki', <BarChart3 className="w-4 h-4" />)}
        <a
          href={fillUrl(survey.slug)}
          className="py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-2 text-slate-600 hover:bg-slate-100"
        >
          <ExternalLink className="w-4 h-4" /> Podgląd wypełniania
        </a>
      </div>
      <Outlet context={{ survey, reload }} />
    </div>
  );
}
