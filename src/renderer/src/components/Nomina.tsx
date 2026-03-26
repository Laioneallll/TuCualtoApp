import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { UseFinance } from '../hooks/useFinance'
import type { NominaResult } from '../types'
import { formatRD } from '../utils/nominaCalc'

export const Nomina = ({ finance: _finance }: { finance: UseFinance }): JSX.Element => {
  const [salary, setSalary] = useState(25000)
  const [result, setResult] = useState<NominaResult | null>(null)

  const calculate = async () => {
    const res = await window.api.nomina.calculate(Number(salary))
    setResult(res)
  }

  const segments = useMemo(() => {
    if (!result || result.salary <= 0) return []
    return [
      { label: 'AFP', value: result.afp, color: '#7c3aed' },
      { label: 'SFS', value: result.sfs, color: '#ffb830' },
      { label: 'ISR', value: result.isr, color: '#ff4560' },
      { label: 'NETO', value: result.netSalary, color: '#b5ff4d' }
    ].map((s) => ({ ...s, pct: (s.value / result.salary) * 100 }))
  }, [result])

  return (
    <section className="space-y-4">
      <div className="surface-card p-6 text-center">
        <p className="text-[12px] uppercase tracking-[2px] text-[var(--text-muted)]">Sueldo bruto mensual</p>
        <div className="mt-3 flex items-end justify-center gap-2">
          <span className="text-2xl text-[var(--text-muted)]">RD$</span>
          <input type="number" min="0" value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="amount w-72 bg-transparent text-center text-5xl text-[var(--text-primary)]" />
        </div>
        <div className="mx-auto mt-2 h-0.5 w-72 bg-[var(--accent)]" />
        <button type="button" onClick={() => void calculate()} className="mt-5 w-full rounded-[12px] bg-[var(--accent)] px-4 py-3 font-semibold text-[#080810]">
          Calcular nómina
        </button>
      </div>

      {!result ? (
        <div className="surface-card grid h-56 place-items-center text-center text-[var(--text-secondary)]">
          <div>
            <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 48H30L44 36L58 42L78 22L94 30L116 14" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p className="mt-2 text-sm">Aún no hay datos</p>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <SmallCard label="SFS" value={formatRD(result.sfs)} color="var(--warning)" badge="3.04%" />
            <SmallCard label="AFP" value={formatRD(result.afp)} color="var(--violet)" badge="2.87%" />
            <SmallCard label="Antes ISR" value={formatRD(result.taxable)} color="var(--text-primary)" />
            <SmallCard label="ISR mensual" value={formatRD(result.isr)} color="var(--expense)" badge={result.isr === 0 ? 'Exento' : undefined} />
            <SmallCard label="Descuentos" value={formatRD(result.totalDeductions)} color="var(--text-secondary)" />
            <SmallCard label="Bruto" value={formatRD(result.salary)} color="var(--text-primary)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[rgba(181,255,77,0.2)] bg-[linear-gradient(180deg,rgba(181,255,77,0.08),transparent)] p-5">
              <p className="text-xs uppercase tracking-[2px] text-[var(--text-secondary)]">NETO MENSUAL</p>
              <p className="amount mt-2 text-4xl text-[var(--accent)]" style={{ textShadow: '0 0 30px rgba(181,255,77,0.4)' }}>
                {formatRD(result.netSalary)}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(124,58,237,0.25)] bg-[linear-gradient(180deg,rgba(124,58,237,0.1),transparent)] p-5">
              <p className="text-xs uppercase tracking-[2px] text-[var(--text-secondary)]">QUINCENAL</p>
              <p className="amount mt-2 text-4xl text-[var(--violet)]">{formatRD(result.netSalary / 2)}</p>
            </div>
          </div>

          <div className="surface-card p-4">
            <p className="mb-3 text-sm text-[var(--text-secondary)]">Desglose del salario</p>
            <div className="flex h-10 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
              {segments.map((segment) => (
                <motion.div key={segment.label} initial={{ width: 0 }} animate={{ width: `${segment.pct}%` }} transition={{ duration: 0.35 }} className="relative flex items-center justify-center text-[10px] text-[#080810]" style={{ backgroundColor: segment.color }}>
                  <span className="amount">{segment.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}

const SmallCard = ({ label, value, color, badge }: { label: string; value: string; color: string; badge?: string }): JSX.Element => (
  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
    <div className="mb-2 flex items-center justify-between">
      <p className="text-[10px] uppercase tracking-[1.8px] text-[var(--text-muted)]">{label}</p>
      {badge ? <span className="rounded-md bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">{badge}</span> : null}
    </div>
    <p className="amount text-xl" style={{ color }}>
      {value}
    </p>
  </div>
)
