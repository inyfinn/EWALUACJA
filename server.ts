import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_QUESTIONS } from './src/data/surveyQuestions.ts';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.set('trust proxy', true);
app.use(express.json({ limit: '12mb' }));

const DATA_FILE = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'survey-store.json');

const DEFAULT_SURVEY_ID = 'survey_ewaluacja_360';

interface SurveyField {
  id: string;
  type: string;
  label: string;
  help?: string;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

interface ManagedSurvey {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: 'draft' | 'live' | 'closed';
  engine: 'generic' | '360';
  fields: SurveyField[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  sourceTemplateId?: string;
  subject?: string;
  questions?: any[];
}

interface VoterToken {
  id: string;
  code: string;
  label: string;
  used: boolean;
  usedAt?: string;
  responseId?: string;
  surveyId?: string;
}

interface SurveyResponse {
  id: string;
  createdAt: string;
  tokenUsed: string;
  surveyId?: string;
  answers: Record<string, any>;
  selectedFactors: Record<string, string[]>;
  dimensionComments?: Record<string, string>;
  collaborationContext?: string;
  teamRelation?: string;
  excludedFromReport?: boolean;
}

interface TrashSurveyItem {
  deletedAt: string;
  survey: ManagedSurvey;
  tokens: VoterToken[];
}

interface TrashResponseItem {
  deletedAt: string;
  response: SurveyResponse;
  surveyId: string;
  surveyTitle: string;
  surveySnapshot: ManagedSurvey;
}

interface StoreData {
  surveys: ManagedSurvey[];
  tokens: VoterToken[];
  responses: SurveyResponse[];
  trash: {
    surveys: TrashSurveyItem[];
    responses: TrashResponseItem[];
  };
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `ankieta-${Date.now().toString(36)}`;
}

function uniqueSlug(store: StoreData, desired: string, exceptId?: string): string {
  let slug = slugify(desired);
  let n = 2;
  while (store.surveys.some(s => s.slug === slug && s.id !== exceptId)) {
    slug = `${slugify(desired)}-${n}`;
    n += 1;
  }
  return slug;
}

function default360Survey(): ManagedSurvey {
  const now = new Date().toISOString();
  return {
    id: DEFAULT_SURVEY_ID,
    slug: 'ewaluacja-pracownika',
    title: 'Ewaluacja Krzysztofa Wieczorka',
    description: 'Anonimowa ewaluacja Krzysztofa Wieczorka: komunikacja, terminowość, jakość, wkład własny.',
    status: 'live',
    engine: '360',
    fields: [],
    questions: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
    createdAt: now,
    updatedAt: now,
  };
}

function getDefaultStore(): StoreData {
  const survey = default360Survey();
  return {
    surveys: [survey],
    tokens: [
      { id: 'token_1_kubara', code: 'KUB-1RNHC', label: 'Współpracownik 1 (Dział Produkcji / Technologii)', used: false, surveyId: survey.id },
      { id: 'token_2_kubara', code: 'KUB-2AB4K', label: 'Współpracownik 2 (Dział Handlowy / B2B)', used: false, surveyId: survey.id },
      { id: 'token_3_kubara', code: 'KUB-3M79X', label: 'Współpracownik 3 (Logistyka / Magazyn)', used: false, surveyId: survey.id },
      { id: 'token_4_kubara', code: 'KUB-4PT2W', label: 'Współpracownik 4 (Dział Jakości i Certyfikacji)', used: false, surveyId: survey.id },
      { id: 'token_5_kubara', code: 'KUB-5H83Q', label: 'Współpracownik 5 (Finanse / Administracja)', used: false, surveyId: survey.id },
      { id: 'token_6_kubara', code: 'KUB-6R91E', label: 'Współpracownik 6 (Projekt międzywydziałowy)', used: false, surveyId: survey.id },
      { id: 'token_7_kubara', code: 'KUB-7Y45Z', label: 'Współpracownik 7 (Współpracownik kluczowy)', used: false, surveyId: survey.id },
      { id: 'token_8_kubara', code: 'KUB-8N23L', label: 'Współpracownik 8 (Dział Obsługi Klienta)', used: false, surveyId: survey.id }
    ],
    responses: [],
    trash: { surveys: [], responses: [] },
  };
}

function migrateStore(parsed: any): StoreData {
  const store: StoreData = {
    surveys: Array.isArray(parsed.surveys) ? parsed.surveys : [],
    tokens: Array.isArray(parsed.tokens) ? parsed.tokens : getDefaultStore().tokens,
    responses: Array.isArray(parsed.responses) ? parsed.responses : [],
    trash: {
      surveys: Array.isArray(parsed.trash?.surveys) ? parsed.trash.surveys : [],
      responses: Array.isArray(parsed.trash?.responses) ? parsed.trash.responses : [],
    },
  };
  if (store.surveys.length === 0) {
    store.surveys = [default360Survey()];
  }
  store.surveys.forEach((s) => {
    const genericName = !s.title
      || s.title === 'Ewaluacja pracownika'
      || /360/.test(s.title);
    if ((s.engine === '360' || s.id === DEFAULT_SURVEY_ID) && genericName) {
      s.title = 'Ewaluacja Krzysztofa Wieczorka';
    }
    if (!s.description || /360/.test(s.description)) {
      if (s.engine === '360' || s.id === DEFAULT_SURVEY_ID || /360/.test(s.slug || '')) {
        s.description = 'Anonimowa ewaluacja Krzysztofa Wieczorka: komunikacja, terminowość, jakość, wkład własny.';
      }
    }
    if ((!s.questions || !s.questions.length) && (s.engine === '360' || s.id === DEFAULT_SURVEY_ID)) {
      s.questions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
    }
  });
  store.tokens.forEach(t => {
    if (!t.surveyId) t.surveyId = DEFAULT_SURVEY_ID;
  });
  store.responses.forEach(r => {
    if (!r.surveyId) r.surveyId = DEFAULT_SURVEY_ID;
  });
  return store;
}

function readStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const defaultData = getDefaultStore();
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const migrated = migrateStore(parsed);
    writeStore(migrated);
    return migrated;
  } catch (err) {
    console.error('Failed to read data store:', err);
    return getDefaultStore();
  }
}

function writeStore(data: StoreData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write data store:', err);
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  const store = readStore();
  res.json({
    status: 'ok',
    surveysCount: store.surveys.length,
    tokensCount: store.tokens.length,
    responsesCount: store.responses.length,
    trashSurveys: store.trash.surveys.length,
    trashResponses: store.trash.responses.length,
  });
});

function restoreSurveyRecord(store: StoreData, survey: ManagedSurvey, tokens: VoterToken[] = [], asArchived = false) {
  const existing = store.surveys.find(s => s.id === survey.id);
  if (existing) {
    if (asArchived) {
      existing.archived = true;
      existing.status = 'closed';
    }
    return existing;
  }
  const restored = JSON.parse(JSON.stringify(survey)) as ManagedSurvey;
  restored.slug = uniqueSlug(store, restored.slug || restored.title, restored.id);
  if (asArchived) {
    restored.archived = true;
    restored.status = 'closed';
  }
  store.surveys.push(restored);
  tokens.forEach((token) => {
    if (!store.tokens.some(t => t.id === token.id)) store.tokens.push(token);
  });
  return restored;
}

app.get('/api/trash', (_req, res) => {
  const store = readStore();
  res.json(store.trash);
});

app.post('/api/trash/surveys/:id/restore', (req, res) => {
  const store = readStore();
  const idx = store.trash.surveys.findIndex(item => item.survey.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Nie ma tej ankiety w koszu.' });
  const item = store.trash.surveys[idx];
  restoreSurveyRecord(store, item.survey, item.tokens, false);
  const related = store.trash.responses.filter(r => r.surveyId === item.survey.id);
  related.forEach((tr) => {
    if (!store.responses.some(r => r.id === tr.response.id)) {
      store.responses.push(tr.response);
    }
  });
  store.trash.surveys.splice(idx, 1);
  store.trash.responses = store.trash.responses.filter(r => r.surveyId !== item.survey.id);
  writeStore(store);
  res.json({ success: true, survey: item.survey });
});

app.post('/api/trash/responses/:id/restore', (req, res) => {
  const store = readStore();
  const idx = store.trash.responses.findIndex(item => item.response.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Nie ma tej odpowiedzi w koszu.' });
  const item = store.trash.responses[idx];
  const live = store.surveys.find(s => s.id === item.surveyId);
  const bundled = store.trash.surveys.find(t => t.survey.id === item.surveyId);

  let restoredSurveyTemporarily = false;
  let survey = live;
  if (!survey && bundled) {
    survey = restoreSurveyRecord(store, bundled.survey, bundled.tokens, true);
    store.trash.surveys = store.trash.surveys.filter(t => t.survey.id !== bundled.survey.id);
    restoredSurveyTemporarily = true;
  } else if (!survey) {
    survey = restoreSurveyRecord(store, item.surveySnapshot, [], true);
    restoredSurveyTemporarily = true;
  }

  if (!store.responses.some(r => r.id === item.response.id)) {
    store.responses.push({ ...item.response, surveyId: survey.id });
  }
  store.trash.responses.splice(idx, 1);
  writeStore(store);
  res.json({
    success: true,
    restoredSurveyTemporarily,
    archived: Boolean(survey.archived),
    surveyTitle: survey.title,
    message: restoredSurveyTemporarily
      ? `Ta odpowiedź należała do usuniętej ankiety „${survey.title}”. Przywracam tymczasowo całą ankietę i oznaczam ją jako zarchiwizowaną, żeby dało się odzyskać wynik.`
      : 'Przywrócono odpowiedź do ankiety.',
  });
});

app.delete('/api/trash/surveys/:id', (req, res) => {
  const store = readStore();
  store.trash.surveys = store.trash.surveys.filter(item => item.survey.id !== req.params.id);
  store.trash.responses = store.trash.responses.filter(item => item.surveyId !== req.params.id);
  writeStore(store);
  res.json({ success: true });
});

app.delete('/api/trash/responses/:id', (req, res) => {
  const store = readStore();
  store.trash.responses = store.trash.responses.filter(item => item.response.id !== req.params.id);
  writeStore(store);
  res.json({ success: true });
});

app.get('/api/surveys', (_req, res) => {
  const store = readStore();
  res.json(store.surveys);
});

app.get('/api/surveys/by-slug/:slug', (req, res) => {
  const store = readStore();
  const slug = req.params.slug;
  const aliases: Record<string, string> = {
    'ewaluacja-pracownika': 'ewaluacja-360',
    'ewaluacja-360': 'ewaluacja-pracownika',
  };
  const survey = store.surveys.find(s => s.slug === slug)
    || (aliases[slug] ? store.surveys.find(s => s.slug === aliases[slug]) : undefined);
  if (!survey) {
    return res.status(404).json({ error: 'Nie znaleziono ankiety o tym adresie.' });
  }
  res.json(survey);
});

app.get('/api/surveys/:id', (req, res) => {
  const store = readStore();
  const survey = store.surveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Ankieta nie istnieje.' });
  res.json(survey);
});

app.post('/api/surveys', (req, res) => {
  const body = req.body || {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length < 2) {
    return res.status(400).json({ error: 'Najpierw wpisz nazwę ankiety (minimum 2 znaki). Bez nazwy nie da się iść dalej.' });
  }
  const store = readStore();
  const now = new Date().toISOString();
  const survey: ManagedSurvey = {
    id: `survey_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slug: uniqueSlug(store, body.slug || title),
    title,
    description: typeof body.description === 'string' ? body.description : '',
    status: body.status === 'draft' || body.status === 'closed' ? body.status : 'live',
    engine: body.engine === '360' ? '360' : 'generic',
    fields: Array.isArray(body.fields) ? body.fields : [],
    createdAt: now,
    updatedAt: now,
    archived: Boolean(body.archived),
    sourceTemplateId: typeof body.sourceTemplateId === 'string' ? body.sourceTemplateId : undefined,
    subject: typeof body.subject === 'string' ? body.subject : undefined,
    questions: Array.isArray(body.questions) ? body.questions : [],
  };
  store.surveys.push(survey);
  writeStore(store);
  res.json(survey);
});

app.post('/api/surveys/:id/duplicate', (req, res) => {
  const store = readStore();
  const source = store.surveys.find(s => s.id === req.params.id);
  if (!source) return res.status(404).json({ error: 'Nie ma takiej ankiety do skopiowania.' });
  const requestedTitle = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const title = requestedTitle || `${source.title} (kopia)`;
  const now = new Date().toISOString();
  const copy: ManagedSurvey = {
    ...JSON.parse(JSON.stringify(source)),
    id: `survey_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slug: uniqueSlug(store, title),
    title,
    status: 'draft',
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  store.surveys.push(copy);
  writeStore(store);
  res.json(copy);
});

app.put('/api/surveys/:id', (req, res) => {
  const store = readStore();
  const survey = store.surveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Ankieta nie istnieje.' });
  const body = req.body || {};
  if (typeof body.title === 'string') {
    if (!body.title.trim()) {
      return res.status(400).json({ error: 'Ankieta musi mieć nazwę. Wpisz tytuł, zanim zapiszesz.' });
    }
    survey.title = body.title.trim();
  }
  if (typeof body.description === 'string') survey.description = body.description;
  if (body.status === 'draft' || body.status === 'live' || body.status === 'closed') survey.status = body.status;
  if (typeof body.archived === 'boolean') survey.archived = body.archived;
  if (body.engine === '360' || body.engine === 'generic') survey.engine = body.engine;
  if (Array.isArray(body.fields)) survey.fields = body.fields;
  if (Array.isArray(body.questions)) survey.questions = body.questions;
  if (typeof body.slug === 'string' && body.slug.trim()) {
    survey.slug = uniqueSlug(store, body.slug, survey.id);
  }
  survey.updatedAt = new Date().toISOString();
  writeStore(store);
  res.json(survey);
});

app.delete('/api/surveys/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const survey = store.surveys.find(s => s.id === id);
  if (!survey) return res.status(404).json({ error: 'Ankieta nie istnieje.' });

  const relatedResponses = store.responses.filter(r => r.surveyId === id);
  const relatedTokens = store.tokens.filter(t => t.surveyId === id);
  const deletedAt = new Date().toISOString();

  store.trash.surveys.unshift({
    deletedAt,
    survey: JSON.parse(JSON.stringify(survey)),
    tokens: JSON.parse(JSON.stringify(relatedTokens)),
  });
  relatedResponses.forEach((response) => {
    store.trash.responses.unshift({
      deletedAt,
      response: JSON.parse(JSON.stringify(response)),
      surveyId: id,
      surveyTitle: survey.title,
      surveySnapshot: JSON.parse(JSON.stringify(survey)),
    });
  });

  store.surveys = store.surveys.filter(s => s.id !== id);
  store.tokens = store.tokens.filter(t => t.surveyId !== id);
  store.responses = store.responses.filter(r => r.surveyId !== id);
  writeStore(store);
  res.json({ success: true, trashed: true });
});

app.get('/api/tokens', (req, res) => {
  const store = readStore();
  const surveyId = typeof req.query.surveyId === 'string' ? req.query.surveyId : '';
  res.json(surveyId ? store.tokens.filter(t => t.surveyId === surveyId) : store.tokens);
});

app.post('/api/tokens', (req, res) => {
  const { label, surveyId } = req.body || {};
  const store = readStore();
  const resolvedSurveyId = typeof surveyId === 'string' && surveyId
    ? surveyId
    : (store.surveys[0]?.id || DEFAULT_SURVEY_ID);

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const scopedCount = store.tokens.filter(t => t.surveyId === resolvedSurveyId).length;
  const code = `KUB-${scopedCount + 1}${rand}`;

  const newToken: VoterToken = {
    id: `token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    code,
    label: (label && typeof label === 'string' && label.trim()) ? label.trim() : `Współpracownik ${scopedCount + 1}`,
    used: false,
    surveyId: resolvedSurveyId,
  };

  store.tokens.push(newToken);
  writeStore(store);
  res.json(newToken);
});

app.delete('/api/tokens/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const token = store.tokens.find(t => t.id === id);
  if (token) {
    // Also remove associated response if any
    store.responses = store.responses.filter(r => r.id !== token.responseId && r.tokenUsed !== token.code);
  }
  store.tokens = store.tokens.filter(t => t.id !== id);
  writeStore(store);
  res.json({ success: true });
});

app.post('/api/tokens/:id/reset', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const token = store.tokens.find(t => t.id === id);
  if (!token) {
    return res.status(404).json({ success: false, error: 'Token nie znaleziony.' });
  }

  // Remove linked response if any
  if (token.responseId) {
    store.responses = store.responses.filter(r => r.id !== token.responseId);
  } else {
    store.responses = store.responses.filter(r => r.tokenUsed.toUpperCase() !== token.code.toUpperCase());
  }

  token.used = false;
  delete token.usedAt;
  delete token.responseId;

  writeStore(store);
  res.json({ success: true, token });
});

app.get('/api/responses', (req, res) => {
  const store = readStore();
  const surveyId = typeof req.query.surveyId === 'string' ? req.query.surveyId : '';
  res.json(surveyId ? store.responses.filter(r => r.surveyId === surveyId) : store.responses);
});

app.delete('/api/responses/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const resp = store.responses.find(r => r.id === id);
  if (!resp) return res.status(404).json({ success: false, error: 'Odpowiedź nie istnieje.' });

  const parent = store.surveys.find(s => s.id === resp.surveyId)
    || store.trash.surveys.find(t => t.survey.id === resp.surveyId)?.survey;
  store.trash.responses.unshift({
    deletedAt: new Date().toISOString(),
    response: JSON.parse(JSON.stringify(resp)),
    surveyId: resp.surveyId || DEFAULT_SURVEY_ID,
    surveyTitle: parent?.title || 'Nieznana ankieta',
    surveySnapshot: parent ? JSON.parse(JSON.stringify(parent)) : JSON.parse(JSON.stringify({
      id: resp.surveyId || DEFAULT_SURVEY_ID,
      slug: `przywrocona-${Date.now()}`,
      title: 'Przywrócona ankieta',
      description: '',
      status: 'closed',
      engine: 'generic',
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: true,
    })),
  });

  store.responses = store.responses.filter(r => r.id !== id);
  store.tokens.forEach(t => {
    if (t.responseId === id || t.code.toUpperCase() === resp.tokenUsed.toUpperCase()) {
      t.used = false;
      delete t.usedAt;
      delete t.responseId;
    }
  });

  writeStore(store);
  res.json({ success: true, trashed: true });
});

app.patch('/api/responses/:id/exclude', (req, res) => {
  const { id } = req.params;
  const { excluded } = req.body || {};
  const store = readStore();
  const resp = store.responses.find(r => r.id === id);
  
  if (!resp) {
    return res.status(404).json({ success: false, error: 'Odpowiedź nie została znaleziona.' });
  }

  resp.excludedFromReport = excluded !== undefined ? Boolean(excluded) : !resp.excludedFromReport;
  writeStore(store);
  res.json({ success: true, response: resp });
});

function normalizeImportedResponse(raw: any): SurveyResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const payload = raw.response && typeof raw.response === 'object' ? raw.response : raw;
  if (typeof payload.tokenUsed !== 'string' || !payload.answers || typeof payload.answers !== 'object') {
    return null;
  }
  return {
    id: typeof payload.id === 'string' && payload.id.trim() ? payload.id : `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: payload.createdAt || new Date().toISOString(),
    tokenUsed: String(payload.tokenUsed).trim().toUpperCase(),
    surveyId: payload.surveyId || DEFAULT_SURVEY_ID,
    answers: payload.answers,
    selectedFactors: payload.selectedFactors || {},
    dimensionComments: payload.dimensionComments || {},
    collaborationContext: payload.collaborationContext || '',
    teamRelation: payload.teamRelation || '',
    excludedFromReport: Boolean(payload.excludedFromReport),
  };
}

function upsertImportedResponse(store: StoreData, response: SurveyResponse) {
  const existingIdx = store.responses.findIndex(r => r.id === response.id);
  if (existingIdx >= 0) {
    store.responses[existingIdx] = { ...store.responses[existingIdx], ...response };
  } else {
    store.responses.push(response);
  }

  const tokenCode = response.tokenUsed.trim().toUpperCase();
  let token = store.tokens.find(t => t.code.trim().toUpperCase() === tokenCode);
  if (!token) {
    token = {
      id: `token_import_${Date.now()}`,
      code: tokenCode || `IMP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      label: `Import z pliku (${tokenCode || 'bez kodu'})`,
      used: true,
      usedAt: response.createdAt,
      responseId: response.id,
      surveyId: response.surveyId || DEFAULT_SURVEY_ID,
    };
    store.tokens.push(token);
  } else {
    token.used = true;
    token.usedAt = token.usedAt || response.createdAt;
    token.responseId = response.id;
  }
}

app.post('/api/responses/import', (req, res) => {
  const imported = normalizeImportedResponse(req.body);
  if (!imported) {
    return res.status(400).json({
      success: false,
      error: 'Plik nie zawiera rozpoznawalnego wyniku ankiety (wymagane pola: tokenUsed, answers).',
    });
  }

  const store = readStore();
  upsertImportedResponse(store, imported);
  writeStore(store);
  res.json({ success: true, response: imported });
});

app.get('/api/store/export', (_req, res) => {
  const store = readStore();
  res.json({
    format: 'kubara-ewaluacja-360-store',
    version: 1,
    exportedAt: new Date().toISOString(),
    ...store,
  });
});

app.post('/api/responses', (req, res) => {
  const response = req.body as SurveyResponse;
  if (!response || !response.tokenUsed) {
    return res.status(400).json({ success: false, error: 'Brak danych ankiety lub kodu zaproszenia.' });
  }

  const store = readStore();
  const tokenCode = response.tokenUsed.trim().toUpperCase();
  response.surveyId = response.surveyId || DEFAULT_SURVEY_ID;

  // Allow preview token
  if (tokenCode === 'PODGLAD' || tokenCode === 'PREVIEW' || tokenCode === 'DEMO') {
    store.responses.push(response);
    writeStore(store);
    return res.json({ success: true, response });
  }

  const token = store.tokens.find(t => t.code.trim().toUpperCase() === tokenCode);

  if (!token) {
    // If token code is formatted like KUB-*, auto-register it to avoid locking out any recipient
    if (tokenCode.startsWith('KUB-')) {
      const autoToken: VoterToken = {
        id: `token_${Date.now()}_auto`,
        code: tokenCode,
        label: `Współpracownik (${tokenCode})`,
        used: true,
        usedAt: new Date().toISOString(),
        responseId: response.id,
        surveyId: response.surveyId,
      };
      store.tokens.push(autoToken);
      store.responses.push(response);
      writeStore(store);
      return res.json({ success: true, response });
    }
    return res.status(400).json({ success: false, error: 'Nieprawidłowy kod zaproszenia. Sprawdź swój unikalny link.' });
  }

  if (token.used) {
    // If token already used, check if this is an idempotent re-submission of the same response
    if (token.responseId === response.id) {
      return res.json({ success: true, response });
    }
    return res.status(400).json({
      success: false,
      error: 'Ten unikalny link został już wcześniej wykorzystany do oddania głosu. Każda osoba może wypełnić ankietę tylko 1 raz.',
    });
  }

  // Mark token as used
  token.used = true;
  token.usedAt = new Date().toISOString();
  token.responseId = response.id;

  store.responses.push(response);
  writeStore(store);

  res.json({ success: true, response });
});

app.post('/api/clear-responses', (req, res) => {
  const store = readStore();
  const surveyId = (req.body && req.body.surveyId) || req.query.surveyId;
  if (surveyId) {
    store.responses = store.responses.filter(r => r.surveyId !== surveyId);
    store.tokens.forEach(t => {
      if (t.surveyId === surveyId) {
        t.used = false;
        delete t.usedAt;
        delete t.responseId;
      }
    });
  } else {
    store.responses = [];
    store.tokens.forEach(t => {
      t.used = false;
      delete t.usedAt;
      delete t.responseId;
    });
  }
  writeStore(store);
  res.json({ success: true });
});

// -------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Survey store: ${DATA_FILE}`);
  });
}

startServer();
