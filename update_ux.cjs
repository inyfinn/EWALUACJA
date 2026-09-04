const fs = require('fs');

let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// 1. Add Icons to import
content = content.replace(
  /Sparkles, HelpCircle, Crown/g,
  'Sparkles, HelpCircle, Crown, PlusCircle, MinusCircle, Circle'
);
if (!content.includes('PlusCircle')) {
  content = content.replace(
    /import {([\s\S]*?)Check,([\s\S]*?)} from 'lucide-react';/,
    "import {$1Check, PlusCircle, MinusCircle, Circle,$2} from 'lucide-react';"
  );
}

// 2. Replace GestureSlider
const oldSliderRegex = /const GestureSlider = \([\s\S]*?<\/\s*div>\n\s*<\/\s*div>\n\s*\);\n\s*};\n/m;

const newSlider = `
const GestureSlider = ({ value, onChange, sqId }: { value: number | undefined, onChange: (val: number) => void, sqId: string }) => {
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

  const scoreDesc = value ? SCORE_LEVEL_DESCRIPTIONS.find(d => d.score === value) : null;

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
               left: \`\${(value - 1) * 9.09}%\` 
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
                    className={\`transition-all duration-200 flex items-center justify-center whitespace-nowrap \${
                      isSelected 
                        ? (num === 11 ? 'text-amber-600 text-[18px] sm:text-[22px] scale-110' : 'text-slate-900 text-[18px] sm:text-[22px] scale-110') 
                        : 'text-slate-500/80 text-[10px] sm:text-[13px]'
                    }\`}
                 >
                   {num === 11 && !isSelected ? <Crown className="w-3.5 h-3.5 text-amber-500/70" /> : num}
                 </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time description fade-in */}
      <div className="min-h-[70px] sm:min-h-[60px] transition-all duration-300 relative">
        {scoreDesc ? (
           <div className="absolute inset-0 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
             <div className="shrink-0 pt-0.5 flex items-center justify-center">
                {value === 11 ? (
                  <span className="text-xl">👑</span>
                ) : value >= 8 ? (
                  <PlusCircle className="w-6 h-6 text-emerald-500" />
                ) : value >= 5 ? (
                  <Circle className="w-6 h-6 text-slate-400 fill-slate-100" />
                ) : (
                  <MinusCircle className="w-6 h-6 text-rose-500" />
                )}
             </div>
             <div>
               <h4 className="font-bold text-slate-800 text-[13px] sm:text-sm leading-tight">{scoreDesc.shortLabel}</h4>
               <p className="text-slate-600 text-[11px] sm:text-xs mt-0.5 leading-snug">{scoreDesc.summary}</p>
             </div>
           </div>
        ) : (
           <div className="absolute inset-0 flex items-center justify-center h-full text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
              ← Przesuń palcem aby ocenić →
           </div>
        )}
      </div>
    </div>
  );
};
`;

content = content.replace(oldSliderRegex, newSlider);

// 3. Add instructions
const instructionHTML = `
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
`;

content = content.replace(
  /{ \/\* Visual 4-Step Navigation Stepper Tabs \(Accordion Style\) \*\//,
  instructionHTML + '\n      {/* Visual 4-Step Navigation Stepper Tabs (Accordion Style) */'
);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Updated slider design, icons and added instructions.");
