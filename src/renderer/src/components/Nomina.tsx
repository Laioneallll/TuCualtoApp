import { useState } from 'react'
import type { UseFinance } from '../hooks/useFinance'
import type { NominaResult } from '../types'
import { formatRD } from '../utils/nominaCalc'

export const Nomina = ({ finance: _finance }: { finance: UseFinance }): JSX.Element => {
  const [salary, setSalary] = useState(25000)
  const [calculated, setCalculated] = useState<NominaResult | null>(null)

  const calculate = async () => {
    const res = await window.api.nomina.calculate(Number(salary))
    setCalculated(res)
  }

  return (
    <section className="grid grid-cols-[360px_1fr] gap-4">
      <div className="card space-y-4 p-5">
        <h3 className="text-lg font-semibold">Calculadora de Nómina RD</h3>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">Sueldo bruto mensual</span>
          <input
            type="number"
            min="0"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          />
        </label>
        <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold" onClick={() => void calculate()} type="button">
          Calcular
        </button>
        <p className="text-xs text-slate-400">AFP 2.87%, SFS 3.04% e ISR anual prorrateado.</p>
      </div>

      <div className="card p-5">
        {!calculated ? (
          <p className="text-slate-400">Ingresa un salario y presiona calcular.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Item label="Sueldo bruto" value={formatRD(calculated.salary)} />
            <Item label="AFP" value={formatRD(calculated.afp)} />
            <Item label="SFS" value={formatRD(calculated.sfs)} />
            <Item label="Base imponible" value={formatRD(calculated.taxable)} />
            <Item label="ISR mensual" value={formatRD(calculated.isr)} />
            <Item label="Descuentos totales" value={formatRD(calculated.totalDeductions)} />
            <Item label="Sueldo neto" value={formatRD(calculated.netSalary)} strong />
          </div>
        )}
      </div>
    </section>
  )
}

const Item = ({ label, value, strong }: { label: string; value: string; strong?: boolean }): JSX.Element => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</p>
    <p className={`mt-2 ${strong ? 'text-xl font-bold text-emerald-300' : 'text-lg font-semibold text-slate-100'}`}>{value}</p>
  </div>
)

