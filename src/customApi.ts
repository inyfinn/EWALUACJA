import { CustomSurvey, CustomQuestion, SurveyListItem, CustomResponse } from './customTypes';
import { VoterToken } from './types';

// API client for the Survey Management System (custom surveys).
// Talks to the same Express backend (server.ts) under /api/surveys.

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data?.error || `Błąd serwera (${res.status})`);
  return data as T;
}

export const customApi = {
  listSurveys: () => req<{ surveys: SurveyListItem[] }>('/surveys').then(d => d.surveys),

  createSurvey: (payload: Partial<CustomSurvey>) =>
    req<{ survey: CustomSurvey }>('/surveys', { method: 'POST', body: JSON.stringify(payload) }).then(d => d.survey),

  getSurvey: (id: string) => req<{ survey: CustomSurvey }>(`/surveys/${id}`).then(d => d.survey),

  getPublicSurvey: (id: string) => req<{ survey: CustomSurvey }>(`/surveys/${id}/public`).then(d => d.survey),

  updateSurvey: (id: string, payload: Partial<CustomSurvey>) =>
    req<{ survey: CustomSurvey }>(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(payload) }).then(d => d.survey),

  deleteSurvey: (id: string) => req<{ success: boolean }>(`/surveys/${id}`, { method: 'DELETE' }),

  listTokens: (id: string) => req<VoterToken[]>(`/surveys/${id}/tokens`),
  createToken: (id: string, label: string) =>
    req<VoterToken>(`/surveys/${id}/tokens`, { method: 'POST', body: JSON.stringify({ label }) }),
  deleteToken: (id: string, tid: string) =>
    req<{ success: boolean }>(`/surveys/${id}/tokens/${tid}`, { method: 'DELETE' }),

  listResponses: (id: string) => req<CustomResponse[]>(`/surveys/${id}/responses`),
  submitResponse: (id: string, payload: Partial<CustomResponse>) =>
    req<{ success: boolean; response: CustomResponse }>(`/surveys/${id}/responses`, {
      method: 'POST', body: JSON.stringify(payload),
    }),
  deleteResponse: (id: string, rid: string) =>
    req<{ success: boolean }>(`/surveys/${id}/responses/${rid}`, { method: 'DELETE' }),
  excludeResponse: (id: string, rid: string, excluded: boolean) =>
    req<{ success: boolean }>(`/surveys/${id}/responses/${rid}/exclude`, {
      method: 'PATCH', body: JSON.stringify({ excluded }),
    }),
};

export function newQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultQuestion(type: CustomQuestion['type']): CustomQuestion {
  const base: CustomQuestion = { id: newQuestionId(), type, title: '', required: false };
  switch (type) {
    case 'slider':
      return { ...base, min: 1, max: 5, minLabel: 'Nisko', maxLabel: 'Wysoko', allowComment: false };
    case 'single_choice':
    case 'multi_choice':
      return { ...base, options: [{ value: 'opcja-1', label: 'Opcja 1' }, { value: 'opcja-2', label: 'Opcja 2' }], allowComment: false };
    case 'yes_no':
      return { ...base, options: [{ value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' }] };
    case 'yes_no_dontknow':
      return { ...base, options: [{ value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' }, { value: 'nie-wiem', label: 'Nie wiem' }] };
    case 'text':
      return { ...base };
    case 'section':
      return { ...base, title: 'Nowa sekcja' };
    default:
      return base;
  }
}
