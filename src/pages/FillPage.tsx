import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { resolveSurveyQuestions } from '../data/surveyQuestions';
import { SurveyFillView } from '../components/SurveyFillView';
import { GenericFillView } from './GenericFillView';
import { ManagedSurvey } from '../types';
import { fetchSurveyBySlug } from '../utils/cmsApi';
import { InyfinnCopyright } from '../components/InyfinnCopyright';

function FillShell({ children, className = 'bg-slate-100' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <div className="flex-1">{children}</div>
      <InyfinnCopyright />
    </div>
  );
}

export function FillPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const token = (params.get('token') || params.get('kod') || '').trim().toUpperCase();
  const [survey, setSurvey] = useState<ManagedSurvey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchSurveyBySlug(slug)
      .then(setSurvey)
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <FillShell>
        <div className="flex items-center justify-center p-6 min-h-[70vh]">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center border">
            <h1 className="font-black text-xl">Nie znaleziono ankiety</h1>
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

  if (survey.status === 'closed') {
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
            <h1 className="font-black text-xl">Potrzebny unikalny link</h1>
            <p className="text-sm text-slate-600 mt-2">
              Ankietę wypełnisz tylko z osobistego zaproszenia (adres z kodem). Sam adres ankiety nie wystarczy.
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
      <GenericFillView survey={survey} token={token} />
    </FillShell>
  );
}
