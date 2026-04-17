import { motion } from 'framer-motion'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { UseFinance } from '../hooks/useFinance'
import type { UsePayroll } from '../hooks/usePayroll'
import type { AccessibilitySettings } from '../types'
import type { Transaction } from '../types'
import { formatRD } from '../utils/nominaCalc'
import { AddTransactionModal } from './AddTransactionModal'
import { ConfirmDialog } from './ConfirmDialog'
import { useToast } from './Toast'

type FilterType = 'all' | 'income' | 'expense'

const headerLabel = (date: string): string => {
  const target = new Date(`${date}T00:00:00`)
  const now = new Date()
  const diff = Math.floor((new Date(now.toDateString()).getTime() - new Date(target.toDateString()).getTime()) / 86400000)
  if (diff === 0) return 'HOY'
  if (diff === 1) return 'AYER'
  return target.toLocaleDateString('es-DO', { weekday: 'long', day: '2-digit', month: 'short' }).toUpperCase()
}

export const Transactions = ({ finance }: { finance: UseFinance; payroll: UsePayroll; accessibility?: AccessibilitySettings; onAccessibilityChange?: (patch: Partial<AccessibilitySettings>) => void }): JSX.Element => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300)
  }, [])

  // Listen for Ctrl+N shortcut
  useEffect(() => {
    const handler = (): void => {
      setEditing(null)
      setOpen(true)
    }
    window.addEventListener('shortcut:new-transaction', handler)
    return () => window.removeEventListener('shortcut:new-transaction', handler)
  }, [])

  const filtered = useMemo(() => {
    return finance.transactions.filter((tx) => {
      const matchesType = filter === 'all' || tx.type === filter
      const text = `${tx.title} ${tx.categoryName} ${tx.note}`.toLowerCase()
      const matchesQuery = text.includes(debouncedQuery.toLowerCase())
      return matchesType && matchesQuery
    })
  }, [finance.transactions, debouncedQuery, filter])

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    filtered.forEach((tx) => {
      const key = tx.date.slice(0, 10)
      const arr = map.get(key) ?? []
      arr.push(tx)
      map.set(key, arr)
    })
    return Array.from(map.entries()).sort((a, b) => (a[0] > b[0] ? -1 : 1))
  }, [filtered])

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return
    await finance.deleteTransaction(confirmDelete.id)
    toast('Transacción eliminada correctamente')
    setConfirmDelete(null)
  }, [confirmDelete, finance, toast])

  const handleSave = useCallback(
    async (payload: Parameters<typeof finance.createTransaction>[0]) => {
      if (editing) {
        await finance.updateTransaction(editing.id, payload)
        toast('Transacción actualizada correctamente')
      } else {
        await finance.createTransaction(payload)
        toast('Transacción creada correctamente')
      }
    },
    [editing, finance, toast]
  )

  return (
    <section className="relative h-full space-y-3 pb-20" aria-label="Gestión de transacciones">
      {/* Loading state */}
      {finance.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" role="status">
            <span className="sr-only">Cargando transacciones...</span>
          </div>
        </div>
      )}

      {!finance.loading && (
        <>
          <div className="flex items-center gap-2" role="toolbar" aria-label="Filtros de transacciones">
            {(['all', 'income', 'expense'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  filter === key ? 'bg-[var(--accent)] text-[#080810]' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                }`}
              >
                {key === 'all' ? 'Todos' : key === 'income' ? 'Ingresos' : 'Gastos'}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 rounded-xl bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-secondary)]">
              <Search size={14} aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar..."
                aria-label="Buscar transacciones"
                className="w-52 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </label>
          </div>

          <div className="h-[calc(100%-46px)] overflow-y-auto pr-1">
            {grouped.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-[var(--text-secondary)]">
                <div>
                  <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M4 48H30L44 36L58 42L78 22L94 30L116 14" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <p className="mt-2 text-sm">Aún no hay transacciones</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Presiona el botón <strong>+</strong> o <kbd className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px]">Ctrl+N</kbd> para crear tu primera transacción
                  </p>
                </div>
              </div>
            ) : (
              grouped.map(([date, items]) => {
                const subtotal = items.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0)
                return (
                  <div key={date} className="mb-4">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-[10px] uppercase tracking-[2px] text-[var(--text-muted)]">{headerLabel(date)}</p>
                      <div className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
                      <p className={`amount text-xs ${subtotal >= 0 ? 'text-[var(--income)]' : 'text-[var(--expense)]'}`}>{subtotal >= 0 ? '+' : ''}{formatRD(subtotal)}</p>
                    </div>
                    <div className="space-y-1">
                      {items.map((tx) => (
                        <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="group flex items-center justify-between rounded-[10px] border border-transparent px-3 py-2 transition hover:bg-[var(--bg-elevated)]">
                          <div>
                            <p className="text-sm text-[var(--text-primary)]">{tx.title}</p>
                            <p className="text-xs text-[var(--text-muted)]">{tx.categoryName} · {new Date(tx.date).toLocaleTimeString('es-DO', { hour: 'numeric', minute: '2-digit' })}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={`amount text-sm ${tx.type === 'income' ? 'text-[var(--income)]' : 'text-[var(--expense)]'}`}>
                              {tx.type === 'income' ? '+' : '-'}
                              {formatRD(tx.amount)}
                            </p>
                            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                title="Editar transacción"
                                aria-label={`Editar transacción: ${tx.title}`}
                                onClick={() => { setEditing(tx); setOpen(true) }}
                                className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              >
                                <Pencil size={14} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                title="Eliminar transacción"
                                aria-label={`Eliminar transacción: ${tx.title}`}
                                onClick={() => setConfirmDelete(tx)}
                                className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--expense)]"
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      <button
        type="button"
        title="Nueva transacción (Ctrl+N)"
        aria-label="Crear nueva transacción"
        onClick={() => {
          setEditing(null)
          setOpen(true)
        }}
        className="absolute bottom-3 right-3 grid h-[52px] w-[52px] place-items-center rounded-full bg-[var(--accent)] text-[#080810] transition hover:scale-105"
        style={{ boxShadow: '0 4px 20px rgba(181,255,77,0.4)' }}
      >
        <Plus size={18} aria-hidden="true" />
      </button>

      <AddTransactionModal
        open={open}
        initial={editing}
        finance={finance}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar transacción"
        message={`¿Estás seguro de que deseas eliminar "${confirmDelete?.title ?? ''}"? Esta acción no se puede deshacer.`}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  )
}
