import { motion } from 'framer-motion'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { UseFinance } from '../hooks/useFinance'
import type { UsePayroll } from '../hooks/usePayroll'
import type { Transaction } from '../types'
import { formatRD } from '../utils/nominaCalc'
import { AddTransactionModal } from './AddTransactionModal'

type FilterType = 'all' | 'income' | 'expense'

const headerLabel = (date: string): string => {
  const target = new Date(`${date}T00:00:00`)
  const now = new Date()
  const diff = Math.floor((new Date(now.toDateString()).getTime() - new Date(target.toDateString()).getTime()) / 86400000)
  if (diff === 0) return 'HOY'
  if (diff === 1) return 'AYER'
  return target.toLocaleDateString('es-DO', { weekday: 'long', day: '2-digit', month: 'short' }).toUpperCase()
}

export const Transactions = ({ finance }: { finance: UseFinance; payroll: UsePayroll }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = useMemo(() => {
    return finance.transactions.filter((tx) => {
      const matchesType = filter === 'all' || tx.type === filter
      const text = `${tx.title} ${tx.categoryName} ${tx.note}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      return matchesType && matchesQuery
    })
  }, [finance.transactions, query, filter])

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

  return (
    <section className="relative h-full space-y-3 pb-20">
      <div className="flex items-center gap-2">
        {(['all', 'income', 'expense'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              filter === key ? 'bg-[var(--accent)] text-[#080810]' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
            }`}
          >
            {key === 'all' ? 'Todos' : key === 'income' ? 'Ingresos' : 'Gastos'}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 rounded-xl bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-secondary)]">
          <Search size={14} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="w-52 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
        </label>
      </div>

      <div className="h-[calc(100%-46px)] overflow-y-auto pr-1">
        {grouped.length === 0 ? (
          <div className="grid h-full place-items-center text-center text-[var(--text-secondary)]">
            <div>
              <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 48H30L44 36L58 42L78 22L94 30L116 14" stroke="currentColor" strokeWidth="2" />
              </svg>
              <p className="mt-2 text-sm">Aún no hay datos</p>
            </div>
          </div>
        ) : (
          grouped.map(([date, items]) => {
            const subtotal = items.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0)
            return (
              <div key={date} className="mb-4">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-[10px] uppercase tracking-[2px] text-[var(--text-muted)]">{headerLabel(date)}</p>
                  <div className="h-px flex-1 bg-[var(--border)]" />
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
                          <button type="button" onClick={() => { setEditing(tx); setOpen(true) }} className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <Pencil size={14} />
                          </button>
                          <button type="button" onClick={() => void finance.deleteTransaction(tx.id)} className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--expense)]">
                            <Trash2 size={14} />
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

      <button
        type="button"
        onClick={() => {
          setEditing(null)
          setOpen(true)
        }}
        className="absolute bottom-3 right-3 grid h-[52px] w-[52px] place-items-center rounded-full bg-[var(--accent)] text-[#080810]"
        style={{ boxShadow: '0 4px 20px rgba(181,255,77,0.4)' }}
      >
        <Plus size={18} />
      </button>

      <AddTransactionModal
        open={open}
        initial={editing}
        finance={finance}
        onClose={() => setOpen(false)}
        onSave={(payload) => (editing ? finance.updateTransaction(editing.id, payload) : finance.createTransaction(payload))}
      />
    </section>
  )
}
