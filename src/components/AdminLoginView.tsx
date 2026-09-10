import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { DobraKaloriaMark } from './DobraKaloriaMark';
import { InyfinnCopyright } from './InyfinnCopyright';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const VALID_PASSWORDS = [
  'kubara',
  'kubara2025',
  'krzysztof',
  'wieczorek',
  'admin',
  '1234'
];

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = password.trim().toLowerCase();
    
    if (VALID_PASSWORDS.includes(clean)) {
      setError(null);
      onSuccess();
    } else {
      setError('Nieprawidłowe hasło organizatora. Sprawdź i spróbuj ponownie.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
        <div className="flex justify-center mb-4">
          <DobraKaloriaMark className="h-16 w-auto max-w-[140px]" />
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200 mb-2">
            <KeyRound className="w-3.5 h-3.5" /> Dostęp Zastrzeżony
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Panel Organizatora
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Krzysztof Wieczorek • Kubara Sp. z o.o.
          </p>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Ten obszar zawiera kody, odpowiedzi i raport ewaluacji pracownika.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Hasło organizatora:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Wpisz hasło (np. kubara)..."
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10"
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
            <p className="text-[11px] text-slate-400 mt-2">
              Domyślne hasło dostępu: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">kubara</code>
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-3 btn-dk-primary text-sm"
            >
              <span>Odblokuj Panel Organizatora</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
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
