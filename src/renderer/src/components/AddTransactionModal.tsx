import { useEffect, useMemo, useState } from 'react'
import type { Transaction, TransactionPayload } from '../types'
import type { UseFinance } from '../hooks/useFinance'

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onSave: (payload: TransactionPayload) => Promise<void>
  finance: UseFinance
  initial?: Transaction | null
}

const getInitialPayload = (finance: UseFinance, initial?: Transaction | null): TransactionPayload => ({
  title: initial?.title ?? '',
  amount: initial?.amount ?? 0,
  type: initial?.type ?? 'expense',
  categoryId: initial?.categoryId ?? finance.categories[0]?.id ?? 1,
  date: initial?.date ?? new Date().toISOString().slice(0, 10),
  note: initial?.note ?? ''
})

export const AddTransactionModal = ({
  open,
  onClose,
  onSave,
  finance,
  initial
}: AddTransactionModalProps): JSX.Element | null => {
  const [payload, setPayload] = useState<TransactionPayload>(() => getInitialPayload(finance, initial))

  useEffect(() => {
    if (open) setPayload(getInitialPayload(finance, initial))
  }, [open, initial, finance])

  const categoryOptions = useMemo(
    () => finance.categories.filter((c) => c.type === payload.type),
    [finance.categories, payload.type]
  )

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payload.title.trim() || payload.amount <= 0) return
    await onSave(payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
      <form onSubmit={submit} className="card w-full max-w-lg space-y-4 p-5">
        <h3 className="text-lg font-semibold">{initial ? 'Editar' : 'Nueva'} transacción</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 text-sm">
            <span className="mb-1 block text-slate-300">Título</span>
            <input
              value={payload.title}
              onChange={(e) => setPayload((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Monto</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={payload.amount}
              onChange={(e) => setPayload((p) => ({ ...p, amount: Number(e.target.value) }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Tipo</span>
            <select
              value={payload.type}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  type: e.target.value as 'income' | 'expense',
                  categoryId: finance.categories.find((c) => c.type === e.target.value)?.id ?? p.categoryId
                }))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            >
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Categoría</span>
            <select
              value={payload.categoryId}
              onChange={(e) => setPayload((p) => ({ ...p, categoryId: Number(e.target.value) }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Fecha</span>
            <input
              type="date"
              value={payload.date}
              onChange={(e) => setPayload((p) => ({ ...p, date: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="col-span-2 text-sm">
            <span className="mb-1 block text-slate-300">Nota</span>
            <input
              value={payload.note}
              onChange={(e) => setPayload((p) => ({ ...p, note: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">
            Cancelar
          </button>
          <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

