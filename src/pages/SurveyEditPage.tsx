import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ManagedSurvey, SurveyField, SurveyQuestion } from '../types';
import { createTemplateApi, updateSurveyApi } from '../utils/cmsApi';
import { LiveSurveyEditor } from '../components/LiveSurveyEditor';
import { EvalQuestionsEditor } from '../components/EvalQuestionsEditor';
import { resolveSurveyQuestions } from '../data/surveyQuestions';
import { HintTooltip } from '../components/HintTooltip';

export function SurveyEditPage() {
  const { survey, reload } = useOutletContext<{ survey: ManagedSurvey; reload: () => Promise<void> }>();
  const [title, setTitle] = useState(survey.title);
  const [description, setDescription] = useState(survey.description);
  const [slug, setSlug] = useState(survey.slug);
  const [status, setStatus] = useState(survey.status);
  const [fields, setFields] = useState<SurveyField[]>(survey.fields || []);
  const [questions, setQuestions] = useState<SurveyQuestion[]>(() => resolveSurveyQuestions(survey));
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(survey.title);
    setDescription(survey.description);
    setSlug(survey.slug);
    setStatus(survey.status);
    setFields(survey.fields || []);
    setQuestions(resolveSurveyQuestions(survey));
  }, [survey.id, survey.updatedAt]);

  const named = title.trim().length >= 2;

  const saveAsTemplate = async (visibility: 'global' | 'private') => {
    setBusy(true);
    try {
      await updateSurveyApi(survey.id, { title, description, slug, status, fields, questions });
      await createTemplateApi({ visibility, surveyId: survey.id, title: title.trim() });
      setStatusMsg(visibility === 'global' ? 'Zapisano szablon globalny (wszyscy mogą z niego korzystać).' : 'Zapisano szablon prywatny (tylko ten panel).');
      await reload();
    } catch (e: any) {
      setStatusMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!named) {
      setStatusMsg('Wpisz nazwę ankiety, zanim zapiszesz.');
      return;
    }
    setBusy(true);
    try {
      await updateSurveyApi(survey.id, { title, description, slug, status, fields, questions });
      setStatusMsg('Zapisano na serwerze.');
      await reload();
    } catch (e: any) {
      setStatusMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-dk-violet-soft p-5 space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-dk-violet-text">Nazwa ankiety</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-dk-violet-soft px-3 py-2 text-sm font-semibold text-dk-ink"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-dk-violet-text">Opis</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-2xl border border-dk-violet-soft px-3 py-2 text-sm min-h-[80px]" />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-dk-violet-text">Adres (/s/…)</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full rounded-2xl border border-dk-violet-soft px-3 py-2 text-sm font-mono" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-dk-violet-text">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 w-full rounded-2xl border border-dk-violet-soft px-3 py-2 text-sm"
            >
              <option value="live">Opublikowana</option>
              <option value="draft">Szkic</option>
              <option value="closed">Wstrzymana</option>
            </select>
          </label>
        </div>
      </div>

      <EvalQuestionsEditor questions={questions} onChange={setQuestions} />

      <div>
        <h3 className="font-semibold text-base mb-3">Dodatkowe pola</h3>
        <LiveSurveyEditor fields={fields} onChange={setFields} />
      </div>

      <div className="flex flex-wrap gap-2">
        <HintTooltip text="Zapisuje nazwę, opis, adres i pytania na serwerze.">
          <button type="button" onClick={save} disabled={busy || !named} className="btn-dk-primary px-6 py-3 text-sm disabled:opacity-40">
            {busy ? 'Zapisywanie…' : named ? 'Zapisz ankietę' : 'Wpisz nazwę, żeby zapisać'}
          </button>
        </HintTooltip>
        <HintTooltip text="Udostępnia ten zestaw pytań wszystkim panelom jako szablon startowy.">
          <button type="button" onClick={() => saveAsTemplate('global')} disabled={busy || !named} className="btn-dk-ghost px-4 py-3 text-sm disabled:opacity-40">
            Utwórz szablon globalny
          </button>
        </HintTooltip>
        <HintTooltip text="Zapisuje szablon tylko dla Twojego panelu. Inne osoby go nie zobaczą.">
          <button type="button" onClick={() => saveAsTemplate('private')} disabled={busy || !named} className="btn-dk-soft px-4 py-3 text-sm disabled:opacity-40">
            Utwórz szablon prywatny
          </button>
        </HintTooltip>
      </div>
      {statusMsg && <p className="text-xs font-semibold text-dk-ink">{statusMsg}</p>}
    </div>
  );
}
