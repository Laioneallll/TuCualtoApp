import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { UseFinance } from '../hooks/useFinance'
import { formatRD } from '../utils/nominaCalc'

const monthName = (value: string): string =>
  new Date(`${value}-01T00:00:00`).toLocaleDateString('es-DO', { month: 'short', year: 'numeric' })

const relativeDate = (iso: string): string => {
  const current = new Date()
  const source = new Date(iso)
  const diffDays = Math.floor((current.getTime() - source.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  return `hace ${diffDays}d`
}

export const Dashboard = ({ finance }: { finance: UseFinance }): JSX.Element => {
  const { stats, transactions } = finance
  const savingRate = stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100 : 0
  const latestMonth = stats.monthly.at(-1)?.month ?? new Date().toISOString().slice(0, 7)
  const recent = transactions.slice(0, 5)
  const expensesOnly = stats.categoryBreakdown.filter((c) => c.type === 'expense')
  const expenseTotal = expensesOnly.reduce((acc, item) => acc + item.total, 0)
  const pieColors = ['#ff4560', '#7c3aed', '#ffb830', '#b5ff4d', '#5b21b6', '#c084fc']

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-12 gap-3">
        <motion.div className="surface-card card-hover col-span-6 bg-[linear-gradient(130deg,#0f0f1a_0%,#161625_100%)] p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[2px] text-[var(--text-muted)]">BALANCE NETO</p>
            <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-secondary)]">{monthName(latestMonth)}</span>
          </div>
          <p className="amount text-4xl font-medium text-[var(--accent)]" style={stats.balance > 0 ? { textShadow: '0 0 20px var(--accent-glow)' } : undefined}>
            {formatRD(stats.balance)}
          </p>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">Tu balance actual en este mes.</p>
        </motion.div>

        <div className="surface-card card-hover col-span-2 rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-[1.5px] text-[var(--text-muted)]">INGRESOS</p>
          <p className="amount mt-3 text-2xl text-[var(--income)]">{formatRD(stats.totalIncome)}</p>
        </div>
        <div className="surface-card card-hover col-span-2 rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-[1.5px] text-[var(--text-muted)]">GASTOS</p>
          <p className="amount mt-3 text-2xl text-[var(--expense)]">{formatRD(stats.totalExpense)}</p>
        </div>
        <div className="surface-card card-hover col-span-2 rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-[1.5px] text-[var(--text-muted)]">TASA AHORRO</p>
          <p className="amount mt-3 text-2xl text-[var(--accent)]">{savingRate.toFixed(1)}%</p>
          <div className="mt-3 h-1 w-full rounded-full bg-white/10">
            <div className="h-1 rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(0, Math.min(100, savingRate))}%` }} />
          </div>
        </div>
      </div>

      <div className="surface-card card-hover h-[280px] p-4">
        <p className="mb-3 text-sm text-[var(--text-secondary)]">Flujo últimos meses</p>
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={stats.monthly}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b5ff4d" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#b5ff4d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4560" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff4560" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="income" stroke="#b5ff4d" strokeWidth={2} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, fill: '#b5ff4d' }} />
            <Area type="monotone" dataKey="expense" stroke="#ff4560" strokeWidth={2} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, fill: '#ff4560' }} />
            <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={monthName} />
            <Tooltip contentStyle={{ background: '#161625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }} formatter={(v: number) => formatRD(v)} />
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="surface-card card-hover p-4">
          <p className="mb-2 text-sm text-[var(--text-secondary)]">Distribución gastos</p>
          <div className="relative h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expensesOnly} dataKey="total" nameKey="category" innerRadius={58} outerRadius={86} paddingAngle={3}>
                  {expensesOnly.map((entry, index) => (
                    <Cell key={`${entry.category}-${entry.type}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatRD(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)]">Gastos</p>
                <p className="amount text-lg text-[var(--expense)]">{formatRD(expenseTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card card-hover p-4">
          <p className="mb-2 text-sm text-[var(--text-secondary)]">Actividad reciente</p>
          <div className="space-y-1">
            {recent.length === 0 ? (
              <div className="grid h-[220px] place-items-center text-center text-[var(--text-secondary)]">
                <div>
                  <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 48H30L44 36L58 42L78 22L94 30L116 14" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <p className="mt-2 text-sm">Aún no hay datos</p>
                </div>
              </div>
            ) : (
              recent.map((tx) => (
                <div key={tx.id} className="group flex items-center justify-between border-b border-[var(--border)] px-2 py-2 transition hover:bg-white/5">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{tx.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {tx.categoryName} · {relativeDate(tx.createdAt)}
                    </p>
                  </div>
                  <p className={`amount text-sm ${tx.type === 'income' ? 'text-[var(--income)]' : 'text-[var(--expense)]'}`}>
                    {tx.type === 'income' ? '+' : '-'}
                    {formatRD(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
