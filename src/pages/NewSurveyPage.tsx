import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SURVEY_TEMPLATES, templateToDraft } from '../data/surveyTemplates';
import { createSurveyApi, duplicateSurveyApi, fetchSurveys } from '../utils/cmsApi';
import { ManagedSurvey } from '../types';

export function NewSurveyPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(SURVEY_TEMPLATES[0].title);
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState<string>(SURVEY_TEMPLATES[0].id);
  const [duplicateFrom, setDuplicateFrom] = useState('');
  const [existing, setExisting] = useState<ManagedSurvey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchSurveys().then(setExisting).catch(() => setExisting([]));
  }, []);

  const named = title.trim().length >= 2;

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
        if (description.trim()) {
          // title already set; description via remaining on copy — editor can change
        }
        navigate(`/cms/surveys/${copy.id}/edit`);
        return;
      }
      const tpl = SURVEY_TEMPLATES.find((t) => t.id === templateId) || SURVEY_TEMPLATES[0];
      const draft = templateToDraft(tpl, title, description);
      const survey = await createSurveyApi({
        title: draft.title!,
        description: draft.description,
        engine: draft.engine,
        status: 'draft',
        fields: draft.fields,
        questions: draft.questions,
        sourceTemplateId: draft.sourceTemplateId,
        subject: draft.subject,
      });
      navigate(`/cms/surveys/${survey.id}/edit`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Nowa ankieta</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Najpierw <strong>nazywasz ankietę</strong> (np. „Ewaluacja Krzysztofa Wieczorka”). Tag po lewej i tak pokazuje, że to ewaluacja pracownika. Potem wybierasz gotowy zestaw pytań
          albo kopiujesz już zapisaną. Na następnym ekranie edytujesz całą treść tak, jak ją widzi respondent, w tym opcje pozytywne, neutralne i negatywne.
        </p>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-5 text-sm text-indigo-950 space-y-2 leading-relaxed">
        <p className="font-semibold">Kolejność - nic nie zgadujesz:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Wpisz nazwę osoby (np. „Ewaluacja Krzysztofa Wieczorka”). Bez tego przycisk na dole jest nieaktywny.</li>
          <li>Wybierz rodzaj ankiety albo „zrób kopię” już zapisanej.</li>
          <li>Otworzy się podgląd na żywo: klikasz w treść pytania i zmieniasz. Opcje dodajesz przyciskiem, nie przecinkami.</li>
          <li>Zapisz. Potem w zakładce Zarządzaj rozsyłasz wypełnianie.</li>
        </ol>
      </div>

      <label className="block bg-white rounded-3xl border border-slate-200 p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">1. Nazwa ankiety (wymagana)</span>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (error) setError(null); }}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
          placeholder="np. Ewaluacja Krzysztofa Wieczorka"
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
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">2. Wybierz rodzaj ankiety albo kopię</p>
        <div className="grid gap-3">
          {SURVEY_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                const prev = SURVEY_TEMPLATES.find((t) => t.id === templateId);
                if (!title.trim() || (prev && title.trim() === prev.title)) {
                  setTitle(tpl.title);
                }
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
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                  Gotowy zestaw
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {tpl.subjectLabel}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-sm">{tpl.title}</div>
              <div className="text-xs text-slate-600 mt-1">{tpl.blurb}</div>
            </button>
          ))}
        </div>
      </div>

      {existing.length > 0 && (
        <label className="block bg-white rounded-3xl border border-slate-200 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Albo duplikuj już zapisaną ankietę</span>
          <p className="text-xs text-slate-500 mt-1 mb-2">
            Jeśli przerobiłeś zestaw i zapisałeś, tu robisz z niego kolejną kopię (np. na następny miesiąc).
          </p>
          <select
            value={duplicateFrom}
            onChange={(e) => setDuplicateFrom(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">Nie kopiuj - użyj zestawu powyżej</option>
            {existing.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </label>
      )}

      {error && <div className="text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}

      <button
        type="submit"
        disabled={busy || !named}
        className="btn-dk-primary px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? 'Tworzenie…' : named ? 'Utwórz i otwórz podgląd na żywo' : 'Wpisz nazwę, żeby iść dalej'}
      </button>
    </form>
  );
}
