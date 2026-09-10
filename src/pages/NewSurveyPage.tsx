import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CmsTemplate, createSurveyApi, duplicateSurveyApi, fetchSurveys, fetchTemplates } from '../utils/cmsApi';
import { ManagedSurvey } from '../types';
import { HintTooltip } from '../components/HintTooltip';

export function NewSurveyPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<CmsTemplate[]>([]);
  const [duplicateFrom, setDuplicateFrom] = useState('');
  const [existing, setExisting] = useState<ManagedSurvey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchSurveys().then(setExisting).catch(() => setExisting([]));
    fetchTemplates().then((list) => {
      setTemplates(list);
      if (list[0]) setTemplateId(list[0].id);
    }).catch(() => setTemplates([]));
  }, []);

  const named = title.trim().length >= 2;
  const selected = templates.find((t) => t.id === templateId);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!named) {
      setError('Najpierw wpisz nazwę ankiety. Bez nazwy nie przejdziesz dalej.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (duplicateFrom) {
        const copy = await duplicateSurveyApi(duplicateFrom, title.trim());
        navigate(`/cms/surveys/${copy.id}/edit`);
        return;
      }
      const tpl = selected;
      if (!tpl) {
        setError('Wybierz szablon.');
        return;
      }
      const survey = await createSurveyApi({
        title: title.trim(),
        description: description.trim() || tpl.description,
        engine: tpl.engine,
        status: 'draft',
        fields: tpl.fields,
        questions: tpl.questions || [],
        sourceTemplateId: tpl.id,
        subject: tpl.subject,
      });
      navigate(`/cms/surveys/${survey.id}/edit`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const globalTpl = templates.filter((t) => t.visibility === 'global');
  const privateTpl = templates.filter((t) => t.visibility === 'private');

  return (
    <form onSubmit={handleCreate} className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Nowa ankieta</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Najpierw nazywasz ankietę, potem wybierasz szablon (globalny dla wszystkich albo swój prywatny).
        </p>
      </div>

      <label className="block bg-white rounded-3xl border border-slate-200 p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">1. Nazwa ankiety (wymagana)</span>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (error) setError(null); }}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
          placeholder="np. Ewaluacja Krzysztofa Wieczorka"
          title="Ta nazwa widać na liście i na formularzu. Minimum 2 znaki."
          required
          minLength={2}
        />
      </label>

      <label className="block bg-white rounded-3xl border border-slate-200 p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Opis dla respondenta (opcjonalnie)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm min-h-[80px]"
          placeholder="Jedno-dwa zdania: po co to i że jest anonimowo."
        />
      </label>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">2. Szablon globalny</p>
        <div className="grid gap-3">
          {globalTpl.map((tpl) => (
            <div key={tpl.id}>
            <HintTooltip className="w-full" text={`Szablon dla wszystkich paneli. ${tpl.blurb}`}>
            <button
              type="button"
              onClick={() => {
                if (!title.trim() || (selected && title.trim() === selected.title)) setTitle(tpl.title);
                setTemplateId(tpl.id);
                setDuplicateFrom('');
              }}
              className={`text-left p-4 rounded-2xl border cursor-pointer ${
                templateId === tpl.id && !duplicateFrom
                  ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Globalny
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {tpl.subjectLabel || tpl.engine}
                </span>
              </div>
              <div className="font-semibold text-slate-900 text-sm">{tpl.title}</div>
              <div className="text-xs text-slate-600 mt-1">{tpl.blurb}</div>
            </button>
            </HintTooltip>
            </div>
          ))}
        </div>
      </div>

      {privateTpl.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Twoje szablony prywatne</p>
          <div className="grid gap-3">
            {privateTpl.map((tpl) => (
              <div key={tpl.id}>
              <HintTooltip className="w-full" text={`Szablon tylko w Twoim panelu. ${tpl.blurb}`}>
              <button
                type="button"
                onClick={() => {
                  if (!title.trim() || (selected && title.trim() === selected.title)) setTitle(tpl.title);
                  setTemplateId(tpl.id);
                  setDuplicateFrom('');
                }}
                className={`text-left p-4 rounded-2xl border cursor-pointer ${
                  templateId === tpl.id && !duplicateFrom
                    ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-dk-violet-soft text-dk-violet-text">
                  Prywatny
                </span>
                <div className="font-semibold text-slate-900 text-sm mt-1">{tpl.title}</div>
                <div className="text-xs text-slate-600 mt-1">{tpl.blurb}</div>
              </button>
              </HintTooltip>
              </div>
            ))}
          </div>
        </div>
      )}

      {existing.length > 0 && (
        <label className="block bg-white rounded-3xl border border-slate-200 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Albo duplikuj już zapisaną ankietę</span>
          <select
            value={duplicateFrom}
            onChange={(e) => setDuplicateFrom(e.target.value)}
            title="Zamiast szablonu skopiujesz już istniejącą ankietę i dasz jej nową nazwę."
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">Nie kopiuj - użyj zestawu powyżej</option>
            {existing.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </label>
      )}

      {error && <div className="text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}

      <HintTooltip text="Zapisuje ankietę w Twoim panelu i otwiera edycję treści.">
        <button
          type="submit"
          disabled={busy || !named}
          className="btn-dk-primary px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? 'Tworzenie…' : named ? 'Utwórz i otwórz podgląd na żywo' : 'Wpisz nazwę, żeby iść dalej'}
        </button>
      </HintTooltip>
    </form>
  );
}
