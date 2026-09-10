/** React Router basename: `/panel-ankiet` on NAS, empty on localhost. */
export function routerBasename(): string | undefined {
  const raw = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  if (!raw || raw === '/') return undefined;
  return raw;
}

export function publicOriginBase(): string {
  if (typeof window === 'undefined') return '';
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  return `${window.location.origin}${base}`;
}

export function fillUrl(slug: string, tokenCode?: string): string {
  const clean = String(slug || '').replace(/^\/+|\/+$/g, '');
  const url = `${publicOriginBase()}s/${clean}`;
  if (!tokenCode) return url;
  return `${url}?token=${encodeURIComponent(tokenCode.trim().toUpperCase())}`;
}

export const PREVIEW_FILL_TOKEN = 'PODGLAD';
