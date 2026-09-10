import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function isOrganizerAuthed(): boolean {
  return typeof window !== 'undefined' && sessionStorage.getItem('kw_organizer_authed') === 'true';
}

export function setOrganizerAuthed(value: boolean) {
  if (value) sessionStorage.setItem('kw_organizer_authed', 'true');
  else sessionStorage.removeItem('kw_organizer_authed');
}

export function RequireAuth() {
  const location = useLocation();
  if (!isOrganizerAuthed()) {
    return <Navigate to="/cms/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
