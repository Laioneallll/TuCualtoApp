import { LayoutDashboard, ReceiptText, WalletCards } from 'lucide-react'

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transacciones', icon: ReceiptText },
  { key: 'nomina', label: 'Nómina', icon: WalletCards }
] as const

interface SidebarProps {
  page: (typeof items)[number]['key']
  onNavigate: (page: (typeof items)[number]['key']) => void
}

export const Sidebar = ({ page, onNavigate }: SidebarProps): JSX.Element => {
  return (
    <aside className="w-64 border-r border-slate-800/90 bg-slate-950/80 p-4">
      <div className="mb-8 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4">
        <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-brand-200">Tu Cualto App</h2>
        <p className="mt-1 text-xs text-slate-300">Tu cualto. Tu flow. Siempre en control.</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = page === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                active
                  ? 'bg-brand-500/20 text-brand-100 shadow-glow'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

