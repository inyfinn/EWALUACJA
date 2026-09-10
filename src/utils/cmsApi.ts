import { ManagedSurvey, SurveyField, TrashStore } from '../types';
import { apiUrl } from './apiClient';

export async function fetchSurveys(): Promise<ManagedSurvey[]> {
  const res = await fetch(apiUrl('api/surveys'));
  if (!res.ok) throw new Error('Nie udało się pobrać listy ankiet.');
  return res.json();
}

export async function fetchSurvey(id: string): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl(`api/surveys/${id}`));
  if (!res.ok) throw new Error('Ankieta nie została znaleziona.');
  return res.json();
}

export async function fetchSurveyBySlug(slug: string): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl(`api/surveys/by-slug/${encodeURIComponent(slug)}`));
  if (!res.ok) throw new Error('Nie ma takiej ankiety albo nie jest opublikowana.');
  return res.json();
}

export async function createSurveyApi(payload: Partial<ManagedSurvey> & { title: string }): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl('api/surveys'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Nie udało się utworzyć ankiety.');
  return data;
}

export async function updateSurveyApi(id: string, patch: Partial<ManagedSurvey>): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl(`api/surveys/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Nie udało się zapisać ankiety.');
  return data;
}

export async function deleteSurveyApi(id: string): Promise<void> {
  const res = await fetch(apiUrl(`api/surveys/${id}`), { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Nie udało się usunąć ankiety.');
  }
}

export async function duplicateSurveyApi(id: string, title?: string): Promise<ManagedSurvey> {
  const res = await fetch(apiUrl(`api/surveys/${id}/duplicate`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Nie udało się skopiować ankiety.');
  return data;
}

export async function fetchTrash(): Promise<TrashStore> {
  const res = await fetch(apiUrl('api/trash'));
  if (!res.ok) throw new Error('Nie udało się otworzyć kosza.');
  return res.json();
}

export async function restoreSurveyApi(id: string): Promise<void> {
  const res = await fetch(apiUrl(`api/trash/surveys/${id}/restore`), { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Nie udało się przywrócić ankiety.');
}

export async function restoreResponseApi(id: string): Promise<{ message: string; restoredSurveyTemporarily?: boolean }> {
  const res = await fetch(apiUrl(`api/trash/responses/${id}/restore`), { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Nie udało się przywrócić odpowiedzi.');
  return data;
}

export async function emptyTrashSurvey(id: string): Promise<void> {
  await fetch(apiUrl(`api/trash/surveys/${id}`), { method: 'DELETE' });
}

export async function emptyTrashResponse(id: string): Promise<void> {
  await fetch(apiUrl(`api/trash/responses/${id}`), { method: 'DELETE' });
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
