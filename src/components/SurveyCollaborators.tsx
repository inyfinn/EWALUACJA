import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { UserPlus, Users, X } from 'lucide-react';
import { ManagedSurvey } from '../types';
import { fetchPanels, updateSurveyApi, type CmsPanel } from '../utils/cmsApi';
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPanels()
      .then(setPanels)
      .catch((e) => setError(e.message || 'Nie udało się wczytać listy paneli.'));
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

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!pickId || ownerIds.includes(pickId)) return;
    await saveOwners([...ownerIds, pickId]);
  };

  const handleRemove = async (id: string) => {
    if (ownerIds.length <= 1) return;
    await saveOwners(ownerIds.filter((oid) => oid !== id));
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

      {candidates.length > 0 ? (
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
          <select
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
            disabled={busy}
            className="flex-1 min-w-[180px] px-4 py-2.5 rounded-2xl border border-dk-violet-soft text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dk-violet/40 bg-dk-bg/50"
            aria-label="Wybierz współpracownika panelu"
          >
            <option value="">Wybierz osobę z panelem…</option>
            {candidates.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <HintTooltip text="Daje wybranej osobie dostęp do tej ankiety w Panelu Ankiet. Nie tworzy linku do wypełnienia.">
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
      ) : (
        <p className="text-xs text-slate-500">Wszyscy, którzy mają panel, już mają dostęp do tej ankiety.</p>
      )}

      {error && (
        <div className="mt-3 text-xs font-semibold rounded-xl px-3 py-2 border bg-rose-50 text-rose-900 border-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}
