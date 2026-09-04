const fs = require('fs');

let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// 1. Fix the scale buttons grid
content = content.replace(
  /<div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5 mt-2">([\s\S]*?)<button/g,
  `<div className="grid grid-cols-6 sm:grid-cols-11 gap-1 sm:gap-1.5 mt-2">$1<button`
);

// 2. Fix the scale buttons mapping array
content = content.replace(
  /\{\[1, 2, 3, 4, 5, 6, 7, 8, 9, 10\]\.map\(num => \{/g,
  `{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => {`
);

// 3. Fix the scale buttons rendering logic
const oldScaleLogic = `const isSelected = val === num;
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
                        </button>`;

const newScaleLogic = `const isSelected = val === num;
                      const isEleven = num === 11;
                      const isHigh = num >= 7 && !isEleven;
                      const isMid = num >= 4 && num < 7;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSelectScore(sq.id, num)}
                          className={\`py-2.5 px-1 rounded-xl font-black text-sm transition-all cursor-pointer flex flex-col items-center justify-center border shadow-2xs active:scale-95 \${
                            isSelected
                              ? isEleven
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-400 text-white ring-4 ring-amber-500/30 scale-110 shadow-lg'
                                : isHigh
                                ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-500/20 scale-105 shadow-md'
                                : isMid
                                ? 'bg-slate-900 border-slate-900 text-white ring-4 ring-slate-700/20 scale-105 shadow-md'
                                : 'bg-amber-600 border-amber-600 text-white ring-4 ring-amber-500/20 scale-105 shadow-md'
                              : isEleven
                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-700 hover:border-amber-400 hover:scale-105'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }\`}
                        >
                          {isEleven && isSelected && <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-amber-200" />}
                          <span>{num}</span>
                        </button>`;

content = content.replace(oldScaleLogic, newScaleLogic);

// 4. Fix factorText rendering - we need to parse Category: Description
// Replace <span className="leading-snug">{factorText}</span>
// with a helper that renders category bolder and larger.

const oldFactorSpan = `<span className="leading-snug">{factorText}</span>`;
const newFactorSpan = `<div className="flex flex-col">
                        {factorText.includes(':') ? (
                          <>
                            <span className={\`text-[12px] sm:text-[13px] font-black mb-0.5 \${currentScore >= 7 ? 'text-emerald-800' : currentScore >= 4 ? 'text-slate-800' : 'text-amber-900'}\`}>
                              {factorText.split(':')[0]}
                            </span>
                            <span className="leading-snug text-slate-700">{factorText.split(':').slice(1).join(':').trim()}</span>
                          </>
                        ) : (
                          <span className="leading-snug text-slate-700">{factorText}</span>
                        )}
                      </div>`;

content = content.replace(new RegExp(oldFactorSpan.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newFactorSpan);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Updated SurveyFillView.tsx");
