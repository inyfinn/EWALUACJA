import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';

interface ConfirmPopoverProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  children: ReactNode;
}

export function ConfirmPopover({
  message,
  confirmLabel = 'Usuń',
  cancelLabel = 'Anuluj',
  onConfirm,
  children,
}: ConfirmPopoverProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [box, setBox] = useState({ left: 0, top: 0, ready: false });

  const place = useCallback(() => {
    const el = triggerRef.current;
    const panel = panelRef.current;
    if (!el || !panel) return;
    const r = el.getBoundingClientRect();
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const gap = 10;
    const preferTop = r.top >= ph + gap + 8;
    let left = r.right - pw;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    let top = preferTop ? r.top - gap - ph : r.bottom + gap;
    top = Math.max(8, Math.min(top, window.innerHeight - ph - 8));
    setBox({ left, top, ready: true });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setBox((b) => (b.ready ? { ...b, ready: false } : b));
      return;
    }
    place();
  }, [open, message, place]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, place]);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const raw = Children.only(children);
  const trigger = isValidElement(raw)
    ? cloneElement(raw as ReactElement<{ onClick?: (e: ReactMouseEvent) => void }>, {
        onClick: (e: ReactMouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        },
      })
    : raw;

  return (
    <span ref={triggerRef} className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
      {trigger}
      {open && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Potwierdzenie"
          style={{ position: 'fixed', left: box.left, top: box.top, zIndex: 450, visibility: box.ready ? 'visible' : 'hidden' }}
          className="w-[min(320px,calc(100vw-16px))] rounded-2xl bg-white p-3 shadow-[0_16px_40px_rgba(43,36,64,0.22)] ring-1 ring-dk-violet-soft"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-medium text-dk-ink leading-relaxed">{message}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="btn-dk-ghost !py-1.5"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className="btn-dk-danger !py-1.5"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                void handleConfirm();
              }}
            >
              {busy ? 'Proszę czekać…' : confirmLabel}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
}
