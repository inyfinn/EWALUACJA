import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { resolveSurveyQuestions } from '../data/surveyQuestions';
import { SurveyFillView } from '../components/SurveyFillView';
import { GenericFillView } from './GenericFillView';
import { ManagedSurvey } from '../types';
import { fetchSurveyBySlug } from '../utils/cmsApi';
import { InyfinnCopyright } from '../components/InyfinnCopyright';
import { isOrganizerAuthed } from '../utils/authSession';
import { PREVIEW_FILL_TOKEN } from '../utils/routerBase';

function FillShell({ children, className = 'bg-slate-100' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <div className="flex-1">{children}</div>
      <InyfinnCopyright />
    </div>
  );
}

function isPreviewToken(code: string) {
  return code === 'PODGLAD' || code === 'PREVIEW' || code === 'DEMO';
}

export function FillPage() {
  const { slug: rawSlug } = useParams();
  const slug = (rawSlug || '').replace(/\/+$/g, '');
  const [params] = useSearchParams();
  const explicit = (params.get('token') || params.get('kod') || '').trim().toUpperCase();
  const token = explicit || (isOrganizerAuthed() ? PREVIEW_FILL_TOKEN : '');
  const preview = isPreviewToken(token);
  const [survey, setSurvey] = useState<ManagedSurvey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchSurveyBySlug(slug)
      .then(setSurvey)
      .catch((e) => setError(e.message));
  }, [slug]);

  const previewBanner = preview ? (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-950 text-xs sm:text-sm font-medium px-4 py-2.5 text-center">
      To jest podgląd formularza. Odpowiedzi się nie zapiszą. Osoby ankietowane dostają osobny, unikalny link z panelu.
    </div>
  ) : null;

  if (error) {
    return (
      <FillShell>
        <div className="flex items-center justify-center p-6 min-h-[70vh]">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center border">
            <h1 className="font-semibold text-xl">Nie ma takiej ankiety</h1>
            <p className="text-sm text-slate-600 mt-2">{error}</p>
          </div>
        </div>
      </FillShell>
    );
  }

  if (!survey) {
    return (
      <FillShell>
        <div className="flex items-center justify-center min-h-[70vh] text-sm text-slate-500">Wczytywanie ankiety…</div>
      </FillShell>
    );
  }

  if (survey.status === 'draft' || survey.archived) {
    return (
      <FillShell>
        <div className="flex items-center justify-center p-6 min-h-[70vh]">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center border text-sm">
            {survey.archived ? 'Ta ankieta jest zarchiwizowana i nie przyjmuje odpowiedzi.' : 'Ta ankieta jest szkicem i nie przyjmuje odpowiedzi.'}
          </div>
        </div>
      </FillShell>
    );
  }

  if (survey.status === 'closed' && !preview) {
    return (
      <FillShell>
        <div className="flex items-center justify-center p-6 min-h-[70vh]">
            <div className="bg-white rounded-3xl p-8 max-w-md text-center border text-sm">Ta ankieta jest wstrzymana i nie przyjmuje odpowiedzi.</div>
        </div>
      </FillShell>
    );
  }

  if (!token) {
    return (
      <FillShell>
        <div className="flex items-center justify-center p-6 min-h-[70vh]">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center border">
            <h1 className="font-semibold text-xl">Potrzebny osobisty link</h1>
            <p className="text-sm text-slate-600 mt-2">
              Ten adres jest tylko bazą ankiety. Wypełnisz ją z zaproszenia, które ma w adresie swój kod.
            </p>
          </div>
        </div>
      </FillShell>
    );
  }

  const questions = resolveSurveyQuestions(survey);
  if (questions.length > 0) {
    return (
      <FillShell className="bg-slate-100/90">
        {previewBanner}
        <SurveyFillView
          questions={questions}
          prefilledToken={token}
          surveyId={survey.id}
          heading={survey.title}
          intro={survey.description}
          onCompleted={() => undefined}
        />
      </FillShell>
    );
  }

  return (
    <FillShell>
      {previewBanner}
      <GenericFillView survey={survey} token={token} />
    </FillShell>
  );
}
