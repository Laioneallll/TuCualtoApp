import { Minus, Square, X } from 'lucide-react'

export const TitleBar = (): JSX.Element => (
  <header className="app-region-drag flex h-10 items-center border-b border-white/5 bg-[#080810] px-3">
    <div className="app-region-no-drag flex items-center gap-2">
      <span className="status-dot" />
      <p className="text-[11px] font-medium uppercase tracking-[3px] text-[var(--text-secondary)]">TU CUALTO APP</p>
    </div>
    <div className="flex-1" />
    <div className="app-region-no-drag flex items-center gap-1">
      <button className="rounded p-1 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" onClick={() => void window.api.window.minimize()} type="button">
        <Minus size={14} />
      </button>
      <button className="rounded p-1 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" onClick={() => void window.api.window.toggleMaximize()} type="button">
        <Square size={14} />
      </button>
      <button className="rounded p-1 text-[var(--text-secondary)] transition hover:text-[var(--expense)]" onClick={() => void window.api.window.close()} type="button">
        <X size={14} />
      </button>
    </div>
  </header>
)
