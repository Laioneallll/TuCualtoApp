import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import { Dashboard } from './components/Dashboard'
import { Nomina } from './components/Nomina'
import { Sidebar } from './components/Sidebar'
import { TitleBar } from './components/TitleBar'
import { Transactions } from './components/Transactions'
import { useFinance } from './hooks/useFinance'
import { usePayroll } from './hooks/usePayroll'

const pages = {
  dashboard: Dashboard,
  transactions: Transactions,
  nomina: Nomina
} as const

type PageKey = keyof typeof pages

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen financiero de tu flow' },
  transactions: { title: 'Transacciones', subtitle: 'Control total de movimientos' },
  nomina: { title: 'Sistema de Nómina', subtitle: 'Gestión de empleados y pago de nóminas' }
}

function App(): JSX.Element {
  const [page, setPage] = useState<PageKey>('dashboard')
  const finance = useFinance()
  const payroll = usePayroll()
  const CurrentPage = useMemo(() => pages[page], [page])

  return (
    <div className="h-full w-full overflow-hidden bg-transparent text-[var(--text-primary)]">
      <TitleBar />
      <div className="flex h-[calc(100%-40px)]">
        <Sidebar page={page} onNavigate={setPage} />
        <main className="relative flex-1 overflow-hidden p-6">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold">{pageMeta[page].title}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{pageMeta[page].subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="h-[calc(100%-62px)] overflow-y-auto pr-1"
            >
              <CurrentPage finance={finance} payroll={payroll} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App

