import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ReportDashboard } from '../components/ReportDashboard';
import { resolveSurveyQuestions } from '../data/surveyQuestions';
import { ManagedSurvey, SurveyResponse, VoterToken } from '../types';
import { computeDimensionsAnalytics, fetchResponsesFromServer, fetchTokensFromServer } from '../utils/surveyStorage';

export function SurveyResultsPage() {
  const { survey } = useOutletContext<{ survey: ManagedSurvey }>();
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

  const questions = resolveSurveyQuestions(survey);
  if (questions.length > 0) {
    const stats = computeDimensionsAnalytics(questions, responses);
    return (
      <ReportDashboard
        stats={stats}
        questions={questions}
        responses={responses}
        tokens={tokens}
        onRefreshData={refresh}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-extrabold">Wyniki ({responses.filter(r => !r.excludedFromReport).length})</h3>
        <p className="text-xs text-slate-500 mt-1">Każdy wiersz to jedno wypełnienie zapisane na NAS.</p>
      </div>
      {responses.length === 0 ? (
        <p className="p-8 text-sm text-slate-500">Nikt jeszcze nie wypełnił tej ankiety.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3 font-bold">Data</th>
                <th className="p-3 font-bold">Kod</th>
                {survey.fields.map((f) => (
                  <th key={f.id} className="p-3 font-bold whitespace-nowrap">{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="p-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString('pl-PL')}</td>
                  <td className="p-3 font-mono">{r.tokenUsed}</td>
                  {survey.fields.map((f) => {
                    const val = r.answers?.[f.id];
                    const text = Array.isArray(val) ? val.join(', ') : val == null ? '—' : String(val);
                    return <td key={f.id} className="p-3 max-w-xs truncate">{text}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
