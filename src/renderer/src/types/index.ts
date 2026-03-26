export type TransactionType = 'income' | 'expense'

export interface Category {
  id: number
  name: string
  type: TransactionType
}

export interface Transaction {
  id: number
  title: string
  amount: number
  type: TransactionType
  categoryId: number
  categoryName: string
  date: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface TransactionPayload {
  title: string
  amount: number
  type: TransactionType
  categoryId: number
  date: string
  note?: string
}

export interface MonthlyStat {
  month: string
  income: number
  expense: number
}

export interface CategoryBreakdown {
  category: string
  type: TransactionType
  total: number
}

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  balance: number
  monthly: MonthlyStat[]
  categoryBreakdown: CategoryBreakdown[]
}

export interface NominaResult {
  salary: number
  afp: number
  sfs: number
  taxable: number
  isr: number
  totalDeductions: number
  netSalary: number
}

declare global {
  interface Window {
    api: {
      transactions: {
        list: () => Promise<Transaction[]>
        create: (payload: TransactionPayload) => Promise<{ id: number }>
        update: (id: number, payload: TransactionPayload) => Promise<{ updated: boolean }>
        remove: (id: number) => Promise<{ deleted: boolean }>
      }
      categories: {
        list: () => Promise<Category[]>
      }
      stats: {
        dashboard: () => Promise<DashboardStats>
      }
      nomina: {
        calculate: (salary: number) => Promise<NominaResult>
      }
      window: {
        minimize: () => Promise<void>
        toggleMaximize: () => Promise<boolean>
        close: () => Promise<void>
        isMaximized: () => Promise<boolean>
        onMaximizedChange: (callback: (value: boolean) => void) => () => void
      }
    }
  }
}

export {}

