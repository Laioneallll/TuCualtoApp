import { useEffect, useState } from 'react'
import { Maximize2, Minimize2, Minus, X } from 'lucide-react'

export const TitleBar = (): JSX.Element => {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    window.api.window.isMaximized().then(setMaximized).catch(() => undefined)
    return window.api.window.onMaximizedChange(setMaximized)
  }, [])

  return (
    <header className="app-region-drag flex h-11 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-3">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">Tu Cualto App</p>
      </div>
      <div className="app-region-no-drag flex items-center gap-1">
        <button
          className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          onClick={() => window.api.window.minimize()}
          type="button"
        >
          <Minus size={14} />
        </button>
        <button
          className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          onClick={() => window.api.window.toggleMaximize()}
          type="button"
        >
          {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button
          className="rounded-md p-1.5 text-slate-300 hover:bg-rose-600 hover:text-white"
          onClick={() => window.api.window.close()}
          type="button"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  )
}

