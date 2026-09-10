import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2 } from 'lucide-react';
import { DobraKaloriaMark } from '../components/DobraKaloriaMark';
import { InyfinnCopyright } from '../components/InyfinnCopyright';
import { HintTooltip } from '../components/HintTooltip';
import { clearSession, getSessionPanel } from '../utils/authSession';

export function CmsLayout() {
  const navigate = useNavigate();
  const panel = getSessionPanel();

  const handleLogout = () => {
    clearSession();
    navigate('/cms/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-dk-bg text-dk-ink font-sans antialiased flex flex-col">
      <header className="bg-white/90 backdrop-blur border-b border-dk-violet-soft sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 min-w-0">
          <Link to="/cms" className="flex items-center gap-3 min-w-0 overflow-hidden">
            <DobraKaloriaMark className="h-11 w-auto max-w-[88px]" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-semibold text-sm sm:text-base tracking-tight text-dk-ink">Panel Ankiet</h1>
                {panel?.name && (
                  <span className="hidden sm:inline-flex text-[11px] font-medium bg-dk-violet-soft text-dk-violet-text px-2.5 py-0.5 rounded-full">
                    {panel.name}
                  </span>
                )}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <HintTooltip side="bottom" text="Otwiera kreator: nazwa, szablon i nowa ankieta w Twoim panelu.">
              <NavLink to="/cms/new" className="btn-dk-primary">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nowa ankieta</span>
              </NavLink>
            </HintTooltip>
            <HintTooltip side="bottom" text="Zamyka sesję. Żeby wrócić do panelu, trzeba ponownie wpisać hasło.">
              <button type="button" onClick={handleLogout} className="btn-dk-ghost">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Wyloguj</span>
              </button>
            </HintTooltip>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full pb-24">
        <Outlet />
      </main>
      <HintTooltip className="fixed bottom-5 right-5 z-40" text="Kosz: przywracasz usunięte ankiety i odpowiedzi albo kasujesz je na zawsze.">
        <Link
          to="/cms/trash"
          className="w-12 h-12 rounded-full bg-white border border-dk-violet-soft text-dk-ink shadow-md hover:bg-dk-violet-soft flex items-center justify-center"
          aria-label="Kosz"
        >
          <Trash2 className="w-5 h-5" />
        </Link>
      </HintTooltip>
      <InyfinnCopyright />
    </div>
  );
}
