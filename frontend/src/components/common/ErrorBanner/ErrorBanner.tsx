import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { globalErrorAtom } from '../../../store/atoms';
import styles from './ErrorBanner.module.css';

export function ErrorBanner() {
  const error = useAtomValue(globalErrorAtom);
  const setError = useSetAtom(globalErrorAtom);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  if (!error) return null;

  return (
    <div className={styles.errorBanner} role="alert" aria-live="polite">
      <span className={styles.errorMessage}>{error}</span>
      <button
        type="button"
        className={styles.dismissButton}
        onClick={() => setError(null)}
        aria-label="Dismiss error"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
