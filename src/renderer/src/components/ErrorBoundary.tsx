import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

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

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="grid h-full place-items-center p-8">
          <div className="text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--expense)]" />
            <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Algo salió mal</h2>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Ocurrió un error inesperado. Intenta recargar esta sección.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="flex items-center gap-2 mx-auto rounded-[10px] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#080810]"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
