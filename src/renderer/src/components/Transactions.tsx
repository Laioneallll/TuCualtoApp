import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { UseFinance } from '../hooks/useFinance'
import type { Transaction } from '../types'
import { formatRD } from '../utils/nominaCalc'
import { AddTransactionModal } from './AddTransactionModal'

export const Transactions = ({ finance }: { finance: UseFinance }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
          type="button"
        >
          <Plus size={16} /> Nueva transacción
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/90 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {finance.transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-slate-800/70">
                <td className="px-4 py-3 text-slate-300">{new Date(tx.date).toLocaleDateString('es-DO')}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-100">{tx.title}</div>
                  {tx.note ? <div className="text-xs text-slate-500">{tx.note}</div> : null}
                </td>
                <td className="px-4 py-3 text-slate-300">{tx.categoryName}</td>
                <td className={`px-4 py-3 font-semibold ${tx.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatRD(tx.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800"
                      onClick={() => {
                        setEditing(tx)
                        setOpen(true)
                      }}
                      type="button"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="rounded-md p-1.5 text-rose-300 hover:bg-rose-900/50"
                      onClick={() => void finance.deleteTransaction(tx.id)}
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {finance.transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No hay transacciones aún.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

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

