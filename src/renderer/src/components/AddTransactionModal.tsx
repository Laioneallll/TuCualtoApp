import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { UseFinance } from '../hooks/useFinance'
import type { Transaction, TransactionPayload, TransactionType } from '../types'

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onSave: (payload: TransactionPayload) => Promise<void>
  finance: UseFinance
  initial?: Transaction | null
}

const getInitialPayload = (finance: UseFinance, initial?: Transaction | null): TransactionPayload => {
  const type: TransactionType = initial?.type ?? 'expense'
  const categoryId =
    initial?.categoryId ??
    finance.categories.find((c) => c.type === type)?.id ??
    finance.categories[0]?.id ??
    1
  return {
    title: initial?.title ?? '',
    amount: initial?.amount ?? 0,
    type,
    categoryId,
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    note: initial?.note ?? ''
  }
}

export const AddTransactionModal = ({ open, onClose, onSave, finance, initial }: AddTransactionModalProps): JSX.Element | null => {
  const [payload, setPayload] = useState<TransactionPayload>(() => getInitialPayload(finance, initial))
  const [error, setError] = useState<string | null>(null)

  // Keep a ref to the latest finance so the effect always reads current categories
  // without re-running (and resetting the form) on every finance reference change.
  const financeRef = useRef(finance)
  financeRef.current = finance

  useEffect(() => {
    if (open) {
      setPayload(getInitialPayload(financeRef.current, initial))
      setError(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const categoryOptions = useMemo(() => finance.categories.filter((c) => c.type === payload.type), [finance.categories, payload.type])

  if (!open) return null

  const handleTypeChange = (type: TransactionType) => {
    const firstOfType = finance.categories.find((c) => c.type === type)
    setPayload((p) => ({ ...p, type, categoryId: firstOfType?.id ?? p.categoryId }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payload.title.trim()) {
      setError('Por favor ingresa una descripción.')
      return
    }
    if (payload.amount <= 0) {
      setError('El monto debe ser mayor a 0.')
      return
    }
    setError(null)
    try {
      await onSave(payload)
      onClose()
    } catch (err) {
      console.error('Error al guardar la transacción:', err)
      setError('Ocurrió un error al guardar. Intenta de nuevo.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" style={{ backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <motion.form
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-[480px] space-y-4 rounded-[20px] border border-[var(--border)] bg-[var(--bg-elevated)] p-5"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        <h3 className="text-lg font-semibold">{initial ? 'Editar transacción' : 'Nueva transacción'}</h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`rounded-[10px] border px-3 py-2 text-sm ${payload.type === 'income' ? 'border-[var(--accent)] bg-[rgba(181,255,77,0.1)] text-[var(--accent)]' : 'border-transparent bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`rounded-[10px] border px-3 py-2 text-sm ${payload.type === 'expense' ? 'border-[var(--expense)] bg-[rgba(255,69,96,0.1)] text-[var(--expense)]' : 'border-transparent bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
          >
            Gasto
          </button>
        </div>

        <div className="rounded-[12px] bg-[var(--bg-surface)] px-4 py-3 text-center">
          <p className="mb-1 text-[10px] uppercase tracking-[2px] text-[var(--text-muted)]">Monto</p>
          <div className="flex items-end justify-center gap-2 border-b-2 border-white/10 pb-1">
            <span className="text-xl text-[var(--text-muted)]">RD$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={payload.amount || ''}
              onChange={(e) => setPayload((p) => ({ ...p, amount: Number(e.target.value) }))}
              className={`amount w-44 bg-transparent text-center text-[40px] leading-none ${payload.type === 'income' ? 'text-[var(--accent)]' : 'text-[var(--expense)]'}`}
            />
          </div>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--text-secondary)]">Descripción</span>
          <input value={payload.title} onChange={(e) => setPayload((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-[10px] bg-[var(--bg-surface)] px-3 py-2 text-[var(--text-primary)]" />
        </label>

        <div className="grid grid-cols-4 gap-2">
          {categoryOptions.map((category) => {
            const selected = payload.categoryId === category.id
            const color = payload.type === 'income' ? '181,255,77' : '255,69,96'
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setPayload((p) => ({ ...p, categoryId: category.id }))}
                className={`rounded-lg border px-2 py-2 text-center text-xs transition ${selected ? 'scale-105' : ''}`}
                style={{
                  borderColor: selected ? `rgb(${color})` : 'transparent',
                  background: selected ? `rgba(${color},0.25)` : `rgba(${color},0.1)`
                }}
              >
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-[var(--text-secondary)]">Fecha</span>
            <input type="date" value={payload.date} onChange={(e) => setPayload((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-[10px] bg-[var(--bg-surface)] px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--text-secondary)]">Nota</span>
            <input value={payload.note} onChange={(e) => setPayload((p) => ({ ...p, note: e.target.value }))} className="w-full rounded-[10px] bg-[var(--bg-surface)] px-3 py-2" />
          </label>
        </div>

        {error && (
          <p className="rounded-[10px] bg-[rgba(255,69,96,0.1)] px-3 py-2 text-xs text-[var(--expense)]">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-[10px] px-4 py-2 text-sm text-[var(--text-secondary)]">
            Cancelar
          </button>
          <button type="submit" className="rounded-[10px] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#080810]">
            Guardar
          </button>
        </div>
      </motion.form>
    </div>
  )
}
