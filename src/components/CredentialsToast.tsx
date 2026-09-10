import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, X } from 'lucide-react';
import { HintTooltip } from './HintTooltip';
import { cmsLoginUrl } from '../utils/routerBase';

export interface CreatedCredentials {
  name: string;
  login: string;
  password: string;
  kind?: 'created' | 'password';
}

export function panelInviteMessage(login: string, password: string) {
  return [
    'Zapraszam do panelu ankiet:',
    cmsLoginUrl(),
    '',
    `Login: ${login}`,
    `Hasło: ${password}`,
  ].join('\n');
}

interface CredentialsToastProps {
  creds: CreatedCredentials | null;
  onClose: () => void;
}

function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-dk-ink/50">{label}</p>
        <p className={`text-sm text-dk-ink break-all ${mono ? 'font-mono' : 'font-semibold'}`}>{value}</p>
      </div>
      <HintTooltip text={`Kopiuje ${label.toLowerCase()} do schowka.`}>
        <button type="button" className="btn-dk-ghost !py-1.5 shrink-0" onClick={() => void copy()}>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Skopiowano' : 'Kopiuj'}</span>
        </button>
      </HintTooltip>
    </div>
  );
}

export function CredentialsToast({ creds, onClose }: CredentialsToastProps) {
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (!creds) return;
    setCopiedMsg(false);
  }, [creds]);

  if (!creds || typeof document === 'undefined') return null;

  const message = panelInviteMessage(creds.login, creds.password);
  const title = creds.kind === 'password'
    ? `Nowe hasło dla ${creds.name}`
    : `Konto dla ${creds.name} jest gotowe`;

  return createPortal(
    <div
      role="status"
      className="fixed top-4 right-4 z-[500] w-[min(100vw-1.5rem,22rem)] rounded-2xl border border-emerald-200 bg-white shadow-[0_12px_40px_rgba(43,36,64,0.18)] p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-semibold text-dk-ink leading-snug">{title}</p>
        <button
          type="button"
          className="p-1 rounded-full text-slate-400 hover:text-dk-ink hover:bg-dk-bg cursor-pointer"
          aria-label="Zamknij"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-dk-ink/70 mb-3 leading-relaxed">
        Hasło pokazuje się tylko teraz. Skopiuj i wyślij tej osobie zaproszenie do panelu.
      </p>
      <div className="space-y-3 rounded-xl bg-dk-bg/70 border border-dk-violet-soft px-3 py-3">
        <CopyRow label="Login" value={creds.login} mono />
        <CopyRow label="Hasło" value={creds.password} mono />
      </div>
      <p className="mt-3 text-[11px] text-dk-ink/70 whitespace-pre-wrap leading-relaxed border border-dk-violet-soft rounded-xl px-3 py-2 bg-white">
        {message}
      </p>
      <HintTooltip className="w-full mt-2" text="Kopiuje krótką wiadomość z linkiem do panelu, loginem i hasłem.">
        <button
          type="button"
          className="btn-dk-primary w-full"
          onClick={async () => {
            await navigator.clipboard.writeText(message);
            setCopiedMsg(true);
            setTimeout(() => setCopiedMsg(false), 2000);
          }}
        >
          {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedMsg ? 'Skopiowano wiadomość' : 'Kopiuj zaproszenie'}</span>
        </button>
      </HintTooltip>
    </div>,
    document.body,
  );
}
