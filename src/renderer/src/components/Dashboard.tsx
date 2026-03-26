import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts'
import { formatRD } from '../utils/nominaCalc'
import { StatCard } from './StatCard'
import type { UseFinance } from '../hooks/useFinance'

const COLORS = ['#818cf8', '#38bdf8', '#34d399', '#f59e0b', '#fb7185', '#a78bfa', '#22d3ee']

export const Dashboard = ({ finance }: { finance: UseFinance }): JSX.Element => {
  const { stats } = finance

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Ingresos" value={formatRD(stats.totalIncome)} tone="success" />
        <StatCard label="Gastos" value={formatRD(stats.totalExpense)} tone="danger" />
        <StatCard label="Balance" value={formatRD(stats.balance)} tone={stats.balance >= 0 ? 'success' : 'danger'} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card h-80 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Flujo mensual</h3>
          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={stats.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(v) => new Intl.NumberFormat('es-DO').format(v)} />
              <Tooltip formatter={(value: number) => formatRD(value)} />
              <Legend />
              <Line dataKey="income" name="Ingresos" stroke="#34d399" strokeWidth={2} />
              <Line dataKey="expense" name="Gastos" stroke="#fb7185" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-80 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Distribución por categoría</h3>
          <ResponsiveContainer width="100%" height="88%">
            <PieChart>
              <Pie data={stats.categoryBreakdown} dataKey="total" nameKey="category" outerRadius={95}>
                {stats.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${entry.category}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatRD(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

