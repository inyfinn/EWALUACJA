import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_QUESTIONS } from './src/data/surveyQuestions.ts';
import { SURVEY_TEMPLATES } from './src/data/surveyTemplates.ts';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.set('trust proxy', true);
app.use(express.json({ limit: '12mb' }));

const DATA_FILE = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'survey-store.json');

const DEFAULT_SURVEY_ID = 'survey_ewaluacja_360';

const BUILTIN_PANELS: StoredPanel[] = [
  { id: 'karolina', name: 'Karolina', password: 'karolina2026#' },
  { id: 'krzysztof', name: 'Krzysztof', password: 'krzysztof2026#' },
  { id: 'szymon', name: 'Szymon', password: 'szymon2026#' },
  { id: 'ewa', name: 'Ewa', password: 'ewa2026#' },
  { id: 'aneta', name: 'Aneta', password: 'aneta2026#' },
];

function normPass(value: string) {
  return String(value || '').trim().toLowerCase();
}

interface StoredPanel {
  id: string;
  name: string;
  password: string;
}

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
  ownerIds?: string[];
}

interface VoterToken {
  id: string;
  code: string;
  label: string;
  used: boolean;
  usedAt?: string;
  responseId?: string;
  surveyId?: string;
  test?: boolean;
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

interface StoredTemplate {
  id: string;
  title: string;
  blurb: string;
  visibility: 'global' | 'private';
  ownerId: string;
  builtin?: boolean;
  subject?: string;
  subjectLabel?: string;
  engine: 'generic' | '360';
  description: string;
  fields: SurveyField[];
  questions?: any[];
}

interface StoreSession {
  token: string;
  panelId: string;
  createdAt: string;
}

interface StoreData {
  surveys: ManagedSurvey[];
  tokens: VoterToken[];
  responses: SurveyResponse[];
  trash: {
    surveys: TrashSurveyItem[];
    responses: TrashResponseItem[];
  };
  templates: StoredTemplate[];
  sessions: StoreSession[];
  panels: StoredPanel[];
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

function seedBuiltinTemplates(): StoredTemplate[] {
  return SURVEY_TEMPLATES.map((t) => ({
    id: t.id,
    title: t.title,
    blurb: t.blurb,
    visibility: 'global' as const,
    ownerId: 'system',
    builtin: true,
    subject: t.subject,
    subjectLabel: t.subjectLabel,
    engine: t.engine,
    description: t.description,
    fields: JSON.parse(JSON.stringify(t.fields)),
    questions: t.questions ? JSON.parse(JSON.stringify(t.questions)) : [],
  }));
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
    ownerIds: ['krzysztof', 'karolina'],
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
    templates: seedBuiltinTemplates(),
    sessions: [],
    panels: [],
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
    templates: Array.isArray(parsed.templates) ? parsed.templates : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    panels: Array.isArray(parsed.panels)
      ? parsed.panels.filter((p: any) => p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.password === 'string')
      : [],
  };
  if (store.surveys.length === 0) {
    store.surveys = [default360Survey()];
  }
  const builtins = seedBuiltinTemplates();
  builtins.forEach((tpl) => {
    if (!store.templates.some((t) => t.id === tpl.id && t.builtin)) {
      store.templates = store.templates.filter((t) => t.id !== tpl.id);
      store.templates.push(tpl);
    }
  });
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
    if (!Array.isArray(s.ownerIds) || s.ownerIds.length === 0) {
      const isKrzysztofEval = s.engine === '360' || s.id === DEFAULT_SURVEY_ID || /ewaluacja krzysztofa/i.test(s.title || '');
      s.ownerIds = isKrzysztofEval ? ['krzysztof', 'karolina'] : ['krzysztof'];
    } else {
      const isKrzysztofEval = s.engine === '360' || s.id === DEFAULT_SURVEY_ID || /ewaluacja krzysztofa/i.test(s.title || '');
      if (isKrzysztofEval) {
        s.ownerIds = Array.from(new Set([...s.ownerIds, 'krzysztof', 'karolina']));
      }
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

function allPanels(store: StoreData): StoredPanel[] {
  const builtinIds = new Set(BUILTIN_PANELS.map((p) => p.id));
  const extra = (store.panels || []).filter((p) => p.id && p.name && p.password && !builtinIds.has(p.id));
  return [...BUILTIN_PANELS, ...extra];
}

function panelByPassword(store: StoreData, password: string) {
  const needle = normPass(password);
  return allPanels(store).find((p) => normPass(p.password) === needle) || null;
}

function uniquePanelId(store: StoreData, name: string): string {
  const base = slugify(name) || `osoba-${Date.now().toString(36)}`;
  const taken = new Set(allPanels(store).map((p) => p.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function generatePanelPassword(existing: StoredPanel[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  for (let attempt = 0; attempt < 30; attempt++) {
    let rand = '';
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(crypto.randomInt(chars.length));
    }
    const password = `${rand}#`;
    if (!existing.some((p) => normPass(p.password) === normPass(password))) return password;
  }
  return `${crypto.randomBytes(6).toString('hex')}#`;
}

function publicPanels(store: StoreData) {
  return allPanels(store).map((p) => ({ id: p.id, name: p.name }));
}

function panelFromRequest(req: express.Request, store: StoreData) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const session = store.sessions.find((s) => s.token === token);
  if (!session) return null;
  return allPanels(store).find((p) => p.id === session.panelId) || null;
}

function requirePanel(req: express.Request, res: express.Response) {
  const store = readStore();
  const panel = panelFromRequest(req, store);
  if (!panel) {
    res.status(401).json({ error: 'Sesja wygasła. Wejdź ponownie hasłem.' });
    return null;
  }
  return { store, panel };
}

function canAccessSurvey(survey: ManagedSurvey, panelId: string) {
  return (survey.ownerIds || []).includes(panelId);
}

function ownedSurveys(store: StoreData, panelId: string) {
  return store.surveys.filter((s) => canAccessSurvey(s, panelId));
}

app.post('/api/auth/login', (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const store = readStore();
  const panel = panelByPassword(store, password);
  if (!panel) {
    return res.status(401).json({ error: 'Nieprawidłowe hasło.' });
  }
  const token = crypto.randomBytes(24).toString('hex');
  store.sessions = store.sessions.filter((s) => s.panelId !== panel.id);
  store.sessions.push({ token, panelId: panel.id, createdAt: new Date().toISOString() });
  writeStore(store);
  res.json({ token, panel: { id: panel.id, name: panel.name } });
});

app.post('/api/auth/logout', (req, res) => {
  const store = readStore();
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  store.sessions = store.sessions.filter((s) => s.token !== token);
  writeStore(store);
  res.json({ success: true });
});

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/panels', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  res.json(publicPanels(ctx.store));
});

app.post('/api/panels', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (name.length < 2) {
    return res.status(400).json({ error: 'Wpisz imię nowej osoby (minimum 2 znaki).' });
  }
  const surveyId = typeof req.body?.surveyId === 'string' ? req.body.surveyId : '';
  let survey: ManagedSurvey | undefined;
  if (surveyId) {
    survey = store.surveys.find((s) => s.id === surveyId);
    if (!survey || !canAccessSurvey(survey, panel.id)) {
      return res.status(404).json({ error: 'Nie ma takiej ankiety, żeby dodać do niej tę osobę.' });
    }
  }
  const id = uniquePanelId(store, name);
  const password = generatePanelPassword(allPanels(store));
  const created: StoredPanel = { id, name, password };
  store.panels = [...(store.panels || []), created];
  if (survey) {
    const owners = [...(survey.ownerIds || [])];
    if (!owners.includes(id)) owners.push(id);
    survey.ownerIds = owners;
    survey.updatedAt = new Date().toISOString();
  }
  writeStore(store);
  res.json({
    id,
    name,
    password,
    survey: survey || undefined,
  });
});

function isPreviewCode(code: string) {
  return code === 'PODGLAD' || code === 'PREVIEW' || code === 'DEMO';
}

function publicSurveyView(survey: ManagedSurvey) {
  return {
    id: survey.id,
    slug: survey.slug,
    title: survey.title,
    description: survey.description,
    status: survey.status,
    engine: survey.engine,
    fields: survey.fields,
    questions: survey.questions,
    archived: survey.archived,
    subject: survey.subject,
  };
}

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

app.get('/api/trash', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  res.json({
    surveys: store.trash.surveys.filter((item) => canAccessSurvey(item.survey, panel.id)),
    responses: store.trash.responses.filter((item) => canAccessSurvey(item.surveySnapshot, panel.id)),
  });
});

app.post('/api/trash/surveys/:id/restore', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const idx = store.trash.surveys.findIndex(item => item.survey.id === req.params.id && canAccessSurvey(item.survey, panel.id));
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
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const idx = store.trash.responses.findIndex(item => item.response.id === req.params.id && canAccessSurvey(item.surveySnapshot, panel.id));
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
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  store.trash.surveys = store.trash.surveys.filter(item => !(item.survey.id === req.params.id && canAccessSurvey(item.survey, panel.id)));
  store.trash.responses = store.trash.responses.filter(item => item.surveyId !== req.params.id);
  writeStore(store);
  res.json({ success: true });
});

app.delete('/api/trash/responses/:id', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  store.trash.responses = store.trash.responses.filter(item => !(item.response.id === req.params.id && canAccessSurvey(item.surveySnapshot, panel.id)));
  writeStore(store);
  res.json({ success: true });
});

app.get('/api/surveys', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  res.json(ownedSurveys(ctx.store, ctx.panel.id));
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
  if (!survey || survey.archived || survey.status === 'draft') {
    return res.status(404).json({ error: 'Nie ma takiej ankiety albo nie jest opublikowana.' });
  }
  if (survey.status === 'closed') {
    return res.status(409).json({ error: 'Ta ankieta jest wstrzymana i nie przyjmuje odpowiedzi.' });
  }
  res.json(publicSurveyView(survey));
});

app.get('/api/surveys/:id', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const survey = ctx.store.surveys.find(s => s.id === req.params.id);
  if (!survey || !canAccessSurvey(survey, ctx.panel.id)) return res.status(404).json({ error: 'Ankieta nie istnieje.' });
  res.json(survey);
});

app.post('/api/surveys', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const body = req.body || {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length < 2) {
    return res.status(400).json({ error: 'Najpierw wpisz nazwę ankiety (minimum 2 znaki). Bez nazwy nie da się iść dalej.' });
  }
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
    ownerIds: [panel.id],
  };
  store.surveys.push(survey);
  writeStore(store);
  res.json(survey);
});

app.post('/api/surveys/:id/duplicate', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const source = store.surveys.find(s => s.id === req.params.id);
  if (!source || !canAccessSurvey(source, panel.id)) return res.status(404).json({ error: 'Nie ma takiej ankiety do skopiowania.' });
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
    ownerIds: [panel.id],
  };
  store.surveys.push(copy);
  writeStore(store);
  res.json(copy);
});

app.put('/api/surveys/:id', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const survey = store.surveys.find(s => s.id === req.params.id);
  if (!survey || !canAccessSurvey(survey, panel.id)) return res.status(404).json({ error: 'Ankieta nie istnieje.' });
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
  if (Array.isArray(body.ownerIds)) {
    const allowed = new Set<string>(allPanels(store).map((p) => p.id));
    const ids: string[] = [];
    for (const raw of body.ownerIds) {
      if (typeof raw === 'string' && allowed.has(raw) && !ids.includes(raw)) ids.push(raw);
    }
    if (ids.length === 0) {
      return res.status(400).json({ error: 'Ankieta musi mieć przynajmniej jedną osobę z dostępem do panelu.' });
    }
    survey.ownerIds = ids;
  }
  survey.updatedAt = new Date().toISOString();
  writeStore(store);
  res.json(survey);
});

app.delete('/api/surveys/:id', (req, res) => {
  const { id } = req.params;
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const survey = store.surveys.find(s => s.id === id);
  if (!survey || !canAccessSurvey(survey, panel.id)) return res.status(404).json({ error: 'Ankieta nie istnieje.' });

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

app.get('/api/templates', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const list = store.templates.filter((t) => t.visibility === 'global' || t.ownerId === panel.id);
  res.json(list);
});

app.post('/api/templates', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const visibility = req.body?.visibility === 'private' ? 'private' : 'global';
  const surveyId = typeof req.body?.surveyId === 'string' ? req.body.surveyId : '';
  const survey = store.surveys.find((s) => s.id === surveyId);
  if (!survey || !canAccessSurvey(survey, panel.id)) {
    return res.status(400).json({ error: 'Najpierw zapisz ankietę, potem zrób z niej szablon.' });
  }
  const title = (typeof req.body?.title === 'string' && req.body.title.trim()) || survey.title;
  const tpl: StoredTemplate = {
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    blurb: survey.description || title,
    visibility,
    ownerId: panel.id,
    builtin: false,
    subject: survey.subject,
    subjectLabel: visibility === 'global' ? 'Globalny' : 'Prywatny',
    engine: survey.engine,
    description: survey.description || '',
    fields: JSON.parse(JSON.stringify(survey.fields || [])),
    questions: JSON.parse(JSON.stringify(survey.questions || [])),
  };
  store.templates.push(tpl);
  writeStore(store);
  res.json(tpl);
});

app.post('/api/tokens/validate', (req, res) => {
  const store = readStore();
  const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
  const surveyId = typeof req.body?.surveyId === 'string' ? req.body.surveyId.trim() : '';
  if (!code || !surveyId) {
    return res.status(400).json({ valid: false, used: false, error: 'Brak kodu zaproszenia.' });
  }

  if (isPreviewCode(code)) {
    const panel = panelFromRequest(req, store);
    if (!panel) {
      return res.status(401).json({
        valid: false,
        used: false,
        error: 'Podgląd ankiety jest dostępny tylko po wejściu hasłem do panelu.',
      });
    }
    const survey = store.surveys.find((s) => s.id === surveyId);
    if (!survey || !canAccessSurvey(survey, panel.id)) {
      return res.status(404).json({ valid: false, used: false, error: 'Nie ma takiej ankiety.' });
    }
    return res.json({ valid: true, used: false, preview: true, label: 'Tryb podglądu' });
  }

  const survey = store.surveys.find((s) => s.id === surveyId);
  if (!survey || survey.archived || survey.status !== 'live') {
    return res.status(404).json({
      valid: false,
      used: false,
      error: 'Ta ankieta nie przyjmuje teraz odpowiedzi.',
    });
  }

  const token = store.tokens.find(
    (t) => t.code.trim().toUpperCase() === code && t.surveyId === surveyId,
  );
  if (!token) {
    return res.json({ valid: false, used: false, error: 'Nieprawidłowy kod zaproszenia. Sprawdź unikalny link.' });
  }
  if (token.used) {
    return res.json({
      valid: true,
      used: true,
      error: 'Ten unikalny link został już wcześniej wykorzystany do oddania głosu. Każda osoba może wypełnić ankietę tylko 1 raz.',
    });
  }
  return res.json({ valid: true, used: false, label: token.label });
});

app.get('/api/tokens', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const surveyId = typeof req.query.surveyId === 'string' ? req.query.surveyId : '';
  if (surveyId) {
    const parent = store.surveys.find((s) => s.id === surveyId);
    if (!parent || !canAccessSurvey(parent, panel.id)) {
      return res.status(404).json({ error: 'Nie ma takiej ankiety.' });
    }
    return res.json(store.tokens.filter((t) => t.surveyId === surveyId));
  }
  const ids = new Set(ownedSurveys(store, panel.id).map((s) => s.id));
  res.json(store.tokens.filter((t) => t.surveyId && ids.has(t.surveyId)));
});

app.post('/api/tokens', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const { label, surveyId, test } = req.body || {};
  const resolvedSurveyId = typeof surveyId === 'string' && surveyId
    ? surveyId
    : (ownedSurveys(store, panel.id)[0]?.id || '');
  const parent = store.surveys.find((s) => s.id === resolvedSurveyId);
  if (!parent || !canAccessSurvey(parent, panel.id)) {
    return res.status(404).json({ error: 'Nie ma takiej ankiety.' });
  }

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
    label: (label && typeof label === 'string' && label.trim()) ? label.trim() : `Ankietowany ${scopedCount + 1}`,
    used: false,
    surveyId: resolvedSurveyId,
    test: Boolean(test),
  };

  store.tokens.push(newToken);
  writeStore(store);
  res.json(newToken);
});

app.delete('/api/tokens/:id', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const { id } = req.params;
  const token = store.tokens.find(t => t.id === id);
  if (token) {
    const parent = store.surveys.find((s) => s.id === token.surveyId);
    if (parent && !canAccessSurvey(parent, panel.id)) {
      return res.status(404).json({ success: false, error: 'Token nie znaleziony.' });
    }
    // Also remove associated response if any
    store.responses = store.responses.filter(r => r.id !== token.responseId && r.tokenUsed !== token.code);
  }
  store.tokens = store.tokens.filter(t => t.id !== id);
  writeStore(store);
  res.json({ success: true });
});

app.post('/api/tokens/:id/reset', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const { id } = req.params;
  const token = store.tokens.find(t => t.id === id);
  if (!token) {
    return res.status(404).json({ success: false, error: 'Token nie znaleziony.' });
  }
  const parent = store.surveys.find((s) => s.id === token.surveyId);
  if (parent && !canAccessSurvey(parent, panel.id)) {
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
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const surveyId = typeof req.query.surveyId === 'string' ? req.query.surveyId : '';
  const ids = new Set(ownedSurveys(store, panel.id).map((s) => s.id));
  if (surveyId) {
    if (!ids.has(surveyId)) return res.status(404).json({ error: 'Nie ma takiej ankiety.' });
    return res.json(store.responses.filter((r) => r.surveyId === surveyId));
  }
  res.json(store.responses.filter((r) => r.surveyId && ids.has(r.surveyId)));
});

app.delete('/api/responses/:id', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const { id } = req.params;
  const resp = store.responses.find(r => r.id === id);
  if (!resp) return res.status(404).json({ success: false, error: 'Odpowiedź nie istnieje.' });
  const liveParent = store.surveys.find(s => s.id === resp.surveyId);
  if (liveParent && !canAccessSurvey(liveParent, panel.id)) {
    return res.status(404).json({ success: false, error: 'Odpowiedź nie istnieje.' });
  }

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
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store } = ctx;
  const { id } = req.params;
  const { excluded } = req.body || {};
  const resp = store.responses.find(r => r.id === id);
  
  if (!resp) {
    return res.status(404).json({ success: false, error: 'Odpowiedź nie została znaleziona.' });
  }
  const parent = store.surveys.find((s) => s.id === resp.surveyId);
  if (!parent || !canAccessSurvey(parent, ctx.panel.id)) {
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
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const imported = normalizeImportedResponse(req.body);
  if (!imported) {
    return res.status(400).json({
      success: false,
      error: 'Plik nie zawiera rozpoznawalnego wyniku ankiety (wymagane pola: tokenUsed, answers).',
    });
  }

  const { store } = ctx;
  upsertImportedResponse(store, imported);
  writeStore(store);
  res.json({ success: true, response: imported });
});

app.get('/api/store/export', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const store = ctx.store;
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
  const survey = store.surveys.find((s) => s.id === response.surveyId);

  if (isPreviewCode(tokenCode)) {
    const panel = panelFromRequest(req, store);
    if (!panel || !survey || !canAccessSurvey(survey, panel.id)) {
      return res.status(401).json({
        success: false,
        error: 'Podgląd nie zapisuje odpowiedzi. Wejdź do panelu hasłem albo użyj unikalnego linku.',
      });
    }
    return res.json({ success: true, response, preview: true, saved: false });
  }

  if (!survey || survey.archived || survey.status !== 'live') {
    return res.status(400).json({
      success: false,
      error: 'Ta ankieta nie przyjmuje teraz odpowiedzi.',
    });
  }

  const token = store.tokens.find(
    (t) => t.code.trim().toUpperCase() === tokenCode && t.surveyId === response.surveyId,
  );

  if (!token) {
    return res.status(400).json({ success: false, error: 'Nieprawidłowy kod zaproszenia. Sprawdź swój unikalny link.' });
  }

  if (token.used) {
    if (token.responseId === response.id) {
      return res.json({ success: true, response });
    }
    return res.status(400).json({
      success: false,
      error: 'Ten unikalny link został już wcześniej wykorzystany do oddania głosu. Każda osoba może wypełnić ankietę tylko 1 raz.',
    });
  }

  token.used = true;
  token.usedAt = new Date().toISOString();
  token.responseId = response.id;
  if (token.test) {
    response.excludedFromReport = true;
  }

  store.responses.push(response);
  writeStore(store);

  res.json({ success: true, response });
});

app.post('/api/clear-responses', (req, res) => {
  const ctx = requirePanel(req, res);
  if (!ctx) return;
  const { store, panel } = ctx;
  const surveyId = (req.body && req.body.surveyId) || req.query.surveyId;
  if (surveyId) {
    const parent = store.surveys.find((s) => s.id === surveyId);
    if (!parent || !canAccessSurvey(parent, panel.id)) {
      return res.status(404).json({ error: 'Nie ma takiej ankiety.' });
    }
    store.responses = store.responses.filter(r => r.surveyId !== surveyId);
    store.tokens.forEach(t => {
      if (t.surveyId === surveyId) {
        t.used = false;
        delete t.usedAt;
        delete t.responseId;
      }
    });
  } else {
    const ids = new Set(ownedSurveys(store, panel.id).map((s) => s.id));
    store.responses = store.responses.filter((r) => !r.surveyId || !ids.has(r.surveyId));
    store.tokens.forEach((t) => {
      if (t.surveyId && ids.has(t.surveyId)) {
        t.used = false;
        delete t.usedAt;
        delete t.responseId;
      }
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
