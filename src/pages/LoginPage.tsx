import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AdminLoginView } from '../components/AdminLoginView';
import { isOrganizerAuthed, setSession } from '../utils/authSession';
import { loginWithPassword } from '../utils/cmsApi';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/cms';

  if (isOrganizerAuthed()) {
    return <Navigate to="/cms" replace />;
  }

  return (
    <AdminLoginView
      onSuccess={async ({ login, password }) => {
        const data = await loginWithPassword(password, login);
        setSession(data.token, data.panel);
        navigate(from.startsWith('/cms') ? from : '/cms', { replace: true });
      }}
      onCancel={() => navigate('/cms/login', { replace: true })}
    />
  );
}
