import { type ReactNode } from 'react';

interface HintTooltipProps {
  text: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

export function HintTooltip({ text, children, side = 'top', className = '' }: HintTooltipProps) {
  const place = side === 'bottom'
    ? 'top-[calc(100%+8px)]'
    : 'bottom-[calc(100%+8px)]';

  const extra = className.trim();
  const isFixed = extra.split(/\s+/).includes('fixed');

  return (
    <span className={`${isFixed ? '' : 'relative'} inline-flex group/hint ${extra}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-[80] ${place} w-max max-w-[260px] -translate-x-1/2 rounded-xl bg-[#2b2440] px-3 py-2 text-center text-[11px] font-medium leading-snug text-white opacity-0 shadow-[0_8px_24px_rgba(43,36,64,0.28)] transition-opacity duration-150 group-hover/hint:opacity-100 group-focus-within/hint:opacity-100`}
      >
        {text}
      </span>
    </span>
  );
}
