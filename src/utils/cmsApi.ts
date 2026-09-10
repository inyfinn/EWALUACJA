import { ManagedSurvey, SurveyField, SurveyQuestion, SurveyStatus, SurveySubject, TrashStore } from '../types';
import { apiUrl } from './apiClient';
import { authHeaders } from './authSession';

async function readJson(res: Response) {
  return res.json().catch(() => ({}));
}

export async function loginWithPassword(password: string): Promise<{ token: string; panel: { id: string; name: string } }> {
  const res = await fetch(apiUrl('api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nieprawidłowe hasło.');
  return data;
}

export interface CmsPanel {
  id: string;
  name: string;
}

export async function fetchPanels(): Promise<CmsPanel[]> {
  const res = await fetch(apiUrl('api/panels'), { headers: authHeaders(false) });
  if (!res.ok) throw new Error('Nie udało się pobrać listy osób z panelem.');
  return res.json();
}

export async function createPanelApi(name: string, surveyId?: string): Promise<{
  id: string;
  name: string;
  password: string;
}> {
  const res = await fetch(apiUrl('api/panels'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, surveyId }),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nie udało się utworzyć osoby z panelem.');
  return data;
}

export async function fetchSurveys(): Promise<ManagedSurvey[]> {
  const res = await fetch(apiUrl('api/surveys'), { headers: authHeaders(false) });
  if (!res.ok) throw new Error('Nie udało się pobrać listy ankiet.');
  return res.json();
}

export async function fetchSurvey(id: string): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl(`api/surveys/${id}`), { headers: authHeaders(false) });
  if (!res.ok) throw new Error('Ankieta nie została znaleziona.');
  return res.json();
}

export async function fetchSurveyBySlug(slug: string): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl(`api/surveys/by-slug/${encodeURIComponent(slug)}`));
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nie ma takiej ankiety albo nie jest opublikowana.');
  return data as ManagedSurvey;
}

export async function validateFillToken(
  surveyId: string,
  code: string,
): Promise<{ valid: boolean; used: boolean; label?: string; error?: string; preview?: boolean }> {
  const res = await fetch(apiUrl('api/tokens/validate'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ surveyId, code }),
  });
  const data = await readJson(res);
  if (!res.ok && !data.error) {
    return { valid: false, used: false, error: 'Nie udało się sprawdzić kodu zaproszenia.' };
  }
  return {
    valid: Boolean(data.valid),
    used: Boolean(data.used),
    label: data.label,
    error: data.error,
    preview: Boolean(data.preview),
  };
}

export async function createSurveyApi(payload: Partial<ManagedSurvey> & { title: string }): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl('api/surveys'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nie udało się utworzyć ankiety.');
  return data;
}

export async function updateSurveyApi(id: string, patch: Partial<ManagedSurvey>): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl(`api/surveys/${id}`), {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nie udało się zapisać ankiety.');
  return data;
}

export async function setSurveyStatusApi(id: string, status: SurveyStatus): Promise<ManagedSurvey> {
  return updateSurveyApi(id, { status, archived: false });
}

export async function deleteSurveyApi(id: string): Promise<void> {
  const res = await fetch(apiUrl(`api/surveys/${id}`), { method: 'DELETE', headers: authHeaders(false) });
  if (!res.ok) {
    const data = await readJson(res);
    throw new Error(data.error || 'Nie udało się usunąć ankiety.');
  }
}

export async function duplicateSurveyApi(id: string, title?: string): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl(`api/surveys/${id}/duplicate`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nie udało się skopiować ankiety.');
  return data;
}

export interface CmsTemplate {
  id: string;
  title: string;
  blurb: string;
  visibility: 'global' | 'private';
  ownerId: string;
  subject?: SurveySubject;
  subjectLabel?: string;
  engine: 'generic' | '360';
  description: string;
  fields: SurveyField[];
  questions?: SurveyQuestion[];
  builtin?: boolean;
}

export async function fetchTemplates(): Promise<CmsTemplate[]> {
  const res = await fetch(apiUrl('api/templates'), { headers: authHeaders(false) });
  if (!res.ok) throw new Error('Nie udało się pobrać szablonów.');
  return res.json();
}

export async function createTemplateApi(payload: {
  visibility: 'global' | 'private';
  surveyId?: string;
  title?: string;
}): Promise<CmsTemplate> {
  const res = await fetch(apiUrl('api/templates'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nie udało się zapisać szablonu.');
  return data;
}

export async function fetchTrash(): Promise<TrashStore> {
  const res = await fetch(apiUrl('api/trash'), { headers: authHeaders(false) });
  if (!res.ok) throw new Error('Nie udało się otworzyć kosza.');
  return res.json();
}

export async function restoreSurveyApi(id: string): Promise<void> {
  const res = await fetch(apiUrl(`api/trash/surveys/${id}/restore`), { method: 'POST', headers: authHeaders(false) });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nie udało się przywrócić ankiety.');
}

export async function restoreResponseApi(id: string): Promise<{ message: string; restoredSurveyTemporarily?: boolean }> {
  const res = await fetch(apiUrl(`api/trash/responses/${id}/restore`), { method: 'POST', headers: authHeaders(false) });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.error || 'Nie udało się przywrócić odpowiedzi.');
  return data;
}

export async function emptyTrashSurvey(id: string): Promise<void> {
  await fetch(apiUrl(`api/trash/surveys/${id}`), { method: 'DELETE', headers: authHeaders(false) });
}

export async function emptyTrashResponse(id: string): Promise<void> {
  await fetch(apiUrl(`api/trash/responses/${id}`), { method: 'DELETE', headers: authHeaders(false) });
}

export function newField(type: SurveyField['type'] = 'short_text'): SurveyField {
  return {
    id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    label: type === 'scale' ? 'Ocena (skala)' : 'Nowe pytanie',
    help: '',
    required: true,
    options: type === 'single_choice' || type === 'multi_choice' ? ['Opcja A', 'Opcja B'] : undefined,
    scaleMin: type === 'scale' ? 1 : undefined,
    scaleMax: type === 'scale' ? 11 : undefined,
  };
}
