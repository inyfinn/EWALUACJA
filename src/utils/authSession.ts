const TOKEN_KEY = 'kw_session_token';
const PANEL_KEY = 'kw_panel';

export interface SessionPanel {
  id: string;
  name: string;
}

export function getSessionToken(): string | null {
  return typeof window === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY);
}

export function getSessionPanel(): SessionPanel | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PANEL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, panel: SessionPanel) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(PANEL_KEY, JSON.stringify(panel));
  sessionStorage.setItem('kw_organizer_authed', 'true');
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(PANEL_KEY);
  sessionStorage.removeItem('kw_organizer_authed');
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
