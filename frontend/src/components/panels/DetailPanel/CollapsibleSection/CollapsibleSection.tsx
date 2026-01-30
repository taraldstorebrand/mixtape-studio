import styles from './CollapsibleSection.module.css';

interface CollapsibleSectionProps {
  label: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  mode: 'readonly' | 'edit';
}

export function CollapsibleSection({ label, children, isExpanded, onToggle, mode }: CollapsibleSectionProps) {
  return (
    <div className={`${styles.section} ${styles[mode]}`}>
      <button
        type="button"
        onClick={onToggle}
        className={styles.header}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
      >
        <span className={styles.label}>{label}</span>
        <svg
          aria-hidden="true"
          focusable="false"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
        >
          <polyline points="6,9 10,13 14,9" />
        </svg>
      </button>
      <div className={`${styles.content} ${isExpanded ? styles.expanded : ''}`}>
        <div className={styles.contentInner}>
          {children}
        </div>
      </div>
    </div>
  );
}
