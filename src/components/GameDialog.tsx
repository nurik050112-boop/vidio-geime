import { useEffect, useRef, type ReactNode } from 'react';

type Props = { title: string; onClose: () => void; className?: string; children: ReactNode };

export function GameDialog({ title, onClose, className = '', children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return (
    <dialog ref={dialogRef} className={`accessible-dialog ${className}`} aria-label={title}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
