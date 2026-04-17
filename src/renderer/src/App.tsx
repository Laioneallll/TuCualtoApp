import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import { Dashboard } from './components/Dashboard'
import { Nomina } from './components/Nomina'
import { Sidebar } from './components/Sidebar'
import { TitleBar } from './components/TitleBar'
import { Transactions } from './components/Transactions'
import { UserGuide } from './components/UserGuide'
import { useFinance } from './hooks/useFinance'
import { usePayroll } from './hooks/usePayroll'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import type { AccessibilitySettings } from './types'

const pages = {
  dashboard: Dashboard,
  transactions: Transactions,
  nomina: Nomina,
  help: UserGuide
} as const

type PageKey = keyof typeof pages

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen financiero de tu flow' },
  transactions: { title: 'Transacciones', subtitle: 'Control total de movimientos' },
  nomina: { title: 'Sistema de Nómina', subtitle: 'Gestión de empleados y pago de nóminas' },
  help: { title: 'Manual de Usuario', subtitle: 'Guía completa para usar Tu Cualto App' }
}

const accessibilityStorageKey = 'tucualto-accessibility-settings'

const defaultAccessibilitySettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  narrator: false
}

const readAccessibilitySettings = (): AccessibilitySettings => {
  if (typeof window === 'undefined') return defaultAccessibilitySettings

  try {
    const stored = window.localStorage.getItem(accessibilityStorageKey)
    if (!stored) return defaultAccessibilitySettings

    const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>
    return {
      highContrast: Boolean(parsed.highContrast),
      largeText: Boolean(parsed.largeText),
      reducedMotion: Boolean(parsed.reducedMotion)
    }
  } catch {
    return defaultAccessibilitySettings
  }
}

function App(): JSX.Element {
  const [page, setPage] = useState<PageKey>('dashboard')
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(readAccessibilitySettings)
  const finance = useFinance()
  const payroll = usePayroll()
  const CurrentPage = useMemo(() => pages[page], [page])

  const narrate = useCallback((message: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = 'es-DO'
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }, [])

  const handleAccessibilityChange = useCallback((patch: Partial<AccessibilitySettings>) => {
    setAccessibility((current) => ({ ...current, ...patch }))
  }, [])

  useEffect(() => {
    const pageNarration: Record<PageKey, string> = {
      dashboard: 'Dashboard. Resumen financiero de tu flow. Aquí puedes revisar balance, ingresos, gastos y actividad reciente.',
      transactions: 'Transacciones. Control total de movimientos. Presiona Control más N para crear una nueva transacción.',
      nomina: 'Sistema de nómina. Gestión de empleados y pago de nóminas.',
      help: 'Manual de usuario. Incluye ayuda, atajos y opciones de accesibilidad visual y narración.'
    }

    if (!accessibility.narrator) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      return
    }

    narrate(pageNarration[page])
  }, [accessibility.narrator, narrate, page])

  useEffect(() => {
    const root = document.documentElement

    root.dataset.a11yContrast = accessibility.highContrast ? 'high' : 'default'
    root.dataset.a11yTextSize = accessibility.largeText ? 'large' : 'default'
    root.dataset.a11yReducedMotion = accessibility.reducedMotion ? 'true' : 'false'

    try {
      window.localStorage.setItem(accessibilityStorageKey, JSON.stringify(accessibility))
    } catch {
      // Ignore storage failures and keep the in-memory state.
    }
  }, [accessibility])

  // Keyboard shortcut: Ctrl+N opens new transaction
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        setPage('transactions')
        // Dispatch custom event so Transactions can open the modal
        window.dispatchEvent(new CustomEvent('shortcut:new-transaction'))
      }
    },
    []
  )

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleGlobalKeyDown])

  return (
    <ToastProvider>
      <div className="h-full w-full overflow-hidden bg-transparent text-[var(--text-primary)]">
        {/* Skip to content link for screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[200] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#080810]"
        >
          Saltar al contenido
        </a>

        <TitleBar />
        <div className="flex h-[calc(100%-40px)]">
          <Sidebar page={page} onNavigate={setPage} accessibility={accessibility} onAccessibilityChange={handleAccessibilityChange} />
          <main id="main-content" className="relative flex-1 overflow-hidden p-6">
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
                <ErrorBoundary>
                  <CurrentPage finance={finance} payroll={payroll} accessibility={accessibility} onAccessibilityChange={handleAccessibilityChange} />
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

export default App
