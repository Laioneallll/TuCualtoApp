import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertTriangle, X, Info } from 'lucide-react'
import { createContext, useCallback, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export const useToast = (): ToastContextValue => useContext(ToastContext)

let nextId = 0

const icons: Record<ToastType, JSX.Element> = {
  success: <Check size={14} />,
  error: <X size={14} />,
  warning: <AlertTriangle size={14} />,
  info: <Info size={14} />
}

const colors: Record<ToastType, string> = {
  success: 'border-[var(--income)] bg-[rgba(181,255,77,0.12)]',
  error: 'border-[var(--expense)] bg-[rgba(255,69,96,0.12)]',
  warning: 'border-[var(--warning)] bg-[rgba(255,184,48,0.12)]',
  info: 'border-[var(--accent)] bg-[rgba(181,255,77,0.08)]'
}

const iconColors: Record<ToastType, string> = {
  success: 'text-[var(--income)]',
  error: 'text-[var(--expense)]',
  warning: 'text-[var(--warning)]',
  info: 'text-[var(--accent)]'
}

export const ToastProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite" role="status">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm text-[var(--text-primary)] shadow-lg backdrop-blur-sm ${colors[t.type]}`}
            >
              <span className={iconColors[t.type]}>{icons[t.type]}</span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
