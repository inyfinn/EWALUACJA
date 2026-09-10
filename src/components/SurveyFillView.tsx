import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, Lock, Building2, Info, Check, Star, Layers,
  ThumbsUp, AlertCircle, ArrowRight, ArrowLeft, Sparkles, HelpCircle, Crown, PlusCircle, MinusCircle, Circle, Eye, Clock,
  RotateCcw, CheckCheck, ChevronRight, BarChart2, MessageSquareQuote, Printer
} from 'lucide-react';
import { SurveyQuestion, ScoreLevelDescription, SurveyResponse } from '../types';
import { SCORE_LEVEL_DESCRIPTIONS } from '../data/surveyQuestions';
import { 
  saveResponseAsync, 
  getStoredTokens, 
  validateTokenCode, 
  getStoredResponses,
  fetchTokensFromServer,
  fetchResponsesFromServer
} from '../utils/surveyStorage';
import { SurveyCompletionSummary } from './SurveyCompletionSummary';
import confetti from 'canvas-confetti';

interface SurveyFillViewProps {
  questions: SurveyQuestion[];
  prefilledToken?: string;
  surveyId?: string;
  heading?: string;
  intro?: string;
  onCompleted: () => void;
  onSwitchToAdmin?: () => void;
  onOpenAdminLogin?: () => void;
  isPreviewMode?: boolean;
}



const GestureSlider = ({ value, onChange, sqId, scoreDescriptions }: { value: number | undefined, onChange: (val: number) => void, sqId: string, scoreDescriptions?: ScoreLevelDescription[] }) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const calculateValue = (clientX: number) => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const segmentWidth = rect.width / 11;
    const val = Math.floor(x / segmentWidth) + 1;
    return Math.max(1, Math.min(11, val));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    const val = calculateValue(e.clientX);
    if (val && val !== value) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
      onChange(val);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging || e.buttons > 0) {
      const val = calculateValue(e.clientX);
      if (val && val !== value) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        onChange(val);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const scoreDesc = value && scoreDescriptions ? scoreDescriptions.find(d => d.score === value) : (value ? SCORE_LEVEL_DESCRIPTIONS.find(d => d.score === value) : null);

  return (
    <div className="mt-4 mb-2 flex flex-col gap-3">
      {/* Visual Track */}
      <div 
        ref={trackRef}
        className="relative w-full h-16 sm:h-20 flex touch-none cursor-pointer group"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Outline / Border gradient (Thin 1px border instead of solid background) */}
        <div className="absolute inset-0 my-auto h-12 sm:h-14 rounded-2xl p-[1.5px] bg-gradient-to-r from-rose-400 via-slate-300 to-emerald-400 shadow-sm">
           {/* Inner background (White/light) */}
           <div className="w-full h-full bg-slate-50/90 rounded-2xl relative overflow-hidden">
             {/* Gold highlight for 11 (Subtle inner glow) */}
             <div className="absolute right-0 w-[9.09%] h-full bg-gradient-to-l from-amber-100 to-transparent opacity-80"></div>
           </div>
        </div>
        
        {/* The White Bubble (Thumb) - Made larger and more padded */}
        {value !== undefined && (
          <div 
             className="absolute h-14 sm:h-16 -mt-1 sm:-mt-1 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.18)] border border-slate-200 transition-all duration-100 ease-out flex items-center justify-center z-10 scale-[1.15] sm:scale-110"
             style={{ 
               width: '9.09%', 
               left: `${(value - 1) * 9.09}%` 
             }}
          >
            {value === 11 && <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 drop-shadow-sm animate-pulse" />}
          </div>
        )}

        {/* Numbers */}
        <div className="absolute inset-0 w-full h-full flex flex-nowrap z-20 px-0.5">
          {[1,2,3,4,5,6,7,8,9,10,11].map(num => {
            const isSelected = value === num;
            return (
              <div key={num} className="flex-1 flex items-center justify-center font-black select-none pointer-events-none min-w-0">
                 <span 
                    className={`transition-all duration-200 flex items-center justify-center whitespace-nowrap ${
                      isSelected 
                        ? (num === 11 ? 'text-amber-600 text-[18px] sm:text-[22px] scale-110' : 'text-slate-900 text-[18px] sm:text-[22px] scale-110') 
                        : 'text-slate-500/80 text-[10px] sm:text-[13px]'
                    }`}
                 >
                   {num === 11 && !isSelected ? <Crown className="w-3.5 h-3.5 text-amber-500/70" /> : num}
                 </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time description box - fully responsive flexbox that auto-expands to content */}
      <div className="w-full transition-all duration-200">
        {scoreDesc ? (
           <div className={`w-full p-3.5 sm:p-4 rounded-xl border shadow-xs flex items-start gap-3 transition-all duration-150 animate-in fade-in duration-200 ${
             value === 11
               ? 'bg-amber-50/70 border-amber-300 text-amber-950'
               : value >= 8
               ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
               : value >= 5
               ? 'bg-white border-slate-200 text-slate-900'
               : 'bg-rose-50/50 border-rose-200 text-rose-950'
           }`}>
             <div className="shrink-0 pt-0.5 flex items-center justify-center">
                {value === 11 ? (
                  <span className="text-xl sm:text-2xl select-none leading-none">👑</span>
                ) : value >= 8 ? (
                  <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
                ) : value >= 5 ? (
                  <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 fill-slate-100 shrink-0" />
                ) : (
                  <MinusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 shrink-0" />
                )}
             </div>
             <div className="flex-1 min-w-0">
               <h4 className="font-bold text-slate-900 text-[13px] sm:text-sm leading-snug">
                 {scoreDesc.shortLabel}
               </h4>
               <p className="text-slate-600 text-xs sm:text-[13px] mt-1 leading-relaxed break-words">
                 {scoreDesc.summary}
               </p>
             </div>
           </div>
        ) : (
           <div className="w-full py-3.5 px-4 flex items-center justify-center text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100/70 rounded-xl border border-dashed border-slate-200 select-none">
              ← Przesuń palcem lub kliknij cyfrę, aby ocenić →
           </div>
        )}
      </div>
    </div>
  );
};

export const SurveyFillView: React.FC<SurveyFillViewProps> = ({
  questions,
  prefilledToken = '',
  surveyId,
  heading,
  intro,
  onCompleted,
  onSwitchToAdmin,
  onOpenAdminLogin,
  isPreviewMode = false,
}) => {
  const [tokenInput, setTokenInput] = useState(prefilledToken);
  const [tokenLabel, setTokenLabel] = useState<string | undefined>(undefined);
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [isTokenAlreadyUsed, setIsTokenAlreadyUsed] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [surveyStage, setSurveyStage] = useState<'intro' | 'answering' | 'review' | 'submitted'>('intro');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedFactors, setSelectedFactors] = useState<Record<string, string[]>>({});
  const [dimensionComments, setDimensionComments] = useState<Record<string, string>>({});
  const [collaborationContext, setCollaborationContext] = useState<'czesto' | 'okazjonalnie' | 'rzadko'>('czesto');
  const [teamRelation, setTeamRelation] = useState<'ten_sam_zespol' | 'inny_dzial' | 'projektowo'>('ten_sam_zespol');
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showTokenInputForm, setShowTokenInputForm] = useState(false);
  const [priorResponsesSnapshot, setPriorResponsesSnapshot] = useState<SurveyResponse[]>([]);
  const [submittedResponse, setSubmittedResponse] = useState<SurveyResponse | null>(null);

  // Pre-load prior responses snapshot so it's ready
  useEffect(() => {
    try {
      const prior = getStoredResponses();
      setPriorResponsesSnapshot(prior);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initTokenAndPrior() {
      // 1. Fetch latest tokens and prior responses from server
      const [serverTokens, serverResponses] = await Promise.all([
        fetchTokensFromServer(),
        fetchResponsesFromServer()
      ]);

      if (!isMounted) return;
      setPriorResponsesSnapshot(serverResponses);

      if (prefilledToken) {
        const validation = validateTokenCode(prefilledToken, serverTokens);
        if (validation.valid && !validation.used) {
          setTokenInput(prefilledToken);
          setTokenLabel(validation.label);
          setIsTokenVerified(true);
          setIsTokenAlreadyUsed(false);
          setTokenError(null);
        } else if (validation.used) {
          setIsTokenAlreadyUsed(true);
          setIsTokenVerified(false);
          setTokenError(validation.error || 'Ten link został już wykorzystany do oddania głosu.');
        } else {
          setTokenError(validation.error || 'Nieprawidłowy kod.');
        }
      } else {
        setIsTokenVerified(true);
      }
    }

    initTokenAndPrior();

    return () => {
      isMounted = false;
    };
  }, [prefilledToken]);

  const handleStartSurvey = () => {
    setSurveyStage('answering');
    setCurrentStepIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScore = (subQuestionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [subQuestionId]: score }));
  };

  const handleToggleFactor = (questionId: string, factor: string) => {
    setSelectedFactors(prev => {
      const currentList = prev[questionId] || [];
      if (currentList.includes(factor)) {
        return { ...prev, [questionId]: currentList.filter(f => f !== factor) };
      } else {
        return { ...prev, [questionId]: [...currentList, factor] };
      }
    });
  };

  const handleSubmit = async () => {
    // Capture snapshot of prior responses before saving this one
    try {
      const prior = await fetchResponsesFromServer();
      setPriorResponsesSnapshot(prior);
    } catch {
      // ignore
    }

    const urlQueryToken = typeof window !== 'undefined' 
      ? (new URLSearchParams(window.location.search).get('token') || new URLSearchParams(window.location.search).get('kod') || '')
      : '';
    const actualTokenUsed = (tokenInput || prefilledToken || urlQueryToken || 'PREVIEW').trim().toUpperCase();

    const newResponse: SurveyResponse = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      tokenUsed: actualTokenUsed,
      surveyId,
      answers,
      selectedFactors,
      dimensionComments,
      collaborationContext,
      teamRelation
    };

    const res = await saveResponseAsync(newResponse);
    setSubmittedResponse(newResponse);

    if (res.success) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6']
      });
      setSurveyStage('submitted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onCompleted();
    } else {
      setSubmitError(res.error || 'Wystąpił nieznany błąd zapisu.');
      setSurveyStage('submitted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (surveyStage === 'intro') {
    return (
      <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900 text-white">
              <ShieldCheck className="w-3.5 h-3.5" /> Anonimowa Ankieta
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
            {heading || 'Ewaluacja pracownika'}
          </h1>
          <p className="text-slate-600 sm:text-lg mb-8 leading-relaxed max-w-2xl">
            {intro || 'Witaj w bezpiecznym panelu oceny. Twoje odpowiedzi pomogą nam lepiej rozwijać zespół. Ankieta jest w 100% anonimowa.'}
          </p>

          <button
            onClick={handleStartSurvey}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md hover:shadow-lg"
          >
            <span>Rozpocznij Ankietę</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (surveyStage === 'submitted') {
    const urlQueryToken = typeof window !== 'undefined' 
      ? (new URLSearchParams(window.location.search).get('token') || new URLSearchParams(window.location.search).get('kod') || '')
      : '';
    const resolvedToken = (tokenInput || prefilledToken || urlQueryToken || 'PREVIEW').trim().toUpperCase();

    return (
      <SurveyCompletionSummary
        answers={answers}
        selectedFactors={selectedFactors}
        priorResponses={priorResponsesSnapshot}
        tokenUsed={resolvedToken}
        savedResponse={submittedResponse || undefined}
        saveWarning={submitError || undefined}
        onOpenAdminLogin={onOpenAdminLogin || onSwitchToAdmin}
      />
    );
  }

  if (surveyStage === 'review') {
    return (
      <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">
            Krok końcowy: Kontekst współpracy
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Intensywność współpracy:</label>
              <select
                value={collaborationContext}
                onChange={e => setCollaborationContext(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="czesto">Ścisła, bieżąca współpraca (bardzo często)</option>
                <option value="okazjonalnie">Regularna współpraca (np. raz w tygodniu)</option>
                <option value="rzadko">Sporadyczna współpraca (np. raz w miesiącu lub rzadziej)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Relacja działowa:</label>
              <select
                value={teamRelation}
                onChange={e => setTeamRelation(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="ten_sam_zespol">Ten sam zespół / dział</option>
                <option value="inny_dzial">Inny dział w firmie</option>
                <option value="projektowo">Współpraca projektowa / międzywydziałowa</option>
              </select>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => { setSurveyStage('answering'); setCurrentStepIndex(questions.length - 1); }}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Wróć
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              Zapisz odpowiedzi i Prześlij <Check className="w-5 h-5 text-emerald-200" />
            </button>
          </div>
          {submitError && <div className="text-red-500 font-bold mt-4">{submitError}</div>}
        </div>
      </div>
    );
  }

  // default to answering stage
  const currentQuestion = questions[currentStepIndex];
  if (!currentQuestion) return null;

  const subScores = currentQuestion.subQuestions.map(sq => answers[sq.id]).filter(s => s !== undefined);
  const isCurrentAnswered = subScores.length === currentQuestion.subQuestions.length;
  const currentScore = isCurrentAnswered ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length) : undefined;
  
  const currentSelectedFactors = selectedFactors[currentQuestion.id] || [];

  const scoreDesc = currentScore !== undefined ? (currentQuestion.scoreDescriptions || SCORE_LEVEL_DESCRIPTIONS).find(d => d.score === currentScore) : null;

  const getFactorCategory = (factorText: string): 'positive' | 'neutral' | 'negative' => {
    if (currentQuestion.factors.low.includes(factorText)) return 'negative';
    if (currentQuestion.factors.mid.includes(factorText)) return 'neutral';
    return 'positive';
  };

  const primaryFactors = currentScore !== undefined 
    ? (currentScore >= 7 ? currentQuestion.factors.high : currentScore >= 4 ? currentQuestion.factors.mid : currentQuestion.factors.low)
    : currentQuestion.factors.high;
  
  // Cleanly partition secondary factors by their genuine intrinsic type
  const secondaryPositive = (currentScore !== undefined && currentScore >= 7) ? [] : currentQuestion.factors.high;
  const secondaryNeutral = (currentScore !== undefined && currentScore >= 4 && currentScore < 7) ? [] : currentQuestion.factors.mid;
  const secondaryNegative = (currentScore !== undefined && currentScore < 4) ? [] : currentQuestion.factors.low;

  const secondaryAll = [...secondaryNeutral, ...secondaryNegative, ...secondaryPositive];
  const secondaryTotalCount = secondaryAll.length;
  const secondarySelectedCount = secondaryAll.filter(f => currentSelectedFactors.includes(f)).length;

  const renderFactorButton = (factorText: string, keyPrefix: string) => {
    const category = getFactorCategory(factorText);
    const isChecked = currentSelectedFactors.includes(factorText);

    let borderClass = '';
    let checkClass = '';
    let badgeEl = null;
    let titleClass = '';

    if (category === 'positive') {
      borderClass = isChecked 
        ? 'border-2 border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-400/30 shadow-xs' 
        : 'border border-emerald-500/50 bg-white text-slate-800 hover:border-emerald-500/80 hover:bg-emerald-50/30';
      checkClass = isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300/70 bg-white text-transparent';
      badgeEl = (
        <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors ${
          isChecked 
            ? 'font-black bg-emerald-200 text-emerald-950 border-emerald-500' 
            : 'font-bold bg-emerald-50/70 text-emerald-800/80 border-emerald-400/40'
        }`}>
          ✓ Pozytywne
        </span>
      );
      titleClass = isChecked ? 'text-emerald-950 font-black' : 'text-emerald-900/90 font-bold';
    } else if (category === 'neutral') {
      borderClass = isChecked 
        ? 'border-2 border-slate-700 bg-slate-100 text-slate-950 ring-2 ring-slate-400/30 shadow-xs' 
        : 'border border-slate-400/50 bg-white text-slate-800 hover:border-slate-500/80 hover:bg-slate-50/50';
      checkClass = isChecked ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-300/70 bg-white text-transparent';
      badgeEl = (
        <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors ${
          isChecked 
            ? 'font-black bg-slate-200 text-slate-950 border-slate-500' 
            : 'font-bold bg-slate-100/80 text-slate-700/80 border-slate-300/50'
        }`}>
          ⚡ Neutralne
        </span>
      );
      titleClass = isChecked ? 'text-slate-950 font-black' : 'text-slate-800 font-bold';
    } else {
      // Negative / improvement
      borderClass = isChecked 
        ? 'border-2 border-rose-600 bg-rose-50/90 text-rose-950 ring-2 ring-rose-400/30 shadow-xs' 
        : 'border border-rose-500/50 bg-white text-slate-800 hover:border-rose-500/80 hover:bg-rose-50/30';
      checkClass = isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300/70 bg-white text-transparent';
      badgeEl = (
        <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors ${
          isChecked 
            ? 'font-black bg-rose-200 text-rose-950 border-rose-500' 
            : 'font-bold bg-rose-50/70 text-rose-800/80 border-rose-400/40'
        }`}>
          ⚠ Negatywne / Do poprawy
        </span>
      );
      titleClass = isChecked ? 'text-rose-950 font-black' : 'text-rose-900/90 font-bold';
    }

    const hasColon = factorText.includes(':');
    const titlePart = hasColon ? factorText.split(':')[0] : null;
    const bodyPart = hasColon ? factorText.split(':').slice(1).join(':').trim() : factorText;

    return (
      <button
        key={keyPrefix + '_' + factorText}
        type="button"
        onClick={() => handleToggleFactor(currentQuestion.id, factorText)}
        className={`text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 active:scale-[0.99] ${borderClass}`}
      >
        <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${checkClass}`}>
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            {badgeEl}
          </div>
          {hasColon ? (
            <>
              <span className={`text-[12px] sm:text-[13px] leading-tight mb-0.5 ${titleClass}`}>
                {titlePart}
              </span>
              <span className="text-[11px] sm:text-xs leading-snug text-slate-700">
                {bodyPart}
              </span>
            </>
          ) : (
            <span className="text-[11px] sm:text-xs leading-snug text-slate-700 font-medium">
              {bodyPart}
            </span>
          )}
        </div>
      </button>
    );
  };

  const handleNextStep = () => {
    if (isCurrentAnswered) {
      if (currentStepIndex < questions.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSurveyStage('review');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSurveyStage('intro');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-3 sm:py-6 px-2 sm:px-4 space-y-4">
      
      {/* Intrukcja wypełniania ankiety (Widoczna na starcie) */}
      {currentStepIndex === 0 && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm sm:text-base font-black text-indigo-900 mb-2 flex items-center gap-2">
             <HelpCircle className="w-5 h-5 text-indigo-500" /> 
             Jak wypełniać tę ankietę?
          </h3>
          <p className="text-xs sm:text-sm text-indigo-800/80 leading-relaxed mb-0">
             Oceniamy tutaj pracownika na wielu płaszczyznach. To jest pierwsza z nich. 
             Wybierz odpowiednią liczbę na suwaku (od 1 do 11) dla każdego pytania, 
             a na końcu zaznacz komentarz, który najlepiej oddaje powód Twojej oceny. 
             Gdy odpowiesz na wszystkie pytania w sekcji, przejdziesz do kolejnej płaszczyzny.
          </p>
        </div>
      )}
      {/* Visual 4-Step Navigation Stepper Tabs (Accordion Style) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-2 sm:p-3 shadow-xs">
        <div className="flex gap-1.5 sm:gap-2">
          {questions.map((q, idx) => {
            const isDone = q.subQuestions.every(sq => answers[sq.id] !== undefined);
            const isCurrent = currentStepIndex === idx;
            
            const rawTitle = q.dimensionTitle;
            const cleanTitle = rawTitle.includes('. ') ? rawTitle.split('. ')[1] : rawTitle;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentStepIndex(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`h-11 sm:h-12 rounded-2xl flex items-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden border ${
                  isCurrent
                    ? 'flex-1 bg-slate-900 border-slate-900 text-white shadow-md px-3 sm:px-4'
                    : isDone
                    ? 'w-11 sm:w-14 justify-center bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shrink-0'
                    : 'w-11 sm:w-14 justify-center bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 shrink-0'
                }`}
                title={cleanTitle}
              >
                <div className="flex items-center gap-2 whitespace-nowrap min-w-0">
                  <span className={`shrink-0 flex items-center justify-center font-black text-[13px] sm:text-sm ${isCurrent ? 'text-amber-400' : ''}`}>
                    {isDone && !isCurrent ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : (idx + 1)}
                  </span>
                  {isCurrent && (
                    <span className="font-bold text-[11px] sm:text-xs truncate">
                      {cleanTitle}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200/80">
        <div className="mb-4 border-b border-slate-100 pb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 mb-2 border border-slate-200/60 uppercase tracking-wider">
            {currentQuestion.dimensionTitle}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
            {currentQuestion.dimensionSubtitle}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">
            {currentQuestion.contextHelp}
          </p>
        </div>

        <div className="space-y-4">
          {currentQuestion.subQuestions.map((sq, sqIdx) => {
             const val = answers[sq.id];
             return (
               <div key={sq.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-2">
                   <div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">{sq.label}</span>
                     <h3 className="text-[13px] sm:text-sm font-semibold text-slate-900 leading-tight">{sq.text}</h3>
                   </div>
                   
                 </div>
                 
                 <GestureSlider value={val} onChange={(newVal) => handleSelectScore(sq.id, newVal)} sqId={sq.id} scoreDescriptions={sq.scoreDescriptions || currentQuestion.scoreDescriptions} />
               </div>
             );
          })}
        </div>

        {/* Dynamic Behavioral Factors Section (Appears when all subquestions are answered) */}
        {isCurrentAnswered && (
          <div className="space-y-4 pt-5 mt-5 border-t border-slate-100">
            {scoreDesc && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border transition-all ${
                  currentScore! >= 7
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : currentScore! >= 4
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-amber-50/90 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-black text-sm">Średnia wymiaru: {currentScore}/10</span>
                  <span className="text-slate-600 font-medium">({scoreDesc.shortLabel})</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-700" />
                  <span>Uzasadnienie (Zaznacz min. 1 pasujące zachowanie)</span>
                </h4>
                {currentSelectedFactors.length > 0 && (
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                    Zaznaczono: {currentSelectedFactors.length}
                  </span>
                )}
              </div>
              
              {/* Primary recommended factors (matched to slider score) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {primaryFactors.map(f => renderFactorButton(f, 'prim'))}
              </div>

              {/* Secondary factors categorized dropdown */}
              {secondaryTotalCount > 0 && (
                <details className="mt-3.5 group rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 sm:p-4 transition-all">
                  <summary className="text-xs sm:text-[13px] font-bold text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-between list-none select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📋</span>
                      <span className="font-extrabold text-slate-800">
                        Rozwiń pozostałe możliwe zachowania (neutralne, negatywne i inne)
                      </span>
                      {secondarySelectedCount > 0 && (
                        <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                          Wybrano z listy: {secondarySelectedCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 shadow-2xs">
                      <span>Rozwiń</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-90 group-open:-rotate-90 transition-transform" />
                    </div>
                  </summary>

                  <div className="mt-3.5 space-y-4 pt-3 border-t border-slate-200/80">
                    {/* Neutral group */}
                    {secondaryNeutral.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg">
                            ⚡ Zachowania neutralne / umiarkowane (szary obrys)
                          </span>
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            Standardowe codzienne funkcjonowanie i drobne uwagi
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {secondaryNeutral.map(f => renderFactorButton(f, 'sec_neu'))}
                        </div>
                      </div>
                    )}

                    {/* Negative group */}
                    {secondaryNegative.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-900 bg-rose-100/90 border border-rose-300 px-2.5 py-1 rounded-lg">
                            ⚠ Zachowania negatywne / do poprawy (czerwony obrys)
                          </span>
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            Kwestie utrudniające pracę lub wymagające pilnej zmiany
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {secondaryNegative.map(f => renderFactorButton(f, 'sec_neg'))}
                        </div>
                      </div>
                    )}

                    {/* Positive group (if current score was low or mid) */}
                    {secondaryPositive.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-lg">
                            ✓ Zachowania pozytywne / mocne strony (zielony obrys)
                          </span>
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            Mocne filary i pozytywne aspekty współpracy
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {secondaryPositive.map(f => renderFactorButton(f, 'sec_pos'))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Krótki komentarz od siebie (opcjonalnie):
              </label>
              <textarea
                value={dimensionComments[currentQuestion.id] || ''}
                onChange={(e) => setDimensionComments(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                placeholder="Napisz kilka słów od siebie, jeśli chcesz coś dodać (anonimowo)..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[70px] resize-y"
              />
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStepIndex === 0 ? 'Ekran wstępu' : 'Poprzedni krok'}</span>
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            disabled={!isCurrentAnswered}
            className={`px-6 sm:px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              isCurrentAnswered
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg active:scale-98'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <span>{currentStepIndex < questions.length - 1 ? 'Kolejny wymiar' : 'Przejdź do podsumowania'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
