const TOKEN_KEY = 'kw_session_token';
const PANEL_KEY = 'kw_panel';
const FLAG_KEY = 'kw_organizer_authed';

export interface SessionPanel {
  id: string;
  name: string;
  login?: string;
}

function readKey(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const fromSession = sessionStorage.getItem(key);
  const fromLocal = localStorage.getItem(key);
  const value = fromSession || fromLocal;
  if (!value) return null;
  if (!fromSession) sessionStorage.setItem(key, value);
  if (!fromLocal) localStorage.setItem(key, value);
  return value;
}

function writeKey(key: string, value: string) {
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
}

function removeKey(key: string) {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

export function getSessionToken(): string | null {
  return readKey(TOKEN_KEY);
}

export function getSessionPanel(): SessionPanel | null {
  const raw = readKey(PANEL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token: string, panel: SessionPanel) {
  writeKey(TOKEN_KEY, token);
  writeKey(PANEL_KEY, JSON.stringify(panel));
  writeKey(FLAG_KEY, 'true');
}

export function clearSession() {
  removeKey(TOKEN_KEY);
  removeKey(PANEL_KEY);
  removeKey(FLAG_KEY);
}

export function isOrganizerAuthed(): boolean {
  return Boolean(getSessionToken() && getSessionPanel());
}

export function authHeaders(json = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const token = getSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
