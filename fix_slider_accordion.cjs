const fs = require('fs');

let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// 1. Fix Stepper Accordion
const oldStepper = `{/* Visual 4-Step Navigation Stepper Tabs */}
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
      </div>`;

const newStepper = `{/* Visual 4-Step Navigation Stepper Tabs (Accordion Style) */}
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
                className={\`h-11 sm:h-12 rounded-2xl flex items-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden border \${
                  isCurrent
                    ? 'flex-1 bg-slate-900 border-slate-900 text-white shadow-md px-3 sm:px-4'
                    : isDone
                    ? 'w-11 sm:w-14 justify-center bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shrink-0'
                    : 'w-11 sm:w-14 justify-center bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 shrink-0'
                }\`}
                title={cleanTitle}
              >
                <div className="flex items-center gap-2 whitespace-nowrap min-w-0">
                  <span className={\`shrink-0 flex items-center justify-center font-black text-[13px] sm:text-sm \${isCurrent ? 'text-amber-400' : ''}\`}>
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
      </div>`;

content = content.replace(oldStepper, newStepper);

// 2. Fix the Slider numbers wrapping and sizing
const oldSliderNumbers = `<div className="absolute inset-0 w-full h-full flex z-20">
          {[1,2,3,4,5,6,7,8,9,10,11].map(num => {
            const isSelected = value === num;
            return (
              <div key={num} className="flex-1 flex items-center justify-center font-black text-[13px] sm:text-base select-none pointer-events-none">
                 <span className={\`\${isSelected ? (num === 11 ? 'text-amber-600 scale-125' : 'text-slate-900 scale-125') : 'text-slate-500/80'} transition-transform duration-200\`}>
                   {num === 11 && !isSelected ? <Star className="w-3.5 h-3.5 text-amber-500/70" /> : num}
                 </span>
              </div>
            );
          })}
        </div>`;

const newSliderNumbers = `<div className="absolute inset-0 w-full h-full flex flex-nowrap z-20">
          {[1,2,3,4,5,6,7,8,9,10,11].map(num => {
            const isSelected = value === num;
            return (
              <div key={num} className="flex-1 flex items-center justify-center font-black text-[11px] sm:text-[14px] select-none pointer-events-none min-w-0">
                 <span className={\`\${isSelected ? (num === 11 ? 'text-amber-600 scale-125' : 'text-slate-900 scale-125') : 'text-slate-500/80'} transition-transform duration-200 flex items-center justify-center whitespace-nowrap\`}>
                   {num === 11 && !isSelected ? <Crown className="w-3.5 h-3.5 text-amber-500/70" /> : num}
                 </span>
              </div>
            );
          })}
        </div>`;

content = content.replace(oldSliderNumbers, newSliderNumbers);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Updated SurveyFillView layout");
