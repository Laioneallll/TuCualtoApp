import { ArrowLeftRight, Calculator, HelpCircle, LayoutDashboard, Mic, MicOff, User, Zap } from 'lucide-react'
import type { AccessibilitySettings } from '../types'

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { key: 'nomina', label: 'Nómina', icon: Calculator },
  { key: 'help', label: 'Ayuda', icon: HelpCircle }
] as const

interface SidebarProps {
  page: string
  onNavigate: (page: (typeof items)[number]['key']) => void
  accessibility: AccessibilitySettings
  onAccessibilityChange: (patch: Partial<AccessibilitySettings>) => void
}

export const Sidebar = ({ page, onNavigate, accessibility, onAccessibilityChange }: SidebarProps): JSX.Element => (
  <aside className="flex w-[200px] flex-col bg-[linear-gradient(180deg,#080810_0%,#0c0c16_100%)] px-3 py-4" role="complementary">
    <div className="mb-6">
      <div className="mb-1 flex items-center gap-2">
        <Zap size={18} className="text-[var(--accent)]" style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }} aria-hidden="true" />
        <p className="text-base font-semibold text-white">Tu Cualto</p>
      </div>
      <p className="text-[10px] tracking-[0.5px] text-[var(--text-muted)]">Tu cualto. Tu flow. Siempre en control.</p>
    </div>

    <nav className="space-y-1.5" aria-label="Navegación principal">
      {items.map((item) => {
        const Icon = item.icon
        const active = page === item.key
        return (
          <button
            key={item.key}
            type="button"
            title={item.label}
            aria-label={`Ir a ${item.label}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(item.key)}
            className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition-all duration-200 ${
              active
                ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={16} aria-hidden="true" style={active ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : undefined} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>

    <div className="mt-auto space-y-2 border-t border-[var(--border)] pt-3">
      <button
        type="button"
        onClick={() => onAccessibilityChange({ narrator: !accessibility.narrator })}
        aria-pressed={accessibility.narrator}
        className={`flex w-full items-center gap-2 rounded-[10px] px-2 py-2 text-left text-xs transition ${
          accessibility.narrator
            ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--bg-elevated)] text-[10px] font-semibold text-[var(--text-secondary)]" aria-hidden="true">
          {accessibility.narrator ? <Mic size={14} aria-hidden="true" /> : <MicOff size={14} aria-hidden="true" />}
        </span>
        <span className="flex-1">
          <span className="block font-medium">Narrador</span>
          <span className="block text-[10px] text-[var(--text-muted)]">{accessibility.narrator ? 'Activado' : 'Desactivado'}</span>
        </span>
      </button>

      <div className="flex items-center gap-2 rounded-[10px] px-2 py-2 text-[var(--text-muted)]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--bg-elevated)] text-[10px] font-semibold text-[var(--text-secondary)]" aria-hidden="true">TC</span>
        <p className="text-xs">Mi perfil</p>
        <User size={14} aria-hidden="true" />
      </div>
    </div>
  </aside>
)
