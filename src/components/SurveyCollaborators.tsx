import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Copy, Eye, EyeOff, KeyRound, UserPlus, Users, X } from 'lucide-react';
import { ManagedSurvey } from '../types';
import {
  createPanelApi,
  deleteManagedPanel,
  fetchManagedPanels,
  fetchPanels,
  NameTakenError,
  resetManagedPanelPassword,
  updateSurveyApi,
  type CmsPanel,
} from '../utils/cmsApi';
import { getSessionPanel } from '../utils/authSession';
import { HintTooltip } from './HintTooltip';
import { ConfirmPopover } from './ConfirmPopover';
import { CredentialsToast, panelInviteMessage, type CreatedCredentials } from './CredentialsToast';

const CREATE_VALUE = '__create__';

interface SurveyCollaboratorsProps {
  survey: ManagedSurvey;
  onUpdated: () => Promise<void> | void;
}

export function SurveyCollaborators({ survey, onUpdated }: SurveyCollaboratorsProps) {
  const me = getSessionPanel();
  const [panels, setPanels] = useState<CmsPanel[]>([]);
  const [managed, setManaged] = useState<CmsPanel[]>([]);
  const [pickId, setPickId] = useState('');
  const [newName, setNewName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<CreatedCredentials | null>(null);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reloadLists = async () => {
    const [all, mine] = await Promise.all([fetchPanels(), fetchManagedPanels()]);
    setPanels(all);
    setManaged(mine);
  };

  useEffect(() => {
    reloadLists().catch((e) => setError(e.message || 'Nie udało się wczytać listy paneli.'));
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

  const handleAddOrCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (pickId === CREATE_VALUE) {
      const name = newName.trim();
      if (name.length < 2) return;
      setBusy(true);
      setError(null);
      setSuggestions([]);
      try {
        const person = await createPanelApi(name, survey.id);
        setToast({
          name: person.name,
          password: person.password,
          kind: 'created',
        });
        setNewName('');
        setPickId('');
        await reloadLists();
        await onUpdated();
      } catch (err: any) {
        if (err instanceof NameTakenError) {
          setError(err.message);
          setSuggestions(err.suggestions);
        } else {
          setError(err.message || 'Nie udało się utworzyć osoby z panelem.');
        }
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!pickId || ownerIds.includes(pickId)) return;
    await saveOwners([...ownerIds, pickId]);
  };

  const handleRemove = async (id: string) => {
    if (ownerIds.length <= 1) return;
    await saveOwners(ownerIds.filter((oid) => oid !== id));
  };

  const handleResetPassword = async (person: CmsPanel) => {
    setBusy(true);
    setError(null);
    try {
      const next = await resetManagedPanelPassword(person.id);
      setManaged((list) => list.map((p) => (p.id === next.id ? { ...p, password: next.password } : p)));
      setToast({
        name: next.name,
        password: next.password,
        kind: 'password',
      });
    } catch (e: any) {
      setError(e.message || 'Nie udało się wygenerować nowego hasła.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteManaged = async (person: CmsPanel) => {
    setBusy(true);
    setError(null);
    try {
      await deleteManagedPanel(person.id);
      await reloadLists();
      await onUpdated();
    } catch (e: any) {
      setError(e.message || 'Nie udało się usunąć tej osoby.');
    } finally {
      setBusy(false);
    }
  };

  const copyInvite = async (person: CmsPanel) => {
    if (!person.password) return;
    await navigator.clipboard.writeText(panelInviteMessage(person.password));
    setCopiedId(person.id);
    setTimeout(() => setCopiedId((id) => (id === person.id ? null : id)), 2000);
  };

  const creating = pickId === CREATE_VALUE;
  const canSubmit = creating ? newName.trim().length >= 2 : Boolean(pickId);

  return (
    <>
      <CredentialsToast creds={toast} onClose={() => setToast(null)} />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
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

          <form onSubmit={handleAddOrCreate} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={pickId}
                onChange={(e) => {
                  setPickId(e.target.value);
                  if (e.target.value !== CREATE_VALUE) {
                    setNewName('');
                    setSuggestions([]);
                  }
                }}
                disabled={busy}
                className="flex-1 min-w-[180px] px-4 py-2.5 rounded-2xl border border-dk-violet-soft text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dk-violet/40 bg-dk-bg/50"
                aria-label="Dodaj współpracownika panelu"
              >
                <option value="">Dodaj osobę do tej ankiety…</option>
                <option value={CREATE_VALUE}>Utwórz użytkownika</option>
                {candidates.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {!creating && (
                <HintTooltip text="Daje wybranej osobie dostęp do tej ankiety. Nie tworzy nowego hasła.">
                  <button
                    type="submit"
                    disabled={busy || !canSubmit}
                    className="btn-dk-ghost shrink-0 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Dodaj współpracownika</span>
                  </button>
                </HintTooltip>
              )}
            </div>
            {creating && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setSuggestions([]);
                  }}
                  disabled={busy}
                  placeholder="Nazwa"
                  autoFocus
                  className="flex-1 min-w-[180px] px-4 py-2.5 rounded-2xl border border-dk-violet-soft text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dk-violet/40 bg-dk-bg/50"
                  aria-label="Nazwa nowego użytkownika"
                />
                <HintTooltip text="Tworzy konto. Ta osoba wejdzie do panelu samym hasłem.">
                  <button
                    type="submit"
                    disabled={busy || !canSubmit}
                    className="btn-dk-primary shrink-0 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Utwórz</span>
                  </button>
                </HintTooltip>
              </div>
            )}
            {creating && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="btn-dk-ghost !py-1 !px-3"
                    onClick={() => {
                      setNewName(name);
                      setSuggestions([]);
                      setError(null);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </form>

          {error && (
            <div className="mt-3 text-xs font-semibold rounded-xl px-3 py-2 border bg-rose-50 text-rose-900 border-rose-200">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-dk-violet-soft text-dk-violet-text flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-dk-ink text-base">Osoby, które dodałeś</h3>
              <p className="text-xs text-dk-ink/70 mt-1 max-w-[70ch] leading-relaxed">
                Tu zawsze zobaczysz hasło osób utworzonych z Twojego konta. Możesz je skopiować, wysłać zaproszenie, zmienić albo usunąć konto.
              </p>
            </div>
          </div>

          {managed.length === 0 ? (
            <p className="text-xs text-dk-ink/50">
              Nikogo jeszcze nie utworzyłeś. Wybierz „Utwórz użytkownika” w kafelku obok.
            </p>
          ) : (
            <ul className="space-y-2">
              {managed.map((person) => {
                const visible = Boolean(showPass[person.id]);
                return (
                  <li
                    key={person.id}
                    className="rounded-2xl border border-dk-violet-soft bg-dk-bg/40 px-3 py-2.5 space-y-2"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-dk-ink break-words">{person.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <HintTooltip text="Kopiuje wiadomość z linkiem do panelu i hasłem, żeby wkleić np. na Teams.">
                          <button
                            type="button"
                            className="btn-dk-ghost !py-1.5"
                            disabled={busy || !person.password}
                            onClick={() => void copyInvite(person)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedId === person.id ? 'Skopiowano' : 'Wyślij'}
                          </button>
                        </HintTooltip>
                        <HintTooltip text="Generuje nowe hasło. Stare przestaje działać.">
                          <ConfirmPopover
                            message={`Wygenerować nowe hasło dla ${person.name}? Stare hasło przestanie działać.`}
                            confirmLabel="Nowe hasło"
                            onConfirm={() => handleResetPassword(person)}
                          >
                            <button type="button" className="btn-dk-ghost !py-1.5" disabled={busy}>
                              Zmień hasło
                            </button>
                          </ConfirmPopover>
                        </HintTooltip>
                        <HintTooltip text="Usuwa konto tej osoby. Zniknie też z dostępów do ankiet.">
                          <ConfirmPopover
                            message={`Usunąć konto ${person.name}? Ta osoba nie zaloguje się już do panelu.`}
                            confirmLabel="Usuń konto"
                            onConfirm={() => handleDeleteManaged(person)}
                          >
                            <button type="button" className="btn-dk-danger !py-1.5" disabled={busy}>
                              Usuń
                            </button>
                          </ConfirmPopover>
                        </HintTooltip>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-white border border-dk-violet-soft text-sm font-mono text-dk-ink break-all">
                        {visible ? (person.password || '') : '••••••••'}
                      </code>
                      <HintTooltip text={visible ? 'Ukrywa hasło.' : 'Pokazuje hasło tej osoby.'}>
                        <button
                          type="button"
                          className="btn-dk-ghost !py-1.5"
                          onClick={() => setShowPass((m) => ({ ...m, [person.id]: !visible }))}
                          aria-label={visible ? 'Ukryj hasło' : 'Pokaż hasło'}
                        >
                          {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </HintTooltip>
                      <HintTooltip text="Kopiuje hasło do schowka.">
                        <button
                          type="button"
                          className="btn-dk-ghost !py-1.5"
                          disabled={!person.password}
                          onClick={async () => {
                            if (!person.password) return;
                            await navigator.clipboard.writeText(person.password);
                            setCopiedId(`pw-${person.id}`);
                            setTimeout(() => setCopiedId((id) => (id === `pw-${person.id}` ? null : id)), 2000);
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedId === `pw-${person.id}` ? 'OK' : 'Hasło'}
                        </button>
                      </HintTooltip>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
