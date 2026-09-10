import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { resolveSurveyQuestions } from '../data/surveyQuestions';
import { SurveyFillView } from '../components/SurveyFillView';
import { GenericFillView } from './GenericFillView';
import { ManagedSurvey } from '../types';
import { fetchSurveyBySlug } from '../utils/cmsApi';
import { fetchResponsesFromServer, fetchTokensFromServer } from '../utils/surveyStorage';

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
    fetchTokensFromServer();
    fetchResponsesFromServer();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center border">
          <h1 className="font-black text-xl">Nie znaleziono ankiety</h1>
          <p className="text-sm text-slate-600 mt-2">{error}</p>
          <Link to="/cms" className="inline-block mt-4 text-sm font-bold text-indigo-700">Przejdź do panelu CMS</Link>
        </div>
      </div>
    );
  }

  if (!survey) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-500">Wczytywanie ankiety…</div>;
  }

  if (survey.status === 'draft' || survey.archived) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center border text-sm">
          {survey.archived ? 'Ta ankieta jest zarchiwizowana i nie przyjmuje odpowiedzi.' : 'Ta ankieta jest jeszcze szkicem i nie przyjmuje odpowiedzi.'}
        </div>
      </div>
    );
  }

  if (survey.status === 'closed') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center border text-sm">Ta ankieta jest zamknięta.</div>
      </div>
    );
  }

  const questions = resolveSurveyQuestions(survey);
  if (questions.length > 0) {
    return (
      <div className="min-h-screen bg-slate-100/90">
        <SurveyFillView
          questions={questions}
          prefilledToken={token}
          surveyId={survey.id}
          heading={survey.title}
          intro={survey.description}
          onCompleted={() => {
            fetchResponsesFromServer(survey.id);
          }}
        />
      </div>
    );
  }

  return <GenericFillView survey={survey} token={token || 'PREVIEW'} />;
}
