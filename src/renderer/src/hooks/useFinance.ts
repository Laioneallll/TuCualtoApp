import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Category, DashboardStats, Transaction, TransactionPayload } from '../types'

export const useFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthly: [],
    categoryBreakdown: []
  })
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const [tx, cat, dashboard] = await Promise.all([
        window.api.transactions.list(),
        window.api.categories.list(),
        window.api.stats.dashboard()
      ])
      setTransactions(tx)
      setCategories(cat)
      setStats(dashboard)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const createTransaction = useCallback(
    async (payload: TransactionPayload) => {
      await window.api.transactions.create(payload)
      await refetch()
    },
    [refetch]
  )

  const updateTransaction = useCallback(
    async (id: number, payload: TransactionPayload) => {
      await window.api.transactions.update(id, payload)
      await refetch()
    },
    [refetch]
  )

  const deleteTransaction = useCallback(
    async (id: number) => {
      await window.api.transactions.remove(id)
      await refetch()
    },
    [refetch]
  )

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories])
  const incomeCategories = useMemo(() => categories.filter((c) => c.type === 'income'), [categories])

  return {
    loading,
    transactions,
    categories,
    expenseCategories,
    incomeCategories,
    stats,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch
  }
}

export type UseFinance = ReturnType<typeof useFinance>

