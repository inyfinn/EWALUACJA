import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_FILE = path.join(process.cwd(), 'data', 'survey-store.json');

interface VoterToken {
  id: string;
  code: string;
  label: string;
  used: boolean;
  usedAt?: string;
  responseId?: string;
}

interface SurveyResponse {
  id: string;
  createdAt: string;
  tokenUsed: string;
  answers: Record<string, number>;
  selectedFactors: Record<string, string[]>;
  dimensionComments?: Record<string, string>;
  collaborationContext?: string;
  teamRelation?: string;
  excludedFromReport?: boolean;
}

// ---------------------------------------------------------------------------
// Custom surveys (Survey Management System) — additive, does not touch the
// built-in Kubara survey which keeps living in top-level tokens/responses.
// ---------------------------------------------------------------------------
type CustomQuestionType =
  | 'section'
  | 'slider'
  | 'single_choice'
  | 'multi_choice'
  | 'yes_no'
  | 'yes_no_dontknow'
  | 'text';

interface CustomOption {
  value: string;
  label: string;
}

interface CustomQuestion {
  id: string;
  type: CustomQuestionType;
  title: string;
  subtitle?: string;
  help?: string;
  required?: boolean;
  // slider
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  // choices
  options?: CustomOption[];
  allowComment?: boolean;
}

interface CustomResponse {
  id: string;
  createdAt: string;
  tokenUsed?: string;
  answers: Record<string, number | string | string[]>;
  comments?: Record<string, string>;
  excludedFromReport?: boolean;
}

interface CustomSurvey {
  id: string;
  slug: string;
  title: string;
  subjectName?: string;
  companyName?: string;
  description?: string;
  introText?: string;
  status: 'active' | 'inactive';
  isAnonymous?: boolean;
  requireToken?: boolean;
  createdAt: string;
  questions: CustomQuestion[];
  tokens: VoterToken[];
  responses: CustomResponse[];
}

interface StoreData {
  tokens: VoterToken[];
  responses: SurveyResponse[];
  surveys: CustomSurvey[];
}

function getDefaultStore(): StoreData {
  return {
    tokens: [
      { id: 'token_1_kubara', code: 'KUB-1RNHC', label: 'Współpracownik 1 (Dział Produkcji / Technologii)', used: false },
      { id: 'token_2_kubara', code: 'KUB-2AB4K', label: 'Współpracownik 2 (Dział Handlowy / B2B)', used: false },
      { id: 'token_3_kubara', code: 'KUB-3M79X', label: 'Współpracownik 3 (Logistyka / Magazyn)', used: false },
      { id: 'token_4_kubara', code: 'KUB-4PT2W', label: 'Współpracownik 4 (Dział Jakości i Certyfikacji)', used: false },
      { id: 'token_5_kubara', code: 'KUB-5H83Q', label: 'Współpracownik 5 (Finanse / Administracja)', used: false },
      { id: 'token_6_kubara', code: 'KUB-6R91E', label: 'Współpracownik 6 (Projekt międzywydziałowy)', used: false },
      { id: 'token_7_kubara', code: 'KUB-7Y45Z', label: 'Współpracownik 7 (Współpracownik kluczowy)', used: false },
      { id: 'token_8_kubara', code: 'KUB-8N23L', label: 'Współpracownik 8 (Dział Obsługi Klienta)', used: false }
    ],
    responses: [],
    surveys: []
  };
}

function slugify(text: string): string {
  const map: Record<string, string> = { 'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z' };
  return (text || '')
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'ankieta';
}

function genTokenCode(prefix: string, index: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix}-${index + 1}${rand}`;
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
    if (!parsed.tokens || !Array.isArray(parsed.tokens)) parsed.tokens = getDefaultStore().tokens;
    if (!parsed.responses || !Array.isArray(parsed.responses)) parsed.responses = [];
    if (!parsed.surveys || !Array.isArray(parsed.surveys)) parsed.surveys = [];
    return parsed;
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
    tokensCount: store.tokens.length,
    responsesCount: store.responses.length,
  });
});

app.get('/api/tokens', (req, res) => {
  const store = readStore();
  res.json(store.tokens);
});

app.post('/api/tokens', (req, res) => {
  const { label } = req.body || {};
  const store = readStore();

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const code = `KUB-${store.tokens.length + 1}${rand}`;

  const newToken: VoterToken = {
    id: `token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    code,
    label: (label && typeof label === 'string' && label.trim()) ? label.trim() : `Współpracownik ${store.tokens.length + 1}`,
    used: false,
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
  res.json(store.responses);
});

app.delete('/api/responses/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const resp = store.responses.find(r => r.id === id);
  
  // Remove response
  store.responses = store.responses.filter(r => r.id !== id);
  
  // Reset any associated token
  store.tokens.forEach(t => {
    if (t.responseId === id || (resp && t.code.toUpperCase() === resp.tokenUsed.toUpperCase())) {
      t.used = false;
      delete t.usedAt;
      delete t.responseId;
    }
  });

  writeStore(store);
  res.json({ success: true });
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

app.post('/api/responses', (req, res) => {
  const response = req.body as SurveyResponse;
  if (!response || !response.tokenUsed) {
    return res.status(400).json({ success: false, error: 'Brak danych ankiety lub kodu zaproszenia.' });
  }

  const store = readStore();
  const tokenCode = response.tokenUsed.trim().toUpperCase();

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
  store.responses = [];
  store.tokens.forEach(t => {
    t.used = false;
    delete t.usedAt;
    delete t.responseId;
  });
  writeStore(store);
  res.json({ success: true });
});

// -------------------------------------------------------------
// Custom Surveys API (Survey Management System)
// -------------------------------------------------------------
const BUILTIN_ID = 'default';
const BUILTIN_TITLE = 'Ocena pracownika: Krzysztof Wieczorek';

function findSurvey(store: StoreData, id: string): CustomSurvey | undefined {
  return store.surveys.find(s => s.id === id || s.slug === id);
}

function publicSurvey(s: CustomSurvey) {
  return {
    id: s.id, slug: s.slug, title: s.title, subjectName: s.subjectName,
    companyName: s.companyName, description: s.description, introText: s.introText,
    status: s.status, isAnonymous: s.isAnonymous, requireToken: s.requireToken,
    questions: s.questions,
  };
}

// List all surveys (built-in + custom) for the management panel.
app.get('/api/surveys', (req, res) => {
  const store = readStore();
  const builtin = {
    id: BUILTIN_ID,
    builtIn: true,
    title: BUILTIN_TITLE,
    subjectName: 'Krzysztof Wieczorek',
    companyName: 'Kubara Sp. z o.o.',
    status: 'active',
    tokensCount: store.tokens.length,
    responsesCount: store.responses.length,
    createdAt: null,
  };
  const customs = store.surveys.map(s => ({
    id: s.id, builtIn: false, slug: s.slug, title: s.title,
    subjectName: s.subjectName, companyName: s.companyName, status: s.status,
    tokensCount: s.tokens.length, responsesCount: s.responses.length,
    questionsCount: s.questions.length, createdAt: s.createdAt,
  }));
  res.json({ surveys: [builtin, ...customs] });
});

// Create a custom survey.
app.post('/api/surveys', (req, res) => {
  const body = req.body || {};
  if (!body.title || !String(body.title).trim()) {
    return res.status(400).json({ success: false, error: 'Podaj nazwę ankiety.' });
  }
  const store = readStore();
  let slug = slugify(body.slug || body.title);
  const base = slug; let n = 1;
  while (store.surveys.some(s => s.slug === slug)) slug = `${base}-${++n}`;

  const survey: CustomSurvey = {
    id: `sv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slug,
    title: String(body.title).trim(),
    subjectName: body.subjectName || '',
    companyName: body.companyName || '',
    description: body.description || '',
    introText: body.introText || '',
    status: body.status === 'inactive' ? 'inactive' : 'active',
    isAnonymous: body.isAnonymous !== false,
    requireToken: Boolean(body.requireToken),
    createdAt: new Date().toISOString(),
    questions: Array.isArray(body.questions) ? body.questions : [],
    tokens: [],
    responses: [],
  };
  store.surveys.push(survey);
  writeStore(store);
  res.json({ success: true, survey });
});

// Get full custom survey (admin).
app.get('/api/surveys/:id', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  res.json({ survey: s });
});

// Public definition (for filling).
app.get('/api/surveys/:id/public', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  if (s.status !== 'active') return res.status(403).json({ success: false, error: 'Ta ankieta jest nieaktywna.' });
  res.json({ survey: publicSurvey(s) });
});

// Update custom survey (metadata + questions).
app.put('/api/surveys/:id', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  const b = req.body || {};
  if (b.title !== undefined) s.title = String(b.title).trim() || s.title;
  if (b.subjectName !== undefined) s.subjectName = b.subjectName;
  if (b.companyName !== undefined) s.companyName = b.companyName;
  if (b.description !== undefined) s.description = b.description;
  if (b.introText !== undefined) s.introText = b.introText;
  if (b.status !== undefined) s.status = b.status === 'inactive' ? 'inactive' : 'active';
  if (b.isAnonymous !== undefined) s.isAnonymous = Boolean(b.isAnonymous);
  if (b.requireToken !== undefined) s.requireToken = Boolean(b.requireToken);
  if (Array.isArray(b.questions)) s.questions = b.questions;
  writeStore(store);
  res.json({ success: true, survey: s });
});

app.delete('/api/surveys/:id', (req, res) => {
  const store = readStore();
  const before = store.surveys.length;
  store.surveys = store.surveys.filter(s => s.id !== req.params.id && s.slug !== req.params.id);
  writeStore(store);
  res.json({ success: before !== store.surveys.length });
});

// --- Custom survey tokens ---
app.get('/api/surveys/:id/tokens', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  res.json(s.tokens);
});

app.post('/api/surveys/:id/tokens', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  const prefix = (s.slug.slice(0, 3) || 'ank').toUpperCase();
  const token: VoterToken = {
    id: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    code: genTokenCode(prefix, s.tokens.length),
    label: (req.body?.label && String(req.body.label).trim()) || `Respondent ${s.tokens.length + 1}`,
    used: false,
  };
  s.tokens.push(token);
  writeStore(store);
  res.json(token);
});

app.delete('/api/surveys/:id/tokens/:tid', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  const tok = s.tokens.find(t => t.id === req.params.tid);
  if (tok) s.responses = s.responses.filter(r => r.id !== tok.responseId && r.tokenUsed !== tok.code);
  s.tokens = s.tokens.filter(t => t.id !== req.params.tid);
  writeStore(store);
  res.json({ success: true });
});

// --- Custom survey responses ---
app.get('/api/surveys/:id/responses', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  res.json(s.responses);
});

app.post('/api/surveys/:id/responses', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  if (s.status !== 'active') return res.status(403).json({ success: false, error: 'Ta ankieta jest nieaktywna.' });
  const body = req.body || {};
  const response: CustomResponse = {
    id: body.id || `resp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    tokenUsed: (body.tokenUsed || '').toString().trim().toUpperCase() || undefined,
    answers: body.answers || {},
    comments: body.comments || {},
  };

  if (s.requireToken) {
    const code = response.tokenUsed || '';
    if (!code) return res.status(400).json({ success: false, error: 'Ta ankieta wymaga kodu dostępu.' });
    const token = s.tokens.find(t => t.code.toUpperCase() === code);
    if (!token) return res.status(400).json({ success: false, error: 'Nieprawidłowy kod dostępu.' });
    if (token.used) return res.status(400).json({ success: false, error: 'Ten kod został już wykorzystany.' });
    token.used = true;
    token.usedAt = new Date().toISOString();
    token.responseId = response.id;
  } else if (response.tokenUsed) {
    const token = s.tokens.find(t => t.code.toUpperCase() === response.tokenUsed);
    if (token && !token.used) {
      token.used = true;
      token.usedAt = new Date().toISOString();
      token.responseId = response.id;
    }
  }

  s.responses.push(response);
  writeStore(store);
  res.json({ success: true, response });
});

app.delete('/api/surveys/:id/responses/:rid', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  const resp = s.responses.find(r => r.id === req.params.rid);
  s.responses = s.responses.filter(r => r.id !== req.params.rid);
  s.tokens.forEach(t => {
    if (t.responseId === req.params.rid || (resp && resp.tokenUsed && t.code.toUpperCase() === resp.tokenUsed.toUpperCase())) {
      t.used = false; delete t.usedAt; delete t.responseId;
    }
  });
  writeStore(store);
  res.json({ success: true });
});

app.patch('/api/surveys/:id/responses/:rid/exclude', (req, res) => {
  const store = readStore();
  const s = findSurvey(store, req.params.id);
  if (!s) return res.status(404).json({ success: false, error: 'Ankieta nie znaleziona.' });
  const resp = s.responses.find(r => r.id === req.params.rid);
  if (!resp) return res.status(404).json({ success: false, error: 'Odpowiedź nie znaleziona.' });
  const { excluded } = req.body || {};
  resp.excludedFromReport = excluded !== undefined ? Boolean(excluded) : !resp.excludedFromReport;
  writeStore(store);
  res.json({ success: true, response: resp });
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
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
