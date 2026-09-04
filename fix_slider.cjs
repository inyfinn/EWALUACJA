const fs = require('fs');
let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

const sliderComponent = `
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
        className="relative w-full h-14 sm:h-16 flex touch-none cursor-pointer group"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 my-auto h-10 sm:h-12 rounded-2xl bg-gradient-to-r from-rose-200 via-slate-200 to-emerald-200 border border-slate-200/60 shadow-inner overflow-hidden">
           {/* Gold highlight for 11 */}
           <div className="absolute right-0 w-[9.09%] h-full bg-gradient-to-l from-amber-300 to-transparent opacity-60"></div>
        </div>
        
        {/* The White Bubble (Thumb) */}
        {value !== undefined && (
          <div 
             className="absolute h-10 sm:h-12 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.15)] border border-slate-200 transition-all duration-100 ease-out flex items-center justify-center z-10 scale-110"
             style={{ 
               width: '9.09%', 
               left: \`\${(value - 1) * 9.09}%\` 
             }}
          >
            {value === 11 && <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 drop-shadow-sm animate-pulse" />}
          </div>
        )}

        {/* Numbers */}
        <div className="absolute inset-0 w-full h-full flex z-20">
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
        </div>
      </div>

      {/* Real-time description fade-in */}
      <div className="min-h-[70px] sm:min-h-[60px] transition-all duration-300 relative">
        {scoreDesc ? (
           <div className="absolute inset-0 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
             <div className="text-xl shrink-0 pt-0.5">{value === 11 ? '👑' : value >= 8 ? '⭐' : value >= 5 ? '✅' : '⚠️'}</div>
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

// Insert the component just above SurveyFillView export
content = content.replace('export const SurveyFillView: React.FC<SurveyFillViewProps>', sliderComponent + '\nexport const SurveyFillView: React.FC<SurveyFillViewProps>');

// Make sure React is imported with useRef
// (It's already imported as import React, { useState, useEffect } from 'react'; so React.useRef works)
// Add Crown to Lucide imports if not there (we used Sparkles and Star which are imported, let's just stick to Star/Sparkles or import Crown)
content = content.replace('Sparkles, HelpCircle', 'Sparkles, HelpCircle, Crown');

// Replace the old grid rendering
const oldGridRegex = /<div className="grid grid-cols-[^>]+>([\s\S]*?)<\/button>\s*\}\)\}\s*<\/div>/g;
content = content.replace(oldGridRegex, `<GestureSlider value={val} onChange={(newVal) => handleSelectScore(sq.id, newVal)} sqId={sq.id} />`);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Slider injected successfully.");
