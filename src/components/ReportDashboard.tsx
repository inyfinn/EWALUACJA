import React, { useRef, useState } from 'react';
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  ShieldCheck,
  FileText,
  ChevronRight,
  Printer,
  Users,
  Layers,
  Sparkles,
  Check,
  Star,
  Compass,
  Target,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  EyeOff
} from 'lucide-react';
import { DimensionStats, DimensionKey, SurveyResponse, SurveyQuestion, FactorCount, VoterToken } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toggleExcludeResponseAsync, deleteSingleResponseAsync } from '../utils/surveyStorage';

interface ReportDashboardProps {
  stats: {
    overallAverage: number;
    overallAverage5: number;
    totalResponses: number;
    dimensions: Record<DimensionKey, DimensionStats>;
    readyForManagerMeeting: boolean;
    salaryReadinessScore: number;
    topGlobalDrivers: FactorCount[];
    topImprovementGlobal: FactorCount[];
    keyTalkingPoints: string[];
    employeeArchetype: { title: string; description: string; };
    competencyProfile: { relational: number; execution: number; quality: number; initiative: number; };
  };
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  tokens?: VoterToken[];
  onRefreshData?: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  stats,
  questions,
  responses,
  tokens,
  onRefreshData,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const dimensionList: DimensionStats[] = [
    stats.dimensions.komunikacja,
    stats.dimensions.terminowosc,
    stats.dimensions.jakosc,
    stats.dimensions.wklad_wlasny,
  ];

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = `Ewaluacja_Roczna_Krzysztof_Wieczorek_Kubara_${new Date().toISOString().slice(0, 10)}.pdf`;
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: filename });
          return;
        } catch {
          // ignore and proceed to download
        }
      }

      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1500);
    } catch (err) {
      console.error('PDF export failed', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getScoreColor = (avg: number) => {
    if (avg >= 8.5) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (avg >= 7.0) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    if (avg >= 5.0) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getScoreBgBar = (avg: number) => {
    if (avg >= 8.5) return 'bg-emerald-500';
    if (avg >= 7.0) return 'bg-indigo-500';
    if (avg >= 5.0) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar / Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <BarChart3 className="w-3.5 h-3.5" /> Raport Zbiorczy Ewaluacji 360
            </span>
            <span className="text-xs font-semibold text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Kubara Sp. z o.o.</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Ocena pracownika: Krzysztof Wieczorek – Wyniki Roczne
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {stats.totalResponses > 0 ? (
              <>Zagregowane wyniki z 4 kluczowych pól z <strong className="text-slate-700 font-semibold">{stats.totalResponses} anonimowych ankiet</strong> współpracowników.</>
            ) : (
              <>Oczekiwanie na pierwsze anonimowe odpowiedzi od współpracowników. Przejdź do zakładki <strong>„Kody Zaproszeń”</strong>, aby rozesłać formularz.</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || stats.totalResponses === 0}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98 ${
              stats.totalResponses > 0
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isGeneratingPdf ? <Printer className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Pobierz Raport PDF</span>
          </button>
        </div>
      </div>

      {/* Printable / Viewable Report Canvas */}
      <div ref={reportRef} className="space-y-6">
        
        {/* Bento Grid: Executive Metrics and Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-5">
          {/* Main Title & Context Tile - Col 6 */}
          <div className="md:col-span-3 lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Podsumowanie Współpracy
                </span>
                <span className="text-xs text-slate-400">Kubara Sp. z o.o.</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Bilans 1 Roku Współpracy: Krzysztof Wieczorek
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Raport szczegółowo analizuje <strong>4 filary wskazane przez przełożonego</strong>: Komunikację, Terminowość, Jakość pracy oraz Wkład własny i zaangażowanie. Pokazuje mocne strony, zadowolenie zespołu ze współpracy oraz obszary zidentyfikowane do dalszego rozwoju.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Status gotowości raportu:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full border ${stats.readyForManagerMeeting ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {stats.readyForManagerMeeting ? '✓ Zebrano wystarczającą próbę ankiet' : `Otrzymano ${stats.totalResponses} z zalecanych min. 3`}
              </span>
            </div>
          </div>

          {/* Metric Bento Tile: Overall Average (1-10 & 1-5) - Col 3 */}
          <div className="md:col-span-1 lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Średnia Ogólna (1-10)
            </span>
            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stats.overallAverage > 0 ? stats.overallAverage : '0.0'}
              </div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">
                odpowiednik: {stats.overallAverage5 > 0 ? stats.overallAverage5 : '0.0'} / 5.0 ★
              </div>
            </div>
            <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${stats.overallAverage > 0 ? getScoreColor(stats.overallAverage) : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              {stats.overallAverage >= 8.5 ? 'Wzorowy standard współpracy' : stats.overallAverage >= 7.0 ? 'Bardzo wysoki poziom' : stats.overallAverage > 0 ? 'Stabilny standard' : 'Oczekiwanie na pierwsze głosy'}
            </div>
          </div>

          {/* Metric Bento Tile: Submissions & Sample - Col 3 */}
          <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Głosy Współpracowników
              </span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>

            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stats.totalResponses}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">oddanych anonimowych ocen</div>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-150">
              🔒 100% tokeny anty-duplikatowe
            </div>
          </div>
        </div>

        {/* Bento Card: Top Behavioral Drivers (Główne atuty) */}
        {stats.topGlobalDrivers.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Głos Zespołu: Zadowolenie ze Współpracy
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">
                  Główne Atuty i Doceniane Cechy Krzysztofa Wieczorka
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                % współpracowników, którzy wskazali ten punkt
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.topGlobalDrivers.map((driver, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex items-start justify-between gap-3 shadow-2xs hover:bg-emerald-50/80 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
      {driver.text.includes(':') ? (
        <>
          <span className="font-black text-emerald-800">{driver.text.split(':')[0]}</span>
          <span className="font-normal text-slate-600">{driver.text.split(':').slice(1).join(':').trim()}</span>
        </>
      ) : (
        <span>{driver.text}</span>
      )}
   </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-xl font-mono">
                      {driver.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registered Surveys & Response Management (Exclude/Delete) */}
        {responses.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                    Nadesłane Ankiety i Zarządzanie Wynikami ({responses.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aktywne w raporcie: <strong className="text-slate-800 font-semibold">{stats.totalResponses}</strong> • Wykluczone z wyliczeń: <strong className="text-slate-800 font-semibold">{responses.length - stats.totalResponses}</strong>
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-150">
                💡 Możesz wykluczyć ankietę testową ze statystyk lub usunąć ją całkowicie.
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {responses.map((resp, i) => {
                const token = tokens?.find(t => t.responseId === resp.id || t.code.trim().toUpperCase() === resp.tokenUsed.trim().toUpperCase());
                const isExcluded = Boolean(resp.excludedFromReport);

                // Compute quick respondent average
                const subScores: number[] = [];
                questions.forEach((q, qIdx) => {
                  q.subQuestions.forEach((sq, sqIdx) => {
                    if (typeof resp.answers?.[sq.id] === 'number') {
                      subScores.push(resp.answers[sq.id] as number);
                      return;
                    }
                    const dimIdx = qIdx + 1;
                    const letter = String.fromCharCode(97 + sqIdx);
                    const fallbacks = [`q${dimIdx}_${letter}`, `q${dimIdx}_${sqIdx + 1}`, `${q.dimension}_${sqIdx + 1}`];
                    for (const fb of fallbacks) {
                      if (typeof resp.answers?.[fb] === 'number') {
                        subScores.push(resp.answers[fb] as number);
                        return;
                      }
                    }
                  });
                });
                const respAvg = subScores.length > 0 ? (subScores.reduce((a, b) => a + b, 0) / subScores.length).toFixed(1) : '—';

                return (
                  <div key={resp.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5">#{i + 1}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {token?.label || `Współpracownik (${resp.tokenUsed})`}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                            kod: {resp.tokenUsed}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(resp.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          {isExcluded ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <EyeOff className="w-3 h-3 text-amber-700" />
                              Wykluczona z raportu (Test)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              ✓ Wliczana do raportu
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            Średnia: <strong>{respAvg}</strong>/10
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleExcludeResponseAsync(resp.id, !isExcluded);
                          onRefreshData?.();
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isExcluded
                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                        title={isExcluded ? "Przywróć tę ankietę do wyliczeń raportu" : "Oznacz tę ankietę jako test i wyklucz ze średnich"}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{isExcluded ? 'Przywróć do raportu' : 'Nie uwzględniaj (np. Test)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Czy na pewno chcesz bezpowrotnie usunąć tę ankietę (${resp.tokenUsed}) z bazy danych? Odpowiedź zniknie, a kod zaproszenia zostanie odblokowany.`)) {
                            await deleteSingleResponseAsync(resp.id);
                            onRefreshData?.();
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                        title="Usuń tę ankietę z bazy"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Usuń wynik</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state notification if 0 active responses */}
        {stats.totalResponses === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {responses.length > 0 
                ? 'Wszystkie przesłane odpowiedzi są obecnie wykluczone z raportu' 
                : 'Raport jest czysty i oczekuje na pierwsze głosy'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              {responses.length > 0 ? (
                <>W bazie znajduje się {responses.length} wypełnionych ankiet oznaczonych jako testowe. Kliknij przycisk <strong>„Przywróć do raportu”</strong> na liście powyżej, aby uwzględnić je w wyliczeniach.</>
              ) : (
                <>Nikt jeszcze nie wypełnił ankiety. Wszystkie wskaźniki i oceny wynoszą 0.0. Przejdź do zakładki <strong>„1. Kody i Linki do Rozesłania”</strong>, aby przekazać linki współpracownikom.</>
              )}
            </p>
          </div>
        )}

        {/* Strategic Talking Points Bento Card: Wnioski i Rozwój */}
        {stats.totalResponses > 0 && stats.keyTalkingPoints.length > 0 && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Kluczowe Wnioski z Raportu
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Rzetelne podsumowanie oparte na faktach zebranych w ankietach:
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {stats.keyTalkingPoints.map((point, i) => (
                    <div key={i} className="text-xs sm:text-sm text-slate-800 font-medium bg-white p-3.5 rounded-2xl border border-slate-200 flex items-start gap-2.5 shadow-2xs leading-snug">
                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4 Dimension Breakdown - Bento Grid 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dimensionList.map(dim => {
            const avg = dim.average;
            const percent = Math.round((avg / 10) * 100);

            return (
              <div
                key={dim.dimension}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pole Oceny
                    </span>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${avg > 0 ? getScoreColor(avg) : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {avg > 0 ? `${avg} / 10.0 (${dim.averageOutOfFive}/5.0)` : 'Brak ocen'}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1 tracking-tight">
                    {dim.title}
                  </h3>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden my-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${avg > 0 ? getScoreBgBar(avg) : 'bg-slate-300'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Distribution breakdown 1..10 */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Rozkład ocen (1 do 11):</span>
                    <div className="grid grid-cols-11 gap-1 text-center text-[10px] text-slate-500 bg-slate-50/80 p-2 rounded-2xl border border-slate-150">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(score => {
                        const count = dim.distribution[score] || 0;
                        return (
                          <div key={score} className="flex flex-col items-center">
                            <span className="font-semibold text-slate-600">{score}</span>
                            <span className={`font-mono text-xs font-bold mt-0.5 ${count > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top specific factors for this dimension */}
                  {dim.topPositiveFactors.length > 0 && (
                    <div className="mt-3.5 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Mocne strony i spełnione oczekiwania:
                      </span>
                      <div className="space-y-1.5">
                        {dim.topPositiveFactors.slice(0, 3).map((f, idx) => (
                          <div key={idx} className="text-xs bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex items-start justify-between gap-2 text-slate-700">
                            <div className="flex flex-col gap-0.5">
      {f.text.includes(':') ? (
        <>
          <span className="text-[11px] font-black text-emerald-800">✓ {f.text.split(':')[0]}</span>
          <span className="leading-snug text-slate-700 pl-4">{f.text.split(':').slice(1).join(':').trim()}</span>
        </>
      ) : (
        <span className="leading-snug">✓ {f.text}</span>
      )}
   </div>
                            <span className="font-bold text-emerald-700 shrink-0 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{f.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top improvement points if any */}
                  {dim.topImprovementFactors.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Kwestie do doszlifowania (obszary rozwoju):
                      </span>
                      <div className="space-y-1.5">
                        {dim.topImprovementFactors.slice(0, 2).map((f, idx) => (
                          <div key={idx} className="text-xs bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-xl flex items-start justify-between gap-2 text-amber-900">
                            <div className="flex flex-col gap-0.5">
      {f.text.includes(':') ? (
        <>
          <span className="text-[11px] font-black text-amber-900">💡 {f.text.split(':')[0]}</span>
          <span className="leading-snug text-amber-900 pl-5">{f.text.split(':').slice(1).join(':').trim()}</span>
        </>
      ) : (
        <span className="leading-snug">💡 {f.text}</span>
      )}
   </div>
                            <span className="font-bold text-amber-800 shrink-0 text-[11px] bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">{f.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Business Impact Note */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                    <strong className="text-slate-900 block mb-0.5">Wpływ na współpracę i efektywność zespołu:</strong>
                    {dim.businessImpactAnalysis || 'Czekamy na pierwsze odpowiedzi z ankiety, aby wygenerować analizę.'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        
        {/* Detailed Comments Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 mb-6">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">
            Szczegółowe komentarze tekstowe od zespołu
          </h3>
          {responses.some(r => r.dimensionComments && Object.values(r.dimensionComments).some(c => (typeof c === "string" ? c.trim().length : 0) > 0)) ? (
            <div className="space-y-4">
              {responses.map(resp => {
                const hasComments = resp.dimensionComments && Object.values(resp.dimensionComments).some(c => (typeof c === "string" ? c.trim().length : 0) > 0);
                if (!hasComments) return null;
                
                return (
                  <div key={resp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                       <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                         Odpowiedź z {new Date(resp.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    {Object.entries(resp.dimensionComments).map(([dimId, comment]) => {
                       if (typeof comment !== "string" || !comment.trim()) return null;
                       const q = questions.find(q => q.id === dimId);
                       return (
                         <div key={dimId} className="text-sm">
                           <span className="font-bold text-slate-700">{q?.dimensionTitle || dimId}:</span>
                           <p className="text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100 mt-1">"{comment}"</p>
                         </div>
                       );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Brak dodatkowych komentarzy tekstowych od uczestników.</p>
          )}
        </div>

      </div>
    </div>
  );
};
