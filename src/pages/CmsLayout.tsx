import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, LogOut, Plus } from 'lucide-react';
import { setOrganizerAuthed } from './RequireAuth';

export function CmsLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    setOrganizerAuthed(false);
    navigate('/cms/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/cms" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">K</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight">Panel Ankiet</h1>
                <span className="hidden sm:inline-flex text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  CMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">Tworzenie ankiet, pola, linki i wyniki — Kubara / Inyfinn</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <NavLink
              to="/cms/new"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nowa ankieta</span>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
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
    <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
      <ClipboardList className="w-4 h-4" />
      <span>Zarządzaj ankietami jak stroną: każdy widok ma własny adres, odświeżenie i Wstecz działają.</span>
    </div>
  );
}
