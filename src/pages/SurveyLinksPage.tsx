import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TokenManager } from '../components/TokenManager';
import { ManagedSurvey, SurveyResponse, VoterToken } from '../types';
import { fetchResponsesFromServer, fetchTokensFromServer } from '../utils/surveyStorage';

export function SurveyLinksPage() {
  const { survey } = useOutletContext<{ survey: ManagedSurvey }>();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<VoterToken[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);

  const refresh = async () => {
    const [t, r] = await Promise.all([
      fetchTokensFromServer(survey.id),
      fetchResponsesFromServer(survey.id),
    ]);
    setTokens(t);
    setResponses(r);
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [survey.id]);

  return (
    <TokenManager
      tokens={tokens}
      responses={responses}
      surveyId={survey.id}
      surveySlug={survey.slug}
      onTokensUpdated={refresh}
      onSelectTokenToFill={(code) => navigate(`/s/${survey.slug}?token=${encodeURIComponent(code)}`)}
    />
  );
}
