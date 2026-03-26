import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import { Dashboard } from './components/Dashboard'
import { Nomina } from './components/Nomina'
import { Sidebar } from './components/Sidebar'
import { TitleBar } from './components/TitleBar'
import { Transactions } from './components/Transactions'
import { useFinance } from './hooks/useFinance'

const pages = {
  dashboard: Dashboard,
  transactions: Transactions,
  nomina: Nomina
} as const

type PageKey = keyof typeof pages

const pageMeta: Record<PageKey, { title: string }> = {
  dashboard: { title: 'Dashboard' },
  transactions: { title: 'Transacciones' },
  nomina: { title: 'Calculadora de Nómina' }
}

function App(): JSX.Element {
  const [page, setPage] = useState<PageKey>('dashboard')
  const finance = useFinance()
  const CurrentPage = useMemo(() => pages[page], [page])

  return (
    <div className="h-full w-full overflow-hidden bg-transparent text-slate-100">
      <TitleBar />
      <div className="flex h-[calc(100%-44px)]">
        <Sidebar page={page} onNavigate={setPage} />
        <main className="relative flex-1 overflow-hidden p-6">
          <div className="mb-6">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-tight">{pageMeta[page].title}</h1>
            <p className="text-sm text-slate-400">Tu cualto. Tu flow. Siempre en control.</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-[calc(100%-72px)] overflow-y-auto pr-1"
            >
              <CurrentPage finance={finance} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App

