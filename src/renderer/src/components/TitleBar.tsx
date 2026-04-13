import { Minus, Square, X } from 'lucide-react'

export const TitleBar = (): JSX.Element => (
  <header className="app-region-drag flex h-10 items-center border-b border-white/5 bg-[#080810] px-3" role="banner">
    <div className="app-region-no-drag flex items-center gap-2">
      <span className="status-dot" aria-hidden="true" />
      <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--text-secondary)]">TU CUALTO APP</p>
    </div>
    <div className="flex-1" />
    <nav className="app-region-no-drag flex items-center gap-1" aria-label="Controles de ventana">
      <button
        className="rounded p-1 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        onClick={() => void window.api.window.minimize()}
        type="button"
        title="Minimizar"
        aria-label="Minimizar ventana"
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <button
        className="rounded p-1 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        onClick={() => void window.api.window.toggleMaximize()}
        type="button"
        title="Maximizar"
        aria-label="Maximizar ventana"
      >
        <Square size={14} aria-hidden="true" />
      </button>
      <button
        className="rounded p-1 text-[var(--text-secondary)] transition hover:text-[var(--expense)]"
        onClick={() => void window.api.window.close()}
        type="button"
        title="Cerrar"
        aria-label="Cerrar ventana"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </nav>
  </header>
)
