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
}

interface StoreData {
  tokens: VoterToken[];
  responses: SurveyResponse[];
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
    responses: []
  };
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
  store.tokens = store.tokens.filter(t => t.id !== id);
  writeStore(store);
  res.json({ success: true });
});

app.get('/api/responses', (req, res) => {
  const store = readStore();
  res.json(store.responses);
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
