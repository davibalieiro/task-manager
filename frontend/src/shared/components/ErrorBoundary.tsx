import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 'var(--space-6)',
          textAlign: 'center',
          background: 'var(--surface-bg)',
        }}>
          <AlertTriangle style={{ width: 48, height: 48, color: 'var(--warning-500)', marginBottom: 'var(--space-4)' }} />
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Algo deu errado
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', maxWidth: 400 }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--gradient-brand)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              fontWeight: 'var(--font-medium)',
            }}
          >
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
