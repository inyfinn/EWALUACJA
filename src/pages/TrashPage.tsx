import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrashStore } from '../types';
import { emptyTrashResponse, emptyTrashSurvey, fetchTrash, restoreResponseApi, restoreSurveyApi } from '../utils/cmsApi';
import { HintTooltip } from '../components/HintTooltip';
import { ConfirmPopover } from '../components/ConfirmPopover';

export function TrashPage() {
  const [trash, setTrash] = useState<TrashStore>({ surveys: [], responses: [] });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setTrash(await fetchTrash());
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Kosz</h2>
        <p className="text-sm text-slate-600 mt-1">
          Usunięte ankiety i odpowiedzi lądują tutaj. Przywrócenie wyniku pamięta, z której ankiety pochodził.
        </p>
      </div>
      {notice && (
        <div className="text-sm bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl px-4 py-3 font-medium">{notice}</div>
      )}
      {error && <div className="text-sm text-rose-700">{error}</div>}

      <section className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold">Usunięte ankiety</h3>
        {trash.surveys.length === 0 && <p className="text-xs text-slate-500">Pusto.</p>}
        {trash.surveys.map((item) => (
          <div key={item.survey.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-100 rounded-2xl p-3">
            <div>
              <div className="font-bold text-sm">{item.survey.title}</div>
              <div className="text-[11px] text-slate-500">Usunięto {new Date(item.deletedAt).toLocaleString('pl-PL')}</div>
            </div>
            <div className="flex gap-2">
              <HintTooltip text="Wraca ankietę na listę razem z odpowiedziami, które były w koszu.">
                <button
                  type="button"
                  className="btn-dk-primary"
                  onClick={async () => {
                    await restoreSurveyApi(item.survey.id);
                    setNotice(`Przywrócono ankietę „${item.survey.title}” wraz z jej odpowiedziami z kosza.`);
                    await load();
                  }}
                >
                  Przywróć
                </button>
              </HintTooltip>
              <HintTooltip text="Kasuje ankietę z kosza na stałe. Tego nie da się cofnąć.">
                <ConfirmPopover
                  message={`Usunąć „${item.survey.title}” z kosza na stałe? Tego nie da się cofnąć.`}
                  confirmLabel="Usuń na zawsze"
                  onConfirm={async () => {
                    await emptyTrashSurvey(item.survey.id);
                    await load();
                  }}
                >
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl text-rose-700 text-xs font-bold cursor-pointer"
                >
                  Usuń na zawsze
                </button>
                </ConfirmPopover>
              </HintTooltip>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold">Usunięte odpowiedzi</h3>
        {trash.responses.length === 0 && <p className="text-xs text-slate-500">Pusto.</p>}
        {trash.responses.map((item) => (
          <div key={item.response.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-100 rounded-2xl p-3">
            <div>
              <div className="font-bold text-sm">Kod {item.response.tokenUsed}</div>
              <div className="text-[11px] text-slate-500">
                Była w ankiecie: <strong>{item.surveyTitle}</strong> · {new Date(item.deletedAt).toLocaleString('pl-PL')}
              </div>
            </div>
            <div className="flex gap-2">
              <HintTooltip text="Oddaje tę odpowiedź do ankiety. Jeśli ankiety nie ma, wróci jako zarchiwizowana.">
                <button
                  type="button"
                  className="btn-dk-primary"
                  onClick={async () => {
                    const result = await restoreResponseApi(item.response.id);
                    setNotice(result.message);
                    await load();
                  }}
                >
                  Przywróć
                </button>
              </HintTooltip>
              <HintTooltip text="Kasuje tę odpowiedź z kosza na stałe.">
                <ConfirmPopover
                  message="Usunąć tę odpowiedź z kosza na zawsze? Tego nie da się cofnąć."
                  confirmLabel="Usuń na zawsze"
                  onConfirm={async () => {
                    await emptyTrashResponse(item.response.id);
                    await load();
                  }}
                >
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl text-rose-700 text-xs font-bold cursor-pointer"
                >
                  Usuń na zawsze
                </button>
                </ConfirmPopover>
              </HintTooltip>
            </div>
          </div>
        ))}
      </section>

      <HintTooltip text="Wraca do listy ankiet.">
        <Link to="/cms" className="text-xs font-bold text-indigo-700">← Wróć do ankiet</Link>
      </HintTooltip>
    </div>
  );
}
