/** API prefix that works both on localhost (`/api`) and Synology (`/panel-ankiet/api`). */
export function apiUrl(path: string): string {
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  return `${base}${trimmed}`;
}
