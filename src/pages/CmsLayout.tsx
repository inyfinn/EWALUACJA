import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2 } from 'lucide-react';
import { DobraKaloriaMark } from '../components/DobraKaloriaMark';
import { setOrganizerAuthed } from './RequireAuth';

export function CmsLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    setOrganizerAuthed(false);
    navigate('/cms/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-dk-bg text-dk-ink font-sans antialiased">
      <header className="bg-white/90 backdrop-blur border-b border-dk-violet-soft sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/cms" className="flex items-center gap-3 min-w-0">
            <DobraKaloriaMark className="h-11 w-11" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-dk-ink">Panel Ankiet</h1>
                <span className="hidden sm:inline-flex text-[11px] font-bold bg-dk-violet-soft text-dk-violet-text px-2.5 py-0.5 rounded-full">
                  CMS
                </span>
              </div>
              <p className="text-[11px] text-dk-violet-text/70 hidden md:block">Tworzenie ankiet, pola, linki i wyniki</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <NavLink to="/cms/new" className="btn-dk-primary">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nowa ankieta</span>
            </NavLink>
            <NavLink to="/cms/trash" className="btn-dk-soft">
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosz</span>
            </NavLink>
            <button type="button" onClick={handleLogout} className="btn-dk-ghost">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wyloguj</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export function CmsHomeHint() {
  return (
    <div className="flex items-center gap-2 text-dk-violet-text text-xs mb-4 bg-dk-violet-soft/60 rounded-full px-3 py-1.5 w-fit">
      <span>Każdy widok ma własny adres — odświeżenie i Wstecz działają jak na zwykłej stronie.</span>
    </div>
  );
}
