import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../../../i18n';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Rendered into <body> so no ancestor stacking context (e.g. the sticky list
  // toolbar) can place it below the fixed Now Playing bar, which on phones
  // covered the editor's bottom buttons
  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>{title}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label={t.actions.close}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
