import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface HintTooltipProps {
  text: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

export function HintTooltip({ text, children, side = 'top', className = '' }: HintTooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState({ left: 0, top: 0, ready: false });

  const place = useCallback(() => {
    const el = triggerRef.current;
    const tip = tipRef.current;
    if (!el || !tip) return;
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const gap = 8;
    let nextSide = side;
    if (nextSide === 'top' && r.top < th + gap + 6 && window.innerHeight - r.bottom > r.top) {
      nextSide = 'bottom';
    }
    if (nextSide === 'bottom' && window.innerHeight - r.bottom < th + gap + 6 && r.top > window.innerHeight - r.bottom) {
      nextSide = 'top';
    }
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    const top = nextSide === 'top' ? r.top - gap - th : r.bottom + gap;
    setBox({ left, top: Math.max(8, Math.min(top, window.innerHeight - th - 8)), ready: true });
  }, [side]);

  useLayoutEffect(() => {
    if (!open) {
      setBox((b) => (b.ready ? { ...b, ready: false } : b));
      return;
    }
    place();
  }, [open, text, place]);

  useEffect(() => {
    if (!open) return;
    const on = () => place();
    window.addEventListener('scroll', on, true);
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on, true);
      window.removeEventListener('resize', on);
    };
  }, [open, place]);

  const extra = className.trim();
  const isOutOfFlow = /\b(fixed|absolute)\b/.test(extra);

  return (
    <span
      ref={triggerRef}
      className={`${isOutOfFlow ? '' : 'relative'} inline-flex ${extra}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onMouseDown={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      {children}
      {open && createPortal(
        <span
          ref={tipRef}
          role="tooltip"
          style={{ position: 'fixed', left: box.left, top: box.top, zIndex: 400, visibility: box.ready ? 'visible' : 'hidden' }}
          className="pointer-events-none w-max max-w-[260px] rounded-xl bg-[#2b2440] px-3 py-2 text-center text-[11px] font-medium leading-snug text-white shadow-[0_8px_24px_rgba(43,36,64,0.28)]"
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  );
}
