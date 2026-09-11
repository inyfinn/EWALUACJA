import { Pause, Play, Trash2 } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { HintTooltip } from './HintTooltip';
import { ConfirmPopover } from './ConfirmPopover';

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
  onDelete: () => void | Promise<void>;
}

export function SurveyStatusBar({ survey, onPublish, onPause, onDelete }: Props) {
  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <span className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${statusClass(survey)}`}>
        {statusLabel(survey)}
      </span>
      {survey.status !== 'live' && (
        <HintTooltip text="Udostępnia ankietę. Osoby z unikalnym linkiem mogą ją wypełnić.">
          <button type="button" className="btn-dk-primary !px-2.5 !py-1" onClick={onPublish}>
            <Play className="w-3 h-3" /> Publikuj
          </button>
        </HintTooltip>
      )}
      {survey.status === 'live' && (
        <HintTooltip text="Zatrzymuje zbieranie. Linki zostają, ale nikt nie wyśle nowej odpowiedzi.">
          <button type="button" className="btn-dk-ghost !px-2.5 !py-1" onClick={onPause}>
            <Pause className="w-3 h-3" /> Wstrzymaj
          </button>
        </HintTooltip>
      )}
      <HintTooltip text="Przenosi ankietę i jej odpowiedzi do kosza. Da się je potem przywrócić.">
        <ConfirmPopover
          message={`Przenieść „${survey.title}” do kosza (wraz z odpowiedziami)? Da się potem przywrócić.`}
          confirmLabel="Do kosza"
          onConfirm={onDelete}
        >
          <button type="button" className="btn-dk-danger !px-2.5 !py-1">
            <Trash2 className="w-3 h-3" /> Usuń
          </button>
        </ConfirmPopover>
      </HintTooltip>
    </div>
  );
}
