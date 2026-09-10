import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearSession, isOrganizerAuthed } from '../utils/authSession';

export { isOrganizerAuthed } from '../utils/authSession';

export function setOrganizerAuthed(value: boolean) {
  if (!value) clearSession();
}

export function RequireAuth() {
  const location = useLocation();
  if (!isOrganizerAuthed()) {
    return <Navigate to="/cms/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
