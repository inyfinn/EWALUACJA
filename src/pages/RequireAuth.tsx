import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearSession, isOrganizerAuthed } from '../utils/authSession';
import { fetchSession } from '../utils/cmsApi';

export { isOrganizerAuthed } from '../utils/authSession';

export function setOrganizerAuthed(value: boolean) {
  if (!value) clearSession();
}

export function RequireAuth() {
  const location = useLocation();
  const [state, setState] = useState<'checking' | 'ok' | 'out'>(
    isOrganizerAuthed() ? 'checking' : 'out',
  );

  useEffect(() => {
    if (!isOrganizerAuthed()) {
      setState('out');
      return;
    }
    let cancelled = false;
    fetchSession()
      .then(() => {
        if (!cancelled) setState('ok');
      })
      .catch(() => {
        clearSession();
        if (!cancelled) setState('out');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'checking') {
    return <div className="text-slate-500 text-sm p-6">Wczytywanie panelu…</div>;
  }
  if (state === 'out') {
    return <Navigate to="/cms/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
