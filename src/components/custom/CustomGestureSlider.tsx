import React from 'react';

interface Props {
  value: number | undefined;
  onChange: (val: number) => void;
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

// Touch/mouse rating track for custom surveys — same visual language as the
// built-in survey slider, but supports any integer range (e.g. 1–3, 1–5, 1–10).
export const CustomGestureSlider: React.FC<Props> = ({ value, onChange, min, max, minLabel, maxLabel }) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const steps = Math.max(1, max - min + 1);
  const segPct = 100 / steps;
  const numbers = Array.from({ length: steps }, (_, i) => min + i);

  const calc = (clientX: number): number | null => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const idx = Math.floor(x / (rect.width / steps));
    return Math.max(min, Math.min(max, min + idx));
  };

  const down = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    const v = calc(e.clientX);
    if (v && v !== value) onChange(v);
  };
  const move = (e: React.PointerEvent) => {
    if (dragging || e.buttons > 0) {
      const v = calc(e.clientX);
      if (v && v !== value) onChange(v);
    }
  };
  const up = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="mt-4 mb-2 flex flex-col gap-2">
      <div
        ref={trackRef}
        className="relative w-full h-16 sm:h-20 flex touch-none cursor-pointer group"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div className="absolute inset-0 my-auto h-12 sm:h-14 rounded-2xl p-[1.5px] bg-gradient-to-r from-rose-400 via-slate-300 to-emerald-400 shadow-sm">
          <div className="w-full h-full bg-slate-50/90 rounded-2xl relative overflow-hidden" />
        </div>

        {value !== undefined && (
          <div
            className="absolute h-14 sm:h-16 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.18)] border border-slate-200 transition-all duration-100 ease-out flex items-center justify-center z-10 scale-[1.12] sm:scale-110"
            style={{ width: `${segPct}%`, left: `${(value - min) * segPct}%` }}
          />
        )}

        <div className="absolute inset-0 w-full h-full flex flex-nowrap z-20 px-0.5">
          {numbers.map((num) => {
            const selected = value === num;
            return (
              <div key={num} className="flex-1 flex items-center justify-center font-black select-none pointer-events-none min-w-0">
                <span
                  className={`transition-all duration-200 ${
                    selected ? 'text-slate-900 text-[18px] sm:text-[22px] scale-110' : 'text-slate-500/80 text-[11px] sm:text-[14px]'
                  }`}
                >
                  {num}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
