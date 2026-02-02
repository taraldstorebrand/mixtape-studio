import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
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
            onClick={this.handleReload}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              fontSize: '1rem',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
            aria-label="Reload application"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

