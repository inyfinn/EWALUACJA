import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, Copy, UserPlus, Users, X } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { createPanelApi, fetchPanels, updateSurveyApi, type CmsPanel } from '../utils/cmsApi';
import { getSessionPanel } from '../utils/authSession';
import { HintTooltip } from './HintTooltip';
import { ConfirmPopover } from './ConfirmPopover';

interface SurveyCollaboratorsProps {
  survey: ManagedSurvey;
  onUpdated: () => Promise<void> | void;
}

export function SurveyCollaborators({ survey, onUpdated }: SurveyCollaboratorsProps) {
  const me = getSessionPanel();
  const [panels, setPanels] = useState<CmsPanel[]>([]);
  const [pickId, setPickId] = useState('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const reloadPanels = async () => {
    setPanels(await fetchPanels());
  };

  useEffect(() => {
    reloadPanels().catch((e) => setError(e.message || 'Nie udało się wczytać listy paneli.'));
  }, []);

  const ownerIds = survey.ownerIds || [];
  const owners = useMemo(
    () => ownerIds.map((id) => panels.find((p) => p.id === id) || { id, name: id }),
    [ownerIds, panels],
  );
  const candidates = panels.filter((p) => !ownerIds.includes(p.id));

  const saveOwners = async (next: string[]) => {
    setBusy(true);
    setError(null);
    try {
      await updateSurveyApi(survey.id, { ownerIds: next });
      await onUpdated();
      setPickId('');
    } catch (e: any) {
      setError(e.message || 'Nie udało się zapisać dostępu.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddExisting = async (e: FormEvent) => {
    e.preventDefault();
    if (!pickId || ownerIds.includes(pickId)) return;
    await saveOwners([...ownerIds, pickId]);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (name.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const person = await createPanelApi(name, survey.id);
      setCreated({ name: person.name, password: person.password });
      setCopied(false);
      setNewName('');
      await reloadPanels();
      await onUpdated();
    } catch (e: any) {
      setError(e.message || 'Nie udało się utworzyć osoby z panelem.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (ownerIds.length <= 1) return;
    await saveOwners(ownerIds.filter((oid) => oid !== id));
  };

  const copyPassword = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-dk-violet-soft text-dk-violet-text flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-dk-ink text-base">Współpracownicy panelu</h3>
          <p className="text-xs text-dk-ink/70 mt-1 max-w-[70ch] leading-relaxed">
            Te osoby mają hasło do Panelu Ankiet i mogą otworzyć tę ankietę: treść, linki i wyniki.
            To nie jest zaproszenie do wypełnienia formularza.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {owners.map((person) => {
          const isMe = me?.id === person.id;
          const canRemove = ownerIds.length > 1 && !busy;
          return (
            <span
              key={person.id}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-dk-bg border border-dk-violet-soft text-xs font-semibold text-dk-ink"
            >
              {person.name}
              {isMe && <span className="font-medium text-dk-ink/50">(Ty)</span>}
              {canRemove ? (
                <HintTooltip text="Zabiera tej osobie dostęp do ankiety w panelu. Linki ankietowanych zostają.">
                  <ConfirmPopover
                    message={
                      isMe
                        ? `Usunąć siebie z dostępu do „${survey.title}”? Ankieta zniknie z Twojej listy.`
                        : `Zabrać ${person.name} dostęp do panelu tej ankiety? Linki ankietowanych zostają.`
                    }
                    confirmLabel="Zabierz dostęp"
                    onConfirm={() => handleRemove(person.id)}
                  >
                    <button
                      type="button"
                      className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      aria-label={`Usuń dostęp: ${person.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </ConfirmPopover>
                </HintTooltip>
              ) : null}
            </span>
          );
        })}
      </div>

      {candidates.length > 0 && (
        <form onSubmit={handleAddExisting} className="flex flex-wrap items-center gap-2 mb-3">
          <select
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
            disabled={busy}
            className="flex-1 min-w-[180px] px-4 py-2.5 rounded-2xl border border-dk-violet-soft text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dk-violet/40 bg-dk-bg/50"
            aria-label="Wybierz współpracownika panelu"
          >
            <option value="">Wybierz osobę, która już ma panel…</option>
            {candidates.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <HintTooltip text="Daje wybranej osobie dostęp do tej ankiety. Nie tworzy nowego hasła.">
            <button
              type="submit"
              disabled={busy || !pickId}
              className="btn-dk-ghost shrink-0 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Dodaj współpracownika</span>
            </button>
          </HintTooltip>
        </form>
      )}

      <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={busy}
          placeholder="Imię nowej osoby (np. Magda)…"
          className="flex-1 min-w-[180px] px-4 py-2.5 rounded-2xl border border-dk-violet-soft text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dk-violet/40 bg-dk-bg/50"
        />
        <HintTooltip text="Tworzy konto do logowania. Hasło wygeneruje się samo. Przekaż je tej osobie.">
          <button
            type="submit"
            disabled={busy || newName.trim().length < 2}
            className="btn-dk-primary shrink-0 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>Utwórz osobę z panelem</span>
          </button>
        </HintTooltip>
      </form>

      {created && (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-950">
            Konto dla {created.name} jest gotowe. Hasło pokazuje się tylko teraz. Przekaż je tej osobie, żeby mogła się zalogować.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-sm font-mono text-dk-ink">
              {created.password}
            </code>
            <HintTooltip text="Kopiuje wygenerowane hasło do schowka.">
              <button type="button" className="btn-dk-ghost !py-1.5" onClick={() => void copyPassword()}>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Skopiowano' : 'Kopiuj hasło'}</span>
              </button>
            </HintTooltip>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-xs font-semibold rounded-xl px-3 py-2 border bg-rose-50 text-rose-900 border-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}
