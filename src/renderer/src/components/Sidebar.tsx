import { ArrowLeftRight, Calculator, LayoutDashboard, User, Zap } from 'lucide-react'

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { key: 'nomina', label: 'Calculadora Nómina', icon: Calculator }
] as const

interface SidebarProps {
  page: (typeof items)[number]['key']
  onNavigate: (page: (typeof items)[number]['key']) => void
}

export const Sidebar = ({ page, onNavigate }: SidebarProps): JSX.Element => (
  <aside className="flex w-[200px] flex-col bg-[linear-gradient(180deg,#080810_0%,#0c0c16_100%)] px-3 py-4">
    <div className="mb-6">
      <div className="mb-1 flex items-center gap-2">
        <Zap size={18} className="text-[var(--accent)]" style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }} />
        <p className="text-base font-semibold text-white">Tu Cualto</p>
      </div>
      <p className="text-[10px] tracking-[0.5px] text-[var(--text-muted)]">Tu cualto. Tu flow. Siempre en control.</p>
    </div>

    <nav className="space-y-1.5">
      {items.map((item) => {
        const Icon = item.icon
        const active = page === item.key
        return (
          <button
            key={item.key}
            type="button"
            title={item.label}
            onClick={() => onNavigate(item.key)}
            className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition-all duration-200 ${
              active
                ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={16} style={active ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : undefined} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>

    <div className="mt-auto border-t border-[var(--border)] pt-3">
      <div className="flex items-center gap-2 rounded-[10px] px-2 py-2 text-[var(--text-muted)]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--bg-elevated)] text-[10px] font-semibold text-[var(--text-secondary)]">TC</span>
        <p className="text-xs">Mi perfil</p>
        <User size={14} />
      </div>
    </div>
  </aside>
)
