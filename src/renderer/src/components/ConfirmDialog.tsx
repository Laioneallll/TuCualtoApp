import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel
}: ConfirmDialogProps): JSX.Element | null => {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Tab') {
        const focusable = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[]
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onCancel]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      cancelRef.current?.focus()
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4"
      style={{ backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] rounded-[20px] border border-[var(--border)] bg-[var(--bg-elevated)] p-6"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(255,69,96,0.15)]">
            <AlertTriangle size={20} className="text-[var(--expense)]" />
          </div>
          <h3 id="confirm-dialog-title" className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
        </div>
        <p id="confirm-dialog-message" className="mb-6 text-sm text-[var(--text-secondary)]">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-[10px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-[10px] bg-[var(--expense)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
