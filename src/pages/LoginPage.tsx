import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AdminLoginView } from '../components/AdminLoginView';
import { isOrganizerAuthed, setOrganizerAuthed } from './RequireAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/cms';

  if (isOrganizerAuthed()) {
    return <Navigate to="/cms" replace />;
  }

  return (
    <AdminLoginView
      onSuccess={() => {
        setOrganizerAuthed(true);
        navigate(from.startsWith('/cms') ? from : '/cms', { replace: true });
      }}
      onCancel={() => navigate('/cms', { replace: true })}
    />
  );
}
