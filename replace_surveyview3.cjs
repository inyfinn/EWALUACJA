const fs = require('fs');
let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

const startStr = 'const isCurrentAnswered = currentScore !== undefined;';
const endStr = '{/* Step Navigation Bar */}';

let startIndex = content.indexOf(startStr);
let endIndex = content.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  // Let's replace the top variables too. We need to go back slightly to replace `currentScore` and `currentSelectedFactors` definitions.
  const extendedStartStr = 'const currentScore = currentQuestion ? answers[currentQuestion.id] : undefined;';
  startIndex = content.indexOf(extendedStartStr);
  
  const replacement = `
  const subScores = currentQuestion ? currentQuestion.subQuestions.map(sq => answers[sq.id]).filter(s => s !== undefined) : [];
  const isCurrentAnswered = currentQuestion && subScores.length === currentQuestion.subQuestions.length;
  const currentScore = isCurrentAnswered ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length) : undefined;
  
  const currentSelectedFactors = currentQuestion ? selectedFactors[currentQuestion.id] || [] : [];
  const allAnswered = questions.every(q => q.subQuestions.every(sq => answers[sq.id] !== undefined));

  const scoreDesc = currentScore !== undefined ? SCORE_LEVEL_DESCRIPTIONS.find(d => d.score === currentScore) : null;

  const primaryFactors = currentQuestion && currentScore !== undefined 
    ? (currentScore >= 7 ? currentQuestion.factors.high : currentScore >= 4 ? currentQuestion.factors.mid : currentQuestion.factors.low)
    : [];
  
  const secondaryFactors = currentQuestion && currentScore !== undefined 
    ? (currentScore >= 7 ? [...currentQuestion.factors.mid, ...currentQuestion.factors.low] 
       : currentScore >= 4 ? [...currentQuestion.factors.high, ...currentQuestion.factors.low] 
       : [...currentQuestion.factors.high, ...currentQuestion.factors.mid])
    : [];

  const handleSelectScore = (subQuestionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [subQuestionId]: score }));
    // Auto-scroll logic or next step could be here, but let's keep it manual since there are 3 questions and factors
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

  // Skip rendering if not answering
  if (surveyStage !== 'answering') {
    // This is handled by main renders above, this return is the default fallback
  }

  return (
    <div className="max-w-3xl mx-auto py-3 sm:py-6 px-2 sm:px-4 space-y-4">
      {/* Visual 4-Step Navigation Stepper Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-4 gap-1.5">
          {questions.map((q, idx) => {
            const isDone = q.subQuestions.every(sq => answers[sq.id] !== undefined);
            const isCurrent = currentStepIndex === idx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentStepIndex(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={\`p-2 sm:p-2.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between \${
                  isCurrent
                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                    : isDone
                    ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950 hover:bg-emerald-100/70'
                    : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-slate-100'
                }\`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={\`text-[9px] sm:text-[10px] font-black \${isCurrent ? 'text-amber-400' : isDone ? 'text-emerald-700' : 'text-slate-400'}\`}>
                    Krok {idx + 1}
                  </span>
                  {isDone && <Check className={\`w-3 h-3 \${isCurrent ? 'text-amber-400' : 'text-emerald-600'}\`} />}
                </div>
                <span className={\`font-bold text-[10px] sm:text-xs leading-tight \${isCurrent ? 'text-white' : isDone ? 'text-emerald-900' : 'text-slate-700'}\`}>
                  {q.dimensionTitle.split('. ')[1]}
                </span>
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
                   {val && (
                     <span className="shrink-0 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-black text-slate-900 shadow-2xs self-start sm:self-auto">
                       Wybrano: {val}/10
                     </span>
                   )}
                 </div>
                 
                 <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                      const isSelected = val === num;
                      const isHigh = num >= 7;
                      const isMid = num >= 4 && num < 7;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSelectScore(sq.id, num)}
                          className={\`py-2.5 px-1 rounded-xl font-black text-sm transition-all cursor-pointer flex flex-col items-center justify-center border shadow-2xs active:scale-95 \${
                            isSelected
                              ? isHigh
                                ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-500/20 scale-105 shadow-md'
                                : isMid
                                ? 'bg-slate-900 border-slate-900 text-white ring-4 ring-slate-700/20 scale-105 shadow-md'
                                : 'bg-amber-600 border-amber-600 text-white ring-4 ring-amber-500/20 scale-105 shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }\`}
                        >
                          <span>{num}</span>
                        </button>
                      );
                    })}
                 </div>
               </div>
             );
          })}
        </div>

        {/* Dynamic Behavioral Factors Section (Appears when all subquestions are answered) */}
        {isCurrentAnswered && (
          <div className="space-y-4 pt-5 mt-5 border-t border-slate-100">
            {scoreDesc && (
              <div
                className={\`p-3.5 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border transition-all \${
                  currentScore! >= 7
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : currentScore! >= 4
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-amber-50/90 border-amber-200 text-amber-950'
                }\`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-black text-sm">Średnia wymiaru: {currentScore}/10</span>
                  <span className="text-slate-600 font-medium">({scoreDesc.shortLabel})</span>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2.5">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Uzasadnienie (Zaznacz min. 1 pasujące zachowanie)</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {primaryFactors.map((factorText, idx) => {
                  const isChecked = currentSelectedFactors.includes(factorText);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleFactor(currentQuestion.id, factorText)}
                      className={\`text-left p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-medium transition-all cursor-pointer flex items-start gap-2.5 active:scale-99 \${
                        isChecked
                          ? currentScore >= 7
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400/40 shadow-2xs'
                            : currentScore >= 4
                            ? 'bg-slate-100 border-slate-400 text-slate-950 ring-1 ring-slate-400/40 shadow-2xs'
                            : 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-400/40 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }\`}
                    >
                      <div
                        className={\`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 mt-0.5 border transition-colors \${
                          isChecked
                            ? currentScore >= 7
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : currentScore >= 4
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-amber-600 border-amber-600 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }\`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-snug">{factorText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Secondary factors dropdown */}
              <details className="mt-3 group">
                <summary className="text-[10px] sm:text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1 list-none w-fit px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                  <span>Rozwiń inne możliwe zachowania (neutralne/negatywne)</span>
                  <ArrowRight className="w-3 h-3 rotate-90 group-open:-rotate-90 transition-transform" />
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                  {secondaryFactors.map((factorText, idx) => {
                    const isChecked = currentSelectedFactors.includes(factorText);
                    return (
                      <button
                        key={'sec_'+idx}
                        type="button"
                        onClick={() => handleToggleFactor(currentQuestion.id, factorText)}
                        className={\`text-left p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-medium transition-all cursor-pointer flex items-start gap-2.5 active:scale-99 \${
                          isChecked
                            ? 'bg-slate-100 border-slate-400 text-slate-950 ring-1 ring-slate-400/40 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }\`}
                      >
                        <div
                          className={\`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 mt-0.5 border transition-colors \${
                            isChecked
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'border-slate-300 bg-white text-transparent'
                          }\`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-snug">{factorText}</span>
                      </button>
                    );
                  })}
                </div>
              </details>
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

        `;
  
  // also handle missing `isCurrentAnswered` for handleNextStep / handlePrevStep by overwriting them
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  
  // Clean up old handlers that we overwrote, they were between `const allAnswered = ...` and `if (surveyStage !== 'answering') return;` but we replaced that whole block!
  fs.writeFileSync('src/components/SurveyFillView.tsx', content);
  console.log("Success replacing answering block");
} else {
  console.log("Could not find start/end patterns");
}
