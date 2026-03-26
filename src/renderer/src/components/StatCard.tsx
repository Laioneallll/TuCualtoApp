interface StatCardProps {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger'
}

const toneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-slate-100',
  success: 'text-emerald-300',
  danger: 'text-rose-300'
}

export const StatCard = ({ label, value, tone = 'default' }: StatCardProps): JSX.Element => (
  <div className="card p-5 shadow-glow">
    <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</p>
    <p className={`mt-3 text-2xl font-semibold ${toneClass[tone]}`}>{value}</p>
  </div>
)

