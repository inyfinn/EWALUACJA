import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { DobraKaloriaMark } from './DobraKaloriaMark';
import { InyfinnCopyright } from './InyfinnCopyright';

interface AdminLoginViewProps {
  onSuccess: (password: string) => Promise<void> | void;
  onCancel: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSuccess(password);
    } catch (err: any) {
      setError(err?.message || 'Nieprawidłowe hasło.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-dk-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-dk-violet-soft">
        <div className="flex justify-center mb-[100px]">
          <DobraKaloriaMark className="h-16 w-auto max-w-[140px]" />
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-dk-violet-soft text-dk-violet-text border border-dk-violet-soft mb-2">
            <KeyRound className="w-3.5 h-3.5" /> Dostęp zastrzeżony
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-dk-ink tracking-tight">
            Panel Organizatora
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kubara Sp. z o.o.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-dk-ink/70 mb-1.5">
              Hasło
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Hasło"
                autoFocus
                autoComplete="current-password"
                className="w-full bg-dk-bg/60 border border-dk-violet-soft rounded-xl px-3.5 py-2.5 text-sm font-normal text-dk-ink placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dk-violet/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-600 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={busy || !password.trim()}
              className="w-full py-3 btn-dk-primary text-sm disabled:opacity-40"
            >
              <span>{busy ? 'Logowanie…' : 'Wejdź do panelu'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 bg-white hover:bg-dk-violet-soft text-dk-ink font-medium text-xs rounded-full transition-all cursor-pointer border border-dk-violet-soft"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
      <InyfinnCopyright />
    </div>
  );
};
