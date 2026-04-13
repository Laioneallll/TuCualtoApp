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

// ─── Employee & Payroll types ────────────────────────────────────────────────

export interface Employee {
  id: number
  name: string
  occupation: string
  salaryBase: number
  department: string
  phone: string
  email: string
  createdAt: string
}

export interface EmployeePayload {
  name: string
  occupation: string
  salaryBase: number
  department?: string
  phone?: string
  email?: string
}

export interface PayrollEmployeeDetail {
  employeeId: number
  name: string
  occupation: string
  salaryBase: number
  afp: number
  sfs: number
  isr: number
  totalDeductions: number
  netSalary: number
}

export interface PayrollRecord {
  id: number
  period: string
  employeeCount: number
  totalGross: number
  totalNet: number
  totalDeductions: number
  sentAt: string
}

export interface SendPayrollPayload {
  period: string
  employeeCount: number
  totalGross: number
  totalNet: number
  totalDeductions: number
  details: PayrollEmployeeDetail[]
}

export interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  narrator: boolean
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
      employees: {
        list: () => Promise<Employee[]>
        create: (payload: EmployeePayload) => Promise<{ id: number }>
        update: (id: number, payload: EmployeePayload) => Promise<{ updated: boolean }>
        remove: (id: number) => Promise<{ deleted: boolean }>
      }
      payroll: {
        send: (payload: SendPayrollPayload) => Promise<{ id: number }>
        list: () => Promise<PayrollRecord[]>
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

