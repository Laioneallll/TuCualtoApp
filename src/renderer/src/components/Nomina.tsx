import { AnimatePresence, motion } from 'framer-motion'
import { Check, FileText, History, Pencil, Plus, Send, Trash2, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { UsePayroll } from '../hooks/usePayroll'
import type { Employee, EmployeePayload, PayrollEmployeeDetail } from '../types'
import { calculateNomina, formatRD } from '../utils/nominaCalc'
import type { UseFinance } from '../hooks/useFinance'

type Tab = 'employees' | 'payroll' | 'history'

const defaultPayload = (): EmployeePayload => ({
  name: '',
  occupation: '',
  salaryBase: 0,
  department: '',
  phone: '',
  email: ''
})

const currentPeriod = (): string => new Date().toISOString().slice(0, 7)

export const Nomina = ({ payroll }: { finance: UseFinance; payroll: UsePayroll }): JSX.Element => {
  const [tab, setTab] = useState<Tab>('employees')

  return (
    <section className="space-y-4">
      <div className="flex gap-2 border-b border-[var(--border)] pb-3">
        <TabButton active={tab === 'employees'} onClick={() => setTab('employees')} icon={<Users size={14} />} label="Empleados" />
        <TabButton active={tab === 'payroll'} onClick={() => setTab('payroll')} icon={<FileText size={14} />} label="Generar Nómina" />
        <TabButton active={tab === 'history'} onClick={() => setTab('history')} icon={<History size={14} />} label="Historial" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === 'employees' && <EmployeesTab payroll={payroll} />}
          {tab === 'payroll' && <PayrollTab payroll={payroll} />}
          {tab === 'history' && <HistoryTab payroll={payroll} />}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

const TabButton = ({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: JSX.Element
  label: string
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm transition-all duration-200 ${
      active ? 'bg-[var(--accent-glow)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`}
  >
    {icon}
    {label}
  </button>
)

// ─── Employees Tab ────────────────────────────────────────────────────────────

const EmployeesTab = ({ payroll }: { payroll: UsePayroll }): JSX.Element => {
  const { employees, createEmployee, updateEmployee, deleteEmployee } = payroll
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeePayload>(defaultPayload())

  const openAdd = () => {
    setEditing(null)
    setForm(defaultPayload())
    setShowForm(true)
  }

  const openEdit = (emp: Employee) => {
    setEditing(emp)
    setForm({
      name: emp.name,
      occupation: emp.occupation,
      salaryBase: emp.salaryBase,
      department: emp.department,
      phone: emp.phone,
      email: emp.email
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.occupation.trim() || form.salaryBase <= 0) return
    if (editing) {
      await updateEmployee(editing.id, form)
    } else {
      await createEmployee(form)
    }
    setShowForm(false)
    setForm(defaultPayload())
    setEditing(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setForm(defaultPayload())
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {employees.length} empleado{employees.length !== 1 ? 's' : ''} registrado{employees.length !== 1 ? 's' : ''}
        </p>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-[10px] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#080810]">
          <Plus size={14} />
          Agregar empleado
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-5">
          <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">{editing ? 'Editar empleado' : 'Nuevo empleado'}</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nombre *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Nombre completo" />
            <FormField label="Ocupación *" value={form.occupation} onChange={(v) => setForm((f) => ({ ...f, occupation: v }))} placeholder="Ej. Desarrollador" />
            <FormField label="Sueldo base (RD$) *" type="number" value={String(form.salaryBase || '')} onChange={(v) => setForm((f) => ({ ...f, salaryBase: Number(v) }))} placeholder="25000" />
            <FormField label="Departamento" value={form.department ?? ''} onChange={(v) => setForm((f) => ({ ...f, department: v }))} placeholder="Ej. Tecnología" />
            <FormField label="Teléfono" value={form.phone ?? ''} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="809-000-0000" />
            <FormField label="Email" type="email" value={form.email ?? ''} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="nombre@empresa.com" />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => void handleSubmit()} className="flex items-center gap-2 rounded-[10px] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#080810]">
              <Check size={14} />
              {editing ? 'Guardar cambios' : 'Agregar'}
            </button>
            <button type="button" onClick={handleCancel} className="flex items-center gap-2 rounded-[10px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X size={14} />
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      {employees.length === 0 ? (
        <div className="surface-card grid h-40 place-items-center text-center text-[var(--text-secondary)]">
          <div>
            <Users size={40} className="mx-auto mb-2 text-[var(--text-muted)]" />
            <p className="text-sm">No hay empleados registrados</p>
            <p className="text-xs text-[var(--text-muted)]">Agrega el primer empleado para comenzar</p>
          </div>
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Nombre</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Ocupación</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Departamento</th>
                <th className="px-4 py-3 text-right text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Sueldo base</th>
                <th className="px-4 py-3 text-center text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr
                  key={emp.id}
                  className={`border-b border-[var(--border)] transition hover:bg-white/5 ${i === employees.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm text-[var(--text-primary)]">{emp.name}</p>
                    {emp.email && <p className="text-xs text-[var(--text-muted)]">{emp.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{emp.occupation}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{emp.department || '—'}</td>
                  <td className="amount px-4 py-3 text-right text-sm text-[var(--income)]">{formatRD(emp.salaryBase)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => openEdit(emp)} className="rounded-[8px] p-1.5 text-[var(--text-muted)] transition hover:bg-white/10 hover:text-[var(--accent)]">
                        <Pencil size={13} />
                      </button>
                      <button type="button" onClick={() => void deleteEmployee(emp.id)} className="rounded-[8px] p-1.5 text-[var(--text-muted)] transition hover:bg-white/10 hover:text-[var(--expense)]">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Generate Payroll Tab ─────────────────────────────────────────────────────

const PayrollTab = ({ payroll }: { payroll: UsePayroll }): JSX.Element => {
  const { employees, sendPayroll } = payroll
  const [period, setPeriod] = useState(currentPeriod)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const details: PayrollEmployeeDetail[] = useMemo(
    () =>
      employees.map((emp) => {
        const calc = calculateNomina(emp.salaryBase)
        return {
          employeeId: emp.id,
          name: emp.name,
          occupation: emp.occupation,
          salaryBase: emp.salaryBase,
          afp: calc.afp,
          sfs: calc.sfs,
          isr: calc.isr,
          totalDeductions: calc.totalDeductions,
          netSalary: calc.netSalary
        }
      }),
    [employees]
  )

  const totals = useMemo(
    () => ({
      totalGross: details.reduce((sum, d) => sum + d.salaryBase, 0),
      totalNet: details.reduce((sum, d) => sum + d.netSalary, 0),
      totalDeductions: details.reduce((sum, d) => sum + d.totalDeductions, 0)
    }),
    [details]
  )

  const handleSend = async () => {
    if (employees.length === 0) return
    setSending(true)
    try {
      await sendPayroll({ period, employeeCount: employees.length, ...totals, details })
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } finally {
      setSending(false)
    }
  }

  if (employees.length === 0) {
    return (
      <div className="surface-card grid h-40 place-items-center text-center text-[var(--text-secondary)]">
        <div>
          <FileText size={40} className="mx-auto mb-2 text-[var(--text-muted)]" />
          <p className="text-sm">No hay empleados para generar nómina</p>
          <p className="text-xs text-[var(--text-muted)]">Agrega empleados primero en la pestaña &ldquo;Empleados&rdquo;</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--text-secondary)]">Período:</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || sent}
          className={`flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold transition disabled:opacity-70 ${sent ? 'bg-green-500 text-white' : 'bg-[var(--accent)] text-[#080810]'}`}
        >
          {sent ? <Check size={14} /> : <Send size={14} />}
          {sent ? '¡Nómina enviada!' : sending ? 'Enviando...' : 'Enviar nómina'}
        </button>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Empleado</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Bruto</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">AFP</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">SFS</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">ISR</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Descuentos</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Neto</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, i) => (
              <tr key={d.employeeId} className={`border-b border-[var(--border)] transition hover:bg-white/5 ${i === details.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-4 py-3">
                  <p className="text-sm text-[var(--text-primary)]">{d.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{d.occupation}</p>
                </td>
                <td className="amount px-4 py-3 text-right text-sm text-[var(--text-secondary)]">{formatRD(d.salaryBase)}</td>
                <td className="amount px-4 py-3 text-right text-sm text-[var(--violet)]">{formatRD(d.afp)}</td>
                <td className="amount px-4 py-3 text-right text-sm text-[var(--warning)]">{formatRD(d.sfs)}</td>
                <td className="amount px-4 py-3 text-right text-sm text-[var(--expense)]">{formatRD(d.isr)}</td>
                <td className="amount px-4 py-3 text-right text-sm text-[var(--text-secondary)]">{formatRD(d.totalDeductions)}</td>
                <td className="amount px-4 py-3 text-right text-sm font-semibold text-[var(--income)]">{formatRD(d.netSalary)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--border)] bg-[var(--bg-elevated)]">
              <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">Total ({details.length})</td>
              <td className="amount px-4 py-3 text-right text-sm text-[var(--text-secondary)]">{formatRD(totals.totalGross)}</td>
              <td colSpan={4} className="px-4 py-3 text-right text-xs text-[var(--text-muted)]">{formatRD(totals.totalDeductions)} en descuentos</td>
              <td className="amount px-4 py-3 text-right text-sm font-semibold text-[var(--income)]">{formatRD(totals.totalNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────

const HistoryTab = ({ payroll }: { payroll: UsePayroll }): JSX.Element => {
  const { payrollRecords } = payroll

  if (payrollRecords.length === 0) {
    return (
      <div className="surface-card grid h-40 place-items-center text-center text-[var(--text-secondary)]">
        <div>
          <History size={40} className="mx-auto mb-2 text-[var(--text-muted)]" />
          <p className="text-sm">No hay nóminas enviadas</p>
          <p className="text-xs text-[var(--text-muted)]">Las nóminas enviadas aparecerán aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {payrollRecords.map((record) => (
        <div key={record.id} className="surface-card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Nómina {new Date(`${record.period}-01T00:00:00`).toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {record.employeeCount} empleado{record.employeeCount !== 1 ? 's' : ''} · Enviada{' '}
                {new Date(record.sentAt).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="amount text-lg font-semibold text-[var(--income)]">{formatRD(record.totalNet)}</p>
              <p className="text-xs text-[var(--text-muted)]">neto total</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-3">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Bruto</p>
              <p className="amount text-sm text-[var(--text-secondary)]">{formatRD(record.totalGross)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Descuentos</p>
              <p className="amount text-sm text-[var(--expense)]">{formatRD(record.totalDeductions)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Neto</p>
              <p className="amount text-sm text-[var(--income)]">{formatRD(record.totalNet)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Shared form field ────────────────────────────────────────────────────────

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text'
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}): JSX.Element => (
  <div>
    <label className="mb-1 block text-xs text-[var(--text-muted)]">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={type === 'number' ? '0' : undefined}
      className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
    />
  </div>
)

