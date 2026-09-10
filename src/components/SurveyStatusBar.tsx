import { Pause, Play, Trash2 } from 'lucide-react';
import { ManagedSurvey } from '../types';

export function statusLabel(survey: ManagedSurvey) {
  if (survey.archived) return 'Zarchiwizowana';
  if (survey.status === 'live') return 'Opublikowana';
  if (survey.status === 'closed') return 'Wstrzymana';
  return 'Szkic';
}

export function statusClass(survey: ManagedSurvey) {
  if (survey.archived) return 'bg-amber-100 text-amber-800';
  if (survey.status === 'live') return 'bg-green-100 text-green-800';
  if (survey.status === 'closed') return 'bg-slate-100 text-slate-600';
  return 'bg-dk-violet-soft text-dk-violet-text';
}

interface Props {
  survey: ManagedSurvey;
  onPublish: () => void;
  onPause: () => void;
  onDelete: () => void;
}

export function SurveyStatusBar({ survey, onPublish, onPause, onDelete }: Props) {
  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <span className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${statusClass(survey)}`}>
        {statusLabel(survey)}
      </span>
      {survey.status !== 'live' && (
        <button type="button" className="btn-dk-primary !px-2.5 !py-1" onClick={onPublish} title="Publikuj">
          <Play className="w-3 h-3" /> Publikuj
        </button>
      )}
      {survey.status === 'live' && (
        <button type="button" className="btn-dk-ghost !px-2.5 !py-1" onClick={onPause} title="Wstrzymaj">
          <Pause className="w-3 h-3" /> Wstrzymaj
        </button>
      )}
      <button type="button" className="btn-dk-danger !px-2.5 !py-1" onClick={onDelete} title="Usuń do kosza">
        <Trash2 className="w-3 h-3" /> Usuń
      </button>
    </div>
  );
}
