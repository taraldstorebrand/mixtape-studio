import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { t } from '../../../i18n';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

function ErrorFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-surface)',
        color: 'var(--color-text)',
      }}
      role="alert"
    >
      <h1 style={{ marginBottom: 'var(--spacing-md)' }}>
        Something went wrong
      </h1>
      <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-dim)' }}>
        An error occurred while loading the application.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          padding: 'var(--spacing-md) var(--spacing-lg)',
          fontSize: '1rem',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
        }}
        aria-label={t.actions.reloadApplication}
      >
        Reload
      </button>
    </div>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('ErrorBoundary caught an error:', error)}
    >
      {children}
    </ReactErrorBoundary>
  );
}
