import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TokenManager } from '../components/TokenManager';
import { SurveyCollaborators } from '../components/SurveyCollaborators';
import { ManagedSurvey, SurveyResponse, VoterToken } from '../types';
import { fetchResponsesFromServer, fetchTokensFromServer } from '../utils/surveyStorage';

export function SurveyLinksPage() {
  const { survey, reload } = useOutletContext<{ survey: ManagedSurvey; reload: () => Promise<void> }>();
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
    <div className="space-y-6">
      <SurveyCollaborators survey={survey} onUpdated={reload} />
      <TokenManager
        tokens={tokens}
        responses={responses}
        surveyId={survey.id}
        surveySlug={survey.slug}
        onTokensUpdated={refresh}
        onSelectTokenToFill={(code) => navigate(`/s/${survey.slug}?token=${encodeURIComponent(code)}`)}
      />
    </div>
  );
}
