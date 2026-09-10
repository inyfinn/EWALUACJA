import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Copy, ExternalLink, FileEdit, Link2, Pause, Play, Plus, Trash2 } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { deleteSurveyApi, duplicateSurveyApi, fetchSurveys, setSurveyStatusApi } from '../utils/cmsApi';
import { fillUrl } from '../utils/routerBase';
import { SurveyStatusBar } from '../components/SurveyStatusBar';
import { HintTooltip } from '../components/HintTooltip';
import { ConfirmPopover } from '../components/ConfirmPopover';

function engineLabel(survey: ManagedSurvey) {
  if (survey.engine === '360') return 'Ewaluacja pracownika';
  if (survey.subject === 'company') return 'Firma / kontrahent';
  if (survey.subject === 'printshop') return 'Drukarnia';
  if (survey.subject === 'workplace') return 'Miejsce pracy';
  return 'Własne pytania';
}

function surveyWord(n: number) {
  if (n === 1) return 'ankietę';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'ankiety';
  return 'ankiet';
}

export function SurveyListPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<ManagedSurvey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const load = async () => {
    try {
      const list = await fetchSurveys();
      setSurveys(list);
      setSelected((ids) => ids.filter((id) => list.some((s) => s.id === id)));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Błąd listy ankiet');
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (survey: ManagedSurvey) => {
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

  const toggleOne = (id: string) => {
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const allSelected = surveys.length > 0 && selected.length === surveys.length;
  const picked = surveys.filter((s) => selected.includes(s.id));

  const bulkDelete = async () => {
    try {
      for (const survey of picked) {
        await deleteSurveyApi(survey.id);
      }
      setSelected([]);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const bulkStatus = async (status: 'live' | 'closed') => {
    try {
      for (const survey of picked) {
        await setSurveyStatusApi(survey.id, status);
      }
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-dk-ink">Ankiety</h2>
          <p className="text-sm text-dk-ink/70 mt-1">
            Twórz formularze, edytuj na żywo, publikuj linki i zbieraj wyniki na Synology.
          </p>
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

      {surveys.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl border border-dk-violet-soft px-3 py-2 sticky top-16 z-20">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-dk-ink cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-dk-violet-soft text-dk-violet accent-dk-violet"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? [] : surveys.map((s) => s.id))}
            />
            Zaznacz wszystkie
          </label>
          {selected.length > 0 && (
            <>
              <span className="text-xs text-dk-ink/60">Zaznaczono {selected.length}</span>
              <HintTooltip text={picked.length === 1 ? 'Otwiera edycję treści zaznaczonej ankiety.' : 'Zaznacz jedną ankietę, żeby edytować treść.'}>
                <button
                  type="button"
                  className="btn-dk-primary !py-1.5 disabled:opacity-40"
                  disabled={picked.length !== 1}
                  onClick={() => picked[0] && navigate(`/cms/surveys/${picked[0].id}/edit`)}
                >
                  <FileEdit className="w-3.5 h-3.5" /> Edytuj
                </button>
              </HintTooltip>
              <HintTooltip text="Ustawia zaznaczone ankiety jako opublikowane.">
                <button type="button" className="btn-dk-soft !py-1.5" onClick={() => void bulkStatus('live')}>
                  <Play className="w-3.5 h-3.5" /> Publikuj
                </button>
              </HintTooltip>
              <HintTooltip text="Wstrzymuje zbieranie na zaznaczonych ankietach.">
                <button type="button" className="btn-dk-ghost !py-1.5" onClick={() => void bulkStatus('closed')}>
                  <Pause className="w-3.5 h-3.5" /> Wstrzymaj
                </button>
              </HintTooltip>
              <HintTooltip text="Przenosi zaznaczone ankiety do kosza.">
                <ConfirmPopover
                  message={`Przenieść ${picked.length} ${surveyWord(picked.length)} do kosza wraz z odpowiedziami?`}
                  confirmLabel="Do kosza"
                  onConfirm={bulkDelete}
                >
                  <button type="button" className="btn-dk-danger !py-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Usuń zaznaczone
                  </button>
                </ConfirmPopover>
              </HintTooltip>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <article
            key={survey.id}
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/cms/surveys/${survey.id}/links`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/cms/surveys/${survey.id}/links`);
              }
            }}
            className={`bg-white rounded-3xl border p-5 sm:p-6 cursor-pointer hover:border-dk-violet/40 hover:shadow-sm transition-shadow ${
              selected.includes(survey.id) ? 'border-dk-violet/50 ring-2 ring-dk-violet/20' : 'border-dk-violet-soft'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0 flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1.5 w-4 h-4 shrink-0 rounded border-dk-violet-soft text-dk-violet accent-dk-violet cursor-pointer"
                  checked={selected.includes(survey.id)}
                  aria-label={`Zaznacz ${survey.title}`}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleOne(survey.id)}
                />
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
                <HintTooltip text="Otwiera ankietę w podglądzie. Wynik się nie zapisze.">
                  <a href={fillUrl(survey.slug, 'PODGLAD')} target="_blank" rel="noreferrer" className="btn-dk-ghost">
                    <ExternalLink className="w-3.5 h-3.5" /> Podgląd
                  </a>
                </HintTooltip>
              </div>
            </div>
          </article>
        ))}
        {surveys.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-dk-violet-soft p-10 text-center text-dk-ink/50 text-sm">
            Nie ma jeszcze ankiet. Kliknij „Nowa ankieta” i wybierz szablon.
          </div>
        )}
      </div>
    </div>
  );
}
