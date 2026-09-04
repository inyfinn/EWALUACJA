const fs = require('fs');
let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// The tricky part: we need to replace the entire rendering of the 'answering' state.
// We can find `if (surveyStage !== 'answering') return;` but wait, this is a giant return statement.
// The easiest way is to rewrite SurveyFillView's return logic entirely or just provide the replacement chunk.

const startPattern = `const isCurrentAnswered = currentScore !== undefined;`;
const endPattern = `// Step Navigation Bar`;

let startIndex = content.indexOf(startPattern);
let endIndex = content.indexOf(endPattern);

if (startIndex > -1 && endIndex > -1) {
  const replacement = `
  const subScores = currentQuestion.subQuestions.map(sq => answers[sq.id]).filter(s => s !== undefined);
  const isCurrentAnswered = subScores.length === currentQuestion.subQuestions.length;
  const currentScore = isCurrentAnswered ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length) : undefined;
  
  const scoreDesc = currentScore !== undefined ? SCORE_LEVEL_DESCRIPTIONS.find(d => d.score === currentScore) : null;
  const currentSelectedFactors = selectedFactors[currentQuestion.id] || [];

  const primaryFactors = currentScore !== undefined 
    ? (currentScore >= 7 ? currentQuestion.factors.high : currentScore >= 4 ? currentQuestion.factors.mid : currentQuestion.factors.low)
    : [];
  
  const secondaryFactors = currentScore !== undefined 
    ? (currentScore >= 7 ? [...currentQuestion.factors.mid, ...currentQuestion.factors.low] 
       : currentScore >= 4 ? [...currentQuestion.factors.high, ...currentQuestion.factors.low] 
       : [...currentQuestion.factors.high, ...currentQuestion.factors.mid])
    : [];

  return (
    <div className="max-w-3xl mx-auto py-3 sm:py-6 px-2 sm:px-4 space-y-4">
      {/* Top Progress Indicator */}
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
          Krok {currentStepIndex + 1} z {questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={\`h-1.5 rounded-full transition-all \${
                idx === currentStepIndex
                  ? 'w-6 bg-slate-900'
                  : idx < currentStepIndex
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-slate-200'
              }\`}
            />
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200/80">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 mb-3 border border-slate-200/60 uppercase tracking-wider">
            {currentQuestion.dimensionTitle}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {currentQuestion.dimensionSubtitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            {currentQuestion.contextHelp}
          </p>
        </div>

        {/* SubQuestions List */}
        <div className="space-y-6">
          {currentQuestion.subQuestions.map((sq, sqIdx) => {
             const val = answers[sq.id];
             return (
               <div key={sq.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                   <div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">{sq.label}</span>
                     <h3 className="text-sm font-semibold text-slate-900">{sq.text}</h3>
                   </div>
                   {val && (
                     <span className="shrink-0 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-black text-slate-900 shadow-2xs">
                       {val}/10
                     </span>
                   )}
                 </div>
                 
                 <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
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
          <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
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
                <div className="flex items-center gap-2">
                  <span className="font-black">Średnia ocena {currentScore}/10:</span>
                  <span className="text-slate-600">{scoreDesc.summary}</span>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Co wpłynęło na Twoją ocenę? (Zaznacz min. 1 cechę)</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {primaryFactors.map((factorText, idx) => {
                  const isChecked = currentSelectedFactors.includes(factorText);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleFactor(currentQuestion.id, factorText)}
                      className={\`text-left p-3 rounded-xl border text-[11px] sm:text-xs font-medium transition-all cursor-pointer flex items-start gap-2.5 active:scale-99 \${
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
                <summary className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1 list-none">
                  <span>Pokaż pozostałe czynniki (neutralne/negatywne)</span>
                  <ArrowRight className="w-3 h-3 rotate-90 group-open:-rotate-90 transition-transform" />
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 pt-2 border-t border-slate-100">
                  {secondaryFactors.map((factorText, idx) => {
                    const isChecked = currentSelectedFactors.includes(factorText);
                    return (
                      <button
                        key={'sec_'+idx}
                        type="button"
                        onClick={() => handleToggleFactor(currentQuestion.id, factorText)}
                        className={\`text-left p-3 rounded-xl border text-[11px] sm:text-xs font-medium transition-all cursor-pointer flex items-start gap-2.5 active:scale-99 \${
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

            <div className="pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Krótki komentarz od siebie (opcjonalnie):
              </label>
              <textarea
                value={dimensionComments[currentQuestion.id] || ''}
                onChange={(e) => setDimensionComments(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                placeholder="Napisz kilka słów od siebie (całkowicie anonimowo)..."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[80px] resize-y"
              />
            </div>
          </div>
        )}

        `;
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  
  // also modify the handleSelectScore to accept subQuestion id and score
  content = content.replace(/const handleSelectScore = \(questionId: string, score: number\) => {/g, 
  `const handleSelectScore = (subQuestionId: string, score: number) => {`);
  content = content.replace(/setAnswers\(prev => \({ \.\.\.prev, \[questionId\]: score }\)\);/g, 
  `setAnswers(prev => ({ ...prev, [subQuestionId]: score }));`);
  
  // also keyboard listener needs to be disabled or modified
  // let's just disable it to avoid bugs with 3 questions
  content = content.replace(/useEffect\(\(\) => \{\n\s*const handleKeyDown = \(e: KeyboardEvent\) => \{[\s\S]*?return \(\) => window\.removeEventListener\('keydown', handleKeyDown\);\n\s*\}, \[surveyStage, currentStepIndex, questions\]\);/g, `// Keyboard listener removed for sub-questions`);

  fs.writeFileSync('src/components/SurveyFillView.tsx', content);
  console.log("Success replacing question block");
} else {
  console.log("Could not find start/end patterns");
}
