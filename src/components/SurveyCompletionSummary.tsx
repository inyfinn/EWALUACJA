import React, { useRef, useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  FileText,
  FileArchive,
  Layers, 
  ShieldCheck,
  Award,
  AlertCircle,
  ExternalLink,
  X,
  Lock
} from 'lucide-react';
import jsPDF from 'jspdf';
import { SurveyResponse } from '../types';
import { buildOverallEvaluationSummary, OverallEvaluationSummary } from '../utils/evaluationNarratives';
import { generateSummaryCanvas } from '../utils/summaryCanvasGenerator';
import {
  buildTransferPackage,
  downloadBlob,
  exportFilename,
  transferMarkerPayload,
  transferPackageToJson,
  zipStoreFiles,
} from '../utils/surveyTransfer';

interface SurveyCompletionSummaryProps {
  answers: Record<string, number>;
  selectedFactors: Record<string, string[]>;
  priorResponses: SurveyResponse[];
  tokenUsed: string;
  savedResponse?: SurveyResponse;
  saveWarning?: string;
  onOpenAdminLogin?: () => void;
}

interface ExportModalData {
  type: 'pdf' | 'jpg' | 'print';
  title: string;
  url: string;
  filename: string;
  blob?: Blob;
  previewDataUrl?: string;
}

export const SurveyCompletionSummary: React.FC<SurveyCompletionSummaryProps> = ({
  answers,
  selectedFactors,
  priorResponses,
  tokenUsed,
  savedResponse,
  saveWarning,
  onOpenAdminLogin,
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [isExportingPackage, setIsExportingPackage] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [printStatusMessage, setPrintStatusMessage] = useState<string | null>(null);
  const [exportModal, setExportModal] = useState<ExportModalData | null>(null);

  const summary: OverallEvaluationSummary = useMemo(() => {
    return buildOverallEvaluationSummary(answers, selectedFactors, priorResponses);
  }, [answers, selectedFactors, priorResponses]);

  const responseForExport: SurveyResponse = useMemo(() => {
    if (savedResponse) return savedResponse;
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}`,
      createdAt: new Date().toISOString(),
      tokenUsed,
      answers,
      selectedFactors,
      dimensionComments: {},
      collaborationContext: '',
      teamRelation: '',
    };
  }, [savedResponse, tokenUsed, answers, selectedFactors]);

  const buildJsonBlob = () => {
    const pkg = buildTransferPackage(responseForExport, 'completion');
    return new Blob([transferPackageToJson(pkg)], { type: 'application/json' });
  };

  // Helper to trigger mobile share or standard download
  const triggerSaveOrShare = async (blob: Blob, filename: string, mimeType: string) => {
    const file = new File([blob], filename, { type: mimeType });

    // Try native Mobile Share Sheet first (Supported on Brave Android, Chrome Android, Safari iOS)
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: filename,
          text: 'Podsumowanie Ewaluacji 360 – Krzysztof Wieczorek (Kubara Sp. z o.o.)',
        });
        return true;
      } catch (err: any) {
        // If user cancelled, don't treat as error
        if (err.name === 'AbortError') return true;
        console.warn('Share API error, fallback to direct download', err);
      }
    }

    // Fallback to standard anchor download
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1500);
      return false;
    } catch {
      return false;
    }
  };

  // Export to PDF
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setPrintStatusMessage(null);
    try {
      // Generate clean native 2D canvas without fragile DOM/CSS parser
      const canvas = generateSummaryCanvas(summary, tokenUsed);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.addPage();
      pdf.setFontSize(8);
      pdf.text('Dane do importu w Panelu Ankiet (nie usuwaj tej strony).', 12, 16);
      pdf.setFontSize(5);
      const marker = transferMarkerPayload(buildTransferPackage(responseForExport, 'completion'));
      const lines = pdf.splitTextToSize(marker, 186);
      pdf.text(lines.slice(0, 80), 12, 24);
      const pdfBlob = pdf.output('blob');
      const filename = exportFilename('pdf', tokenUsed);
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Attempt immediate download/share
      await triggerSaveOrShare(pdfBlob, filename, 'application/pdf');

      // Open fallback modal so mobile & iframe users can ALWAYS open or download
      setExportModal({
        type: 'pdf',
        title: 'Plik PDF jest gotowy do zapisu!',
        url: blobUrl,
        filename,
        blob: pdfBlob,
        previewDataUrl: imgData,
      });

      const jsonBlob = buildJsonBlob();
      downloadBlob(jsonBlob, exportFilename('kw360.json', tokenUsed));
      setPrintStatusMessage('Plik PDF i plik importu .kw360.json zostały wygenerowane.');
    } catch (err) {
      console.error('Błąd generowania PDF', err);
      setPrintStatusMessage('Wystąpił błąd podczas tworzenia pliku PDF. Spróbuj pobrać kopię jako JPG.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export to JPG
  const handleExportJpg = async () => {
    setIsExportingJpg(true);
    setPrintStatusMessage(null);
    try {
      // Generate clean native 2D canvas without fragile DOM/CSS parser
      const canvas = generateSummaryCanvas(summary, tokenUsed);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });

      const filename = exportFilename('jpg', tokenUsed);
      const blobUrl = URL.createObjectURL(blob);

      // Attempt immediate download/share
      await triggerSaveOrShare(blob, filename, 'image/jpeg');

      // Open fallback modal so mobile & iframe users can ALWAYS save or preview
      setExportModal({
        type: 'jpg',
        title: 'Kopia JPG jest gotowa!',
        url: blobUrl,
        filename,
        blob,
        previewDataUrl: dataUrl,
      });

      const jsonBlob = buildJsonBlob();
      downloadBlob(jsonBlob, exportFilename('kw360.json', tokenUsed));
      setPrintStatusMessage('Obraz JPG i plik importu .kw360.json zostały wygenerowane.');
    } catch (err) {
      console.error('Błąd generowania JPG', err);
      setPrintStatusMessage('Wystąpił problem z zapisem obrazu JPG.');
    } finally {
      setIsExportingJpg(false);
    }
  };

  // Safe print handler - opens clean standalone print window
  const handlePrint = async () => {
    setPrintStatusMessage(null);
    try {
      const canvas = generateSummaryCanvas(summary, tokenUsed);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const printHtml = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ewaluacja 360: Krzysztof Wieczorek</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; margin-bottom: 20px; cursor: pointer; border: none; font-size: 15px; }
    img { max-width: 100%; width: 900px; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 12px; background: #fff; }
    @media print {
      body { padding: 0; background: #fff; }
      .no-print { display: none !important; }
      img { width: 100%; box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" onclick="window.print()">🖨️ Kliknij tutaj, aby wydrukować</button>
    <p style="font-size: 13px; color: #64748b;">Jeśli okno druku nie otworzyło się automatycznie, kliknij powyższy przycisk.</p>
  </div>
  <div>
    <img src="${imgData}" alt="Kopia Ewaluacji" />
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

      const printBlob = new Blob([printHtml], { type: 'text/html' });
      const printUrl = URL.createObjectURL(printBlob);

      const opened = window.open(printUrl, '_blank');
      if (opened) {
        setPrintStatusMessage('Otwarto okno wydruku w nowej karcie.');
      } else {
        // If popup was blocked by browser
        setExportModal({
          type: 'print',
          title: 'Wydruk raportu',
          url: printUrl,
          filename: 'wydruk.html',
          previewDataUrl: imgData,
        });
      }
    } catch (e) {
      console.warn('Błąd otwierania wydruku', e);
      await handleExportPdf();
    }
  };

  const handleExportJson = async () => {
    const jsonBlob = buildJsonBlob();
    const filename = exportFilename('kw360.json', tokenUsed);
    await triggerSaveOrShare(jsonBlob, filename, 'application/json');
    setPrintStatusMessage('Zapisano plik JSON do wgrania w panelu (Dodaj wynik z pliku).');
  };

  const handleExportPackage = async () => {
    setIsExportingPackage(true);
    setPrintStatusMessage(null);
    try {
      const jsonBlob = buildJsonBlob();
      const jsonBytes = new Uint8Array(await jsonBlob.arrayBuffer());
      const canvas = generateSummaryCanvas(summary, tokenUsed);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.addPage();
      pdf.setFontSize(5);
      pdf.text(pdf.splitTextToSize(transferMarkerPayload(buildTransferPackage(responseForExport, 'completion')), 186).slice(0, 80), 12, 16);
      const pdfBytes = new Uint8Array(await pdf.output('arraybuffer'));
      const jpgBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });
      const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer());
      const zipBlob = zipStoreFiles([
        { name: exportFilename('kw360.json', tokenUsed), data: jsonBytes },
        { name: exportFilename('pdf', tokenUsed), data: pdfBytes },
        { name: exportFilename('jpg', tokenUsed), data: jpgBytes },
      ]);
      const zipName = exportFilename('zip', tokenUsed);
      await triggerSaveOrShare(zipBlob, zipName, 'application/zip');
      setPrintStatusMessage('Pakiet ZIP (JSON + PDF + JPG) jest gotowy do importu w panelu.');
    } catch (err) {
      console.error(err);
      setPrintStatusMessage('Nie udało się złożyć pakietu ZIP. Pobierz osobno plik JSON.');
    } finally {
      setIsExportingPackage(false);
    }
  };

  // Copy full summary to clipboard and share
  const handleCopySummary = async () => {
    const textLines = [
      `📋 PODSUMOWANIE EWALUACJI 360: KRZYSZTOF WIECZOREK`,
      `Firma: Kubara Sp. z o.o. | Data: ${new Date().toLocaleDateString('pl-PL')}`,
      `--------------------------------------------------`,
      `🎯 Wynik łączny: ${summary.userTotalScore} / 132 pkt (Średnia: ${summary.userAverageScore} / 11.0)`,
      `Werdykt: ${summary.overallVerdictEmoji} ${summary.overallVerdictTitle}`,
      ``,
      `📊 Porównanie z zespołem:`,
      summary.isFirstSubmission
        ? `• Nikt jeszcze nie wypełnił ankiety – przecierasz szlaki!`
        : `• Przychylność ocen: ${summary.favourabilityDiffPercent >= 0 ? '+' : ''}${summary.favourabilityDiffPercent}% względem średniej dotychczasowych ankiet\n• Aspekty do poprawy: ${summary.userNegativeDiffCount > 0 ? `+${summary.userNegativeDiffCount}` : summary.userNegativeDiffCount} względem średniej`,
      ``,
      `📝 Oceny w 4 kategoriach:`,
      ...summary.dimensions.map(d => 
        `\n${d.emoji} ${d.title} (${d.score}/${d.maxScore} pkt - Poziom ${d.level}/11: ${d.levelTitle})\n"${d.sentences}"`
      ),
      ``,
      `💬 Całościowy portret:`,
      `"${summary.cohesiveStory}"`,
      `--------------------------------------------------`,
      `Ewaluacja roczna – Kubara Sp. z o.o.`
    ];

    const formattedText = textLines.join('\n');

    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Ewaluacja 360 - Podsumowanie',
            text: formattedText,
          });
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 3000);
          return;
        } catch {
          // fallback to clipboard
        }
      }

      await navigator.clipboard.writeText(formattedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const getDimensionColor = (level: number) => {
    if (level >= 9) return { badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', bar: 'bg-emerald-500', card: 'border-emerald-200 bg-emerald-50/20' };
    if (level >= 7) return { badge: 'bg-indigo-100 text-indigo-900 border-indigo-300', bar: 'bg-indigo-500', card: 'border-indigo-200 bg-indigo-50/20' };
    if (level >= 5) return { badge: 'bg-slate-100 text-slate-800 border-slate-300', bar: 'bg-slate-500', card: 'border-slate-200 bg-slate-50/30' };
    if (level >= 3) return { badge: 'bg-amber-100 text-amber-900 border-amber-300', bar: 'bg-amber-500', card: 'border-amber-200 bg-amber-50/20' };
    return { badge: 'bg-rose-100 text-rose-900 border-rose-300', bar: 'bg-rose-500', card: 'border-rose-200 bg-rose-50/20' };
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-3 sm:px-4 space-y-6 animate-fade-in">
      
      {/* Top Thank You & Actions Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 text-center relative overflow-hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <ShieldCheck className="w-4 h-4" /> Anonimowy głos został bezpiecznie zapisany
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Dziękujemy za Twój udział w ewaluacji!
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6">
          Twój głos zasili roczny raport podsumowujący współpracę z <strong>Krzysztofem Wieczorkiem</strong> w firmie Kubara Sp. z o.o.
        </p>
        {saveWarning && (
          <div className="max-w-xl mx-auto mb-4 text-left text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            {saveWarning} Pobierz <strong>Pakiet do panelu (ZIP)</strong> albo <strong>JSON</strong> i wgraj go u organizatora.
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap pt-4 border-t border-slate-100">
          <button
            onClick={handleExportPackage}
            disabled={isExportingPackage}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs hover:shadow cursor-pointer active:scale-98"
          >
            <FileArchive className="w-4 h-4" />
            <span>{isExportingPackage ? 'Pakowanie...' : 'Pakiet do panelu (ZIP)'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Plik importu JSON</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs hover:shadow cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Tworzenie PDF...' : 'Pobierz jako PDF'}</span>
          </button>

          <button
            onClick={handleExportJpg}
            disabled={isExportingJpg}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>{isExportingJpg ? 'Tworzenie JPG...' : 'Zapisz jako JPG'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Drukuj / Kopia Zapasowa</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
            <span>{copySuccess ? 'Skopiowano!' : 'Kopiuj / Udostępnij'}</span>
          </button>
        </div>

        {printStatusMessage && (
          <div className="mt-3 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>{printStatusMessage}</span>
          </div>
        )}
      </div>

      {/* MODAL / ACTION OVERLAY FOR MOBILE & IFRAME DOWNLOAD GUARANTEE */}
      {exportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">{exportModal.title}</h3>
              </div>
              <button
                onClick={() => setExportModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-center">
              {exportModal.type === 'jpg' && exportModal.previewDataUrl && (
                <div className="space-y-2">
                  <div className="p-2 bg-slate-100 rounded-2xl border border-slate-200 inline-block max-w-full">
                    <img 
                      src={exportModal.previewDataUrl} 
                      alt="Kopia Ewaluacji" 
                      className="max-h-64 object-contain rounded-xl shadow-xs mx-auto" 
                    />
                  </div>
                  <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                    📱 <strong>Wskazówka na telefonie:</strong> Możesz przytrzymać palcem powyższy obraz i wybrać <em>«Zapisz obraz»</em> lub kliknąć przycisk poniżej.
                  </p>
                </div>
              )}

              {exportModal.type === 'pdf' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
                  <p className="text-sm font-bold text-slate-800">
                    Dokument PDF został wygenerowany pomyślnie.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Jeśli Twoja przeglądarka lub aplikacja blokuje automatyczne pobieranie w ramce, kliknij poniższy przycisk, aby otworzyć dokument w nowej karcie i zapisać go bezpośrednio.
                  </p>
                </div>
              )}

              {exportModal.type === 'print' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
                  <p className="text-sm font-bold text-slate-800">
                    Strona druku jest gotowa.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Kliknij poniższy przycisk, aby przejść do widoku wydruku.
                  </p>
                </div>
              )}

              {/* Action buttons in Modal */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={exportModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Otwórz w nowym oknie (Pobierz bezpośrednio)</span>
                </a>

                {exportModal.blob && typeof navigator !== 'undefined' && navigator.canShare && (
                  <button
                    onClick={() => {
                      if (exportModal.blob) {
                        triggerSaveOrShare(
                          exportModal.blob, 
                          exportModal.filename, 
                          exportModal.type === 'pdf' ? 'application/pdf' : 'image/jpeg'
                        );
                      }
                    }}
                    className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-indigo-200"
                  >
                    <Share2 className="w-4 h-4 text-indigo-600" />
                    <span>Zapisz przez menu telefonu / Udostępnij</span>
                  </button>
                )}

                <a
                  href={exportModal.url}
                  download={exportModal.filename}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Wymuś pobranie pliku</span>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <button
                onClick={() => setExportModal(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 px-4 cursor-pointer"
              >
                Zamknij to okno
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Printable / Capturable Container */}
      <div ref={summaryRef} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Header inside report document */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
                Kopia Ewaluacji 360
              </span>
              <span className="text-xs text-slate-500 font-medium">Kubara Sp. z o.o.</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Podsumowanie Twojej oceny: Krzysztof Wieczorek
            </h3>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500">
            <div>Kod ankiety: <strong className="font-mono text-slate-700">{tokenUsed || 'ANONIM'}</strong></div>
            <div>Data: <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('pl-PL')}</span></div>
          </div>
        </div>

        {/* SECTION: Porównanie z dotychczasowymi ankietami */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
              Jak Twoje odpowiedzi wypadają na tle innych współpracowników?
            </h4>
          </div>

          {summary.isFirstSubmission ? (
            <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🚀</span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                    Nikt jeszcze nie wypełnił ankiety, więc przecierasz szlaki!
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Twoja ocena jest pierwszą w systemie i stanowi fundament oraz pierwszy oficjalny punkt odniesienia dla kolejnych współpracowników.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Favourability tile */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                  {summary.favourabilityDiffPercent >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>Przychylność ocen</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {summary.favourabilityDiffPercent > 0 && `o ${summary.favourabilityDiffPercent}% wyższa`}
                  {summary.favourabilityDiffPercent < 0 && `o ${Math.abs(summary.favourabilityDiffPercent)}% bardziej surowa`}
                  {summary.favourabilityDiffPercent === 0 && `zgodna ze średnią`}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {summary.favourabilityDiffPercent >= 0 
                    ? `Twoje odpowiedzi były o ${Math.abs(summary.favourabilityDiffPercent)}% bardziej przychylne niż średnia dotychczasowych ankiet.`
                    : `Twoje odpowiedzi były o ${Math.abs(summary.favourabilityDiffPercent)}% bardziej rygorystyczne niż średnia grupy.`}
                </p>
              </div>

              {/* Critical/Negative aspects tile - FIXED to prevent bizarre 900% numbers */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Krytyczność i uwagi</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {summary.userNegativeDiffCount > 0 && `+${summary.userNegativeDiffCount} uwag do poprawy`}
                  {summary.userNegativeDiffCount < 0 && `-${Math.abs(summary.userNegativeDiffCount)} mniej uwag`}
                  {summary.userNegativeDiffCount === 0 && `zgodnie ze średnią`}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {summary.userNegativeDiffCount > 0 && `Wskazałeś ${summary.userNegativeCount} uwag krytycznych przy średniej zespołu wynoszącej ${summary.groupAvgNegativeCount}.`}
                  {summary.userNegativeDiffCount < 0 && `Wskazałeś ${summary.userNegativeCount} uwag krytycznych przy średniej zespołu wynoszącej ${summary.groupAvgNegativeCount}.`}
                  {summary.userNegativeDiffCount === 0 && `Wskazałeś ${summary.userNegativeCount} uwag krytycznych, dokładnie na poziomie średniej zespołu.`}
                </p>
              </div>

              {/* User average vs Group */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Twoja nota średnia</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {summary.userAverageScore} <span className="text-xs font-normal text-slate-500">/ 11.0 pkt</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Suma punktów z 12 pytań: <strong className="text-slate-800">{summary.userTotalScore}</strong> na 132 możliwe.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* OVERALL SYNTHETIC VERDICT */}
        <div className="rounded-2xl p-5 border border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{summary.overallVerdictEmoji}</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Ocena ogólna (Wynik: {summary.userTotalScore}/132 pkt)
              </span>
              <h4 className="text-base font-black text-slate-900">
                {summary.overallVerdictTitle}
              </h4>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {summary.overallVerdictText}
          </p>
        </div>

        {/* CAŁOŚCIOWY PORTRET ZŁOŻONY Z 4 KATEGORII - Without "(syntetyczny obraz...)" */}
        <div className="rounded-2xl p-5 sm:p-6 border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
              Całościowy portret współpracy
            </h4>
          </div>
          <blockquote className="text-xs sm:text-sm text-slate-700 italic leading-relaxed border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50 rounded-r-xl">
            „{summary.cohesiveStory}”
          </blockquote>
        </div>

        {/* 4 DETAILED CATEGORIES WITH 11-STEP GRADED NARRATIVES */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Szczegółowe podsumowanie w 4 kategoriach (poziom od 1 do 11)</span>
            </h4>
            <span className="text-[11px] text-slate-500">Skala 3–33 pkt na kategorię</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {summary.dimensions.map((dim) => {
              const styles = getDimensionColor(dim.level);
              const percent = Math.round(((dim.score - 3) / 30) * 100);

              return (
                <div 
                  key={dim.key} 
                  className={`p-4 rounded-2xl border transition-all ${styles.card}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{dim.emoji}</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {dim.title}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${styles.badge}`}>
                      {dim.score} / {dim.maxScore} pkt (Poz. {dim.level}/11)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${styles.bar}`} 
                      style={{ width: `${Math.max(5, percent)}%` }} 
                    />
                  </div>

                  {/* Level title */}
                  <div className="text-xs font-bold text-slate-900 mb-1">
                    {dim.levelTitle}
                  </div>

                  {/* Two sentences */}
                  <p className="text-xs text-slate-600 leading-snug">
                    {dim.sentences}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Kubara Sp. z o.o. • Roczna Ewaluacja Pracownicza 360</span>
          <span>Wygenerowano automatycznie w systemie ankietowym</span>
        </div>

        {/* Organizer access button (protected by password) */}
        {onOpenAdminLogin && (
          <div className="pt-5 pb-2 text-center border-t border-slate-200/80">
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Jesteś Krzysztofem Wieczorkiem? Przejdź do Panelu Organizatora & Wyników</span>
            </button>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Dostęp do zbiorczego raportu, frekwencji i tokenów wymaga podania hasła organizatora.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
