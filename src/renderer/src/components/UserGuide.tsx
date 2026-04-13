import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Contrast,
  Eye,
  Keyboard,
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  HelpCircle,
  Mic,
  MicOff,
  Type,
  Zap
} from 'lucide-react'
import type { UseFinance } from '../hooks/useFinance'
import type { UsePayroll } from '../hooks/usePayroll'
import type { AccessibilitySettings } from '../types'

type SectionKey = 'intro' | 'dashboard' | 'transactions' | 'nomina' | 'shortcuts' | 'accessibility' | 'faq'

const sections: { key: SectionKey; label: string; icon: JSX.Element }[] = [
  { key: 'intro', label: 'Bienvenida', icon: <Zap size={15} aria-hidden="true" /> },
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} aria-hidden="true" /> },
  { key: 'transactions', label: 'Transacciones', icon: <ArrowLeftRight size={15} aria-hidden="true" /> },
  { key: 'nomina', label: 'Nómina', icon: <Calculator size={15} aria-hidden="true" /> },
  { key: 'shortcuts', label: 'Atajos de teclado', icon: <Keyboard size={15} aria-hidden="true" /> },
  { key: 'accessibility', label: 'Accesibilidad', icon: <Eye size={15} aria-hidden="true" /> },
  { key: 'faq', label: 'Preguntas frecuentes', icon: <HelpCircle size={15} aria-hidden="true" /> }
]

export const UserGuide = (_props: {
  finance: UseFinance
  payroll: UsePayroll
  accessibility: AccessibilitySettings
  onAccessibilityChange: (patch: Partial<AccessibilitySettings>) => void
}): JSX.Element => {
  const [active, setActive] = useState<SectionKey>('intro')

  return (
    <div className="flex gap-4 h-full" aria-label="Manual de usuario">
      {/* Sidebar navigation */}
      <nav className="w-48 shrink-0 space-y-1" aria-label="Secciones del manual">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            aria-current={active === s.key ? 'true' : undefined}
            className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition ${
              active === s.key
                ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="surface-card p-6 space-y-5">
          {active === 'intro' && <IntroSection />}
          {active === 'dashboard' && <DashboardSection />}
          {active === 'transactions' && <TransactionsSection />}
          {active === 'nomina' && <NominaSection />}
          {active === 'shortcuts' && <ShortcutsSection />}
          {active === 'accessibility' && <AccessibilitySection {..._props} />}
          {active === 'faq' && <FAQSection />}
        </div>
      </div>
    </div>
  )
}

// ─── Section Components ───────────────────────────────────────────────────────

const SectionTitle = ({ icon, children }: { icon: JSX.Element; children: React.ReactNode }): JSX.Element => (
  <div className="flex items-center gap-3 mb-4">
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-glow)]">
      {icon}
    </div>
    <h2 className="text-xl font-semibold text-[var(--text-primary)]">{children}</h2>
  </div>
)

const Paragraph = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{children}</p>
)

const SubTitle = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-2">{children}</h3>
)

const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }): JSX.Element => (
  <div className="flex gap-3 mb-3">
    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-xs font-bold text-[#080810]">
      {number}
    </div>
    <div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-0.5">{children}</p>
    </div>
  </div>
)

const Kbd = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <kbd className="inline-block rounded bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 text-xs font-mono text-[var(--text-primary)]">
    {children}
  </kbd>
)

const IntroSection = (): JSX.Element => (
  <>
    <SectionTitle icon={<Zap size={18} className="text-[var(--accent)]" />}>
      Bienvenido a Tu Cualto App
    </SectionTitle>
    <Paragraph>
      Tu Cualto App es tu herramienta de gestión financiera personal y empresarial.
      Con ella puedes llevar control de tus ingresos y gastos, gestionar la nómina
      de tus empleados y tener una visión clara de tu situación financiera.
    </Paragraph>
    <SubTitle>Funcionalidades principales</SubTitle>
    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
      <li className="flex items-start gap-2">
        <LayoutDashboard size={14} className="mt-0.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
        <span><strong className="text-[var(--text-primary)]">Dashboard</strong> — Vista general con balance, ingresos, gastos, gráficos y actividad reciente.</span>
      </li>
      <li className="flex items-start gap-2">
        <ArrowLeftRight size={14} className="mt-0.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
        <span><strong className="text-[var(--text-primary)]">Transacciones</strong> — Registra, edita, elimina y filtra tus movimientos financieros.</span>
      </li>
      <li className="flex items-start gap-2">
        <Calculator size={14} className="mt-0.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
        <span><strong className="text-[var(--text-primary)]">Nómina</strong> — Gestiona empleados, calcula deducciones (AFP, SFS, ISR) y genera nóminas.</span>
      </li>
    </ul>
    <SubTitle>Navegación</SubTitle>
    <Paragraph>
      Usa la barra lateral izquierda para moverte entre las secciones. La sección activa
      se resalta en verde. También puedes usar atajos de teclado para acciones rápidas.
    </Paragraph>
  </>
)

const DashboardSection = (): JSX.Element => (
  <>
    <SectionTitle icon={<LayoutDashboard size={18} className="text-[var(--accent)]" />}>
      Dashboard
    </SectionTitle>
    <Paragraph>
      El Dashboard es tu centro de control financiero. Aquí puedes ver de un vistazo
      toda tu información financiera resumida.
    </Paragraph>
    <SubTitle>Indicadores principales</SubTitle>
    <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
      <li>&#8226; <strong className="text-[var(--text-primary)]">Balance neto</strong> — Diferencia entre ingresos y gastos del mes actual.</li>
      <li>&#8226; <strong className="text-[var(--text-primary)]">Ingresos totales</strong> — Suma de todos tus ingresos registrados.</li>
      <li>&#8226; <strong className="text-[var(--text-primary)]">Gastos totales</strong> — Suma de todos tus gastos registrados.</li>
      <li>&#8226; <strong className="text-[var(--text-primary)]">Tasa de ahorro</strong> — Porcentaje de tus ingresos que estás ahorrando.</li>
    </ul>
    <SubTitle>Gráficos</SubTitle>
    <Paragraph>
      El gráfico de área muestra la evolución de tus ingresos (verde) y gastos (rojo)
      a lo largo de los meses. El gráfico circular muestra la distribución de tus gastos
      por categoría.
    </Paragraph>
    <SubTitle>Actividad reciente</SubTitle>
    <Paragraph>
      Muestra las últimas 5 transacciones registradas con su fecha relativa (hoy, ayer, etc.)
      y el monto correspondiente.
    </Paragraph>
  </>
)

const TransactionsSection = (): JSX.Element => (
  <>
    <SectionTitle icon={<ArrowLeftRight size={18} className="text-[var(--accent)]" />}>
      Transacciones
    </SectionTitle>
    <Paragraph>
      La sección de transacciones te permite gestionar todos tus movimientos financieros:
      ingresos y gastos.
    </Paragraph>

    <SubTitle>Crear una transacción</SubTitle>
    <Step number={1} title="Abrir el formulario">
      Presiona el botón verde <strong>+</strong> en la esquina inferior derecha, o usa el atajo <Kbd>Ctrl</Kbd> + <Kbd>N</Kbd>.
    </Step>
    <Step number={2} title="Seleccionar tipo">
      Elige entre <strong>Ingreso</strong> o <strong>Gasto</strong>.
    </Step>
    <Step number={3} title="Completar los datos">
      Ingresa el monto, una descripción, selecciona la categoría, la fecha y opcionalmente una nota.
    </Step>
    <Step number={4} title="Guardar">
      Presiona <strong>Guardar</strong>. Verás una notificación de confirmación.
    </Step>

    <SubTitle>Editar una transacción</SubTitle>
    <Paragraph>
      Pasa el cursor sobre cualquier transacción para ver los botones de acción.
      Presiona el ícono de lápiz para editar. Se abrirá el formulario con los datos
      precargados.
    </Paragraph>

    <SubTitle>Eliminar una transacción</SubTitle>
    <Paragraph>
      Presiona el ícono de papelera en la transacción. Se mostrará un diálogo de
      confirmación antes de eliminar. Esta acción no se puede deshacer.
    </Paragraph>

    <SubTitle>Filtrar y buscar</SubTitle>
    <Paragraph>
      Usa los botones de filtro (Todos, Ingresos, Gastos) para filtrar por tipo.
      El campo de búsqueda permite buscar por descripción, categoría o nota.
    </Paragraph>
  </>
)

const NominaSection = (): JSX.Element => (
  <>
    <SectionTitle icon={<Calculator size={18} className="text-[var(--accent)]" />}>
      Nómina
    </SectionTitle>
    <Paragraph>
      El sistema de nómina te permite gestionar empleados, calcular deducciones legales
      de República Dominicana y generar nóminas periódicas.
    </Paragraph>

    <SubTitle>Pestaña: Empleados</SubTitle>
    <Step number={1} title="Agregar empleado">
      Presiona <strong>Agregar empleado</strong> y completa el formulario con nombre,
      ocupación, sueldo base y datos opcionales (departamento, teléfono, email).
    </Step>
    <Step number={2} title="Editar empleado">
      Usa el ícono de lápiz en la tabla para editar los datos de un empleado.
    </Step>
    <Step number={3} title="Eliminar empleado">
      Usa el ícono de papelera. Se pedirá confirmación antes de eliminar.
    </Step>

    <SubTitle>Pestaña: Generar Nómina</SubTitle>
    <Paragraph>
      Aquí verás una tabla con todos los empleados y sus cálculos de deducciones:
    </Paragraph>
    <ul className="space-y-1.5 text-sm text-[var(--text-secondary)] ml-4">
      <li>&#8226; <strong className="text-[var(--text-primary)]">AFP</strong> — Aporte al fondo de pensiones (2.87% del salario).</li>
      <li>&#8226; <strong className="text-[var(--text-primary)]">SFS</strong> — Seguro Familiar de Salud (3.04% del salario).</li>
      <li>&#8226; <strong className="text-[var(--text-primary)]">ISR</strong> — Impuesto Sobre la Renta (según escala vigente).</li>
    </ul>
    <Paragraph>
      Selecciona el período (mes/año) y presiona <strong>Enviar nómina</strong> para
      registrar la nómina.
    </Paragraph>

    <SubTitle>Pestaña: Historial</SubTitle>
    <Paragraph>
      Muestra todas las nóminas enviadas con el detalle de bruto, descuentos y neto
      total por período.
    </Paragraph>
  </>
)

const ShortcutsSection = (): JSX.Element => (
  <>
    <SectionTitle icon={<Keyboard size={18} className="text-[var(--accent)]" />}>
      Atajos de teclado
    </SectionTitle>
    <Paragraph>
      Usa estos atajos para trabajar más rápido:
    </Paragraph>
    <div className="mt-3 surface-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Atajo</th>
            <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Acción</th>
            <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Contexto</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[var(--border)]">
            <td className="px-4 py-3"><Kbd>Ctrl</Kbd> + <Kbd>N</Kbd></td>
            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">Nueva transacción</td>
            <td className="px-4 py-3 text-sm text-[var(--text-muted)]">Desde cualquier página</td>
          </tr>
          <tr className="border-b border-[var(--border)]">
            <td className="px-4 py-3"><Kbd>Escape</Kbd></td>
            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">Cerrar modal / diálogo</td>
            <td className="px-4 py-3 text-sm text-[var(--text-muted)]">Cuando hay un modal abierto</td>
          </tr>
          <tr>
            <td className="px-4 py-3"><Kbd>Tab</Kbd></td>
            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">Navegar entre elementos</td>
            <td className="px-4 py-3 text-sm text-[var(--text-muted)]">Global</td>
          </tr>
        </tbody>
      </table>
    </div>
  </>
)

const AccessibilitySection = ({
  accessibility,
  onAccessibilityChange
}: {
  accessibility: AccessibilitySettings
  onAccessibilityChange: (patch: Partial<AccessibilitySettings>) => void
}): JSX.Element => {
  const preferences = [
    {
      key: 'highContrast' as const,
      icon: <Contrast size={18} aria-hidden="true" />,
      title: 'Alto contraste',
      description: 'Aumenta la separación entre texto, fondos y bordes para reducir esfuerzo visual.'
    },
    {
      key: 'largeText' as const,
      icon: <Type size={18} aria-hidden="true" />,
      title: 'Texto grande',
      description: 'Incrementa el tamaño base de la tipografía para mejorar la lectura.'
    },
    {
      key: 'reducedMotion' as const,
      icon: <Eye size={18} aria-hidden="true" />,
      title: 'Reducir animaciones',
      description: 'Reduce transiciones y animaciones para una lectura más estable.'
    },
    {
      key: 'narrator' as const,
      icon: <Mic size={18} aria-hidden="true" />,
      title: 'Narrador',
      description: 'Lee en voz alta la pantalla actual y cambia automáticamente cuando navegas entre secciones.'
    }
  ]

  return (
    <>
      <SectionTitle icon={<Eye size={18} className="text-[var(--accent)]" />}>
        Accesibilidad visual
      </SectionTitle>
      <Paragraph>
        Activa estas opciones para adaptar la interfaz a usuarios con baja visión, sensibilidad al movimiento
        o necesidad de un contraste más marcado.
      </Paragraph>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {preferences.map((preference) => {
          const active = accessibility[preference.key]

          return (
            <button
              key={preference.key}
              type="button"
              onClick={() => onAccessibilityChange({ [preference.key]: !active } as Partial<AccessibilitySettings>)}
              aria-pressed={active}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--text-primary)]'
                  : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-black/20 text-[var(--accent)]">
                  {preference.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{preference.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{active ? 'Activo' : 'Inactivo'}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{preference.description}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAccessibilityChange({ highContrast: true, largeText: true, reducedMotion: true })}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#080810]"
        >
          Activar perfil recomendado
        </button>
        <button
          type="button"
          onClick={() => onAccessibilityChange({ highContrast: false, largeText: false, reducedMotion: false })}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          Restablecer
        </button>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-black/20 text-[var(--accent)]">
            {accessibility.narrator ? <Mic size={18} aria-hidden="true" /> : <MicOff size={18} aria-hidden="true" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Estado del narrador</p>
            <p className="text-xs text-[var(--text-muted)]">
              {accessibility.narrator
                ? 'El narrador está activo. Cambia de pantalla para escuchar la información principal.'
                : 'El narrador está apagado. Actívalo para escuchar la app.'}
            </p>
          </div>
        </div>
      </div>

      <SubTitle>Qué cambia</SubTitle>
      <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
        <li>&#8226; El alto contraste refuerza colores, bordes y foco visible.</li>
        <li>&#8226; El texto grande aumenta la legibilidad en toda la app.</li>
        <li>&#8226; Reducir animaciones atenúa transiciones para minimizar distracciones visuales.</li>
        <li>&#8226; El narrador lee en voz alta la sección activa y ayuda a navegar sin depender de la vista.</li>
      </ul>
    </>
  )
}

const FAQSection = (): JSX.Element => {
  const faqs = [
    {
      q: '¿Cómo creo mi primera transacción?',
      a: 'Ve a la sección "Transacciones" desde el menú lateral y presiona el botón verde "+" en la esquina inferior derecha. También puedes usar Ctrl+N desde cualquier página.'
    },
    {
      q: '¿Puedo editar una transacción después de crearla?',
      a: 'Sí, pasa el cursor sobre la transacción y presiona el ícono de lápiz. Se abrirá el formulario con los datos precargados para que los modifiques.'
    },
    {
      q: '¿Qué pasa si elimino una transacción o empleado?',
      a: 'Se mostrará un diálogo de confirmación. Una vez confirmada, la eliminación es permanente y no se puede deshacer.'
    },
    {
      q: '¿Cómo se calculan las deducciones de nómina?',
      a: 'Las deducciones se calculan automáticamente según las tasas vigentes de la República Dominicana: AFP (2.87%), SFS (3.04%) e ISR (según escala progresiva).'
    },
    {
      q: '¿Puedo filtrar mis transacciones?',
      a: 'Sí, usa los botones "Todos", "Ingresos" y "Gastos" para filtrar por tipo. También puedes usar el campo de búsqueda para buscar por descripción, categoría o nota.'
    },
    {
      q: '¿Dónde puedo ver el historial de nóminas?',
      a: 'En la sección "Nómina", selecciona la pestaña "Historial". Allí verás todas las nóminas enviadas con sus detalles.'
    }
  ]

  return (
    <>
      <SectionTitle icon={<HelpCircle size={18} className="text-[var(--accent)]" />}>
        Preguntas frecuentes
      </SectionTitle>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </>
  )
}

const FAQItem = ({ question, answer }: { question: string; answer: string }): JSX.Element => {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-white/5"
      >
        {open ? <ChevronDown size={14} className="text-[var(--accent)] shrink-0" /> : <ChevronRight size={14} className="text-[var(--text-muted)] shrink-0" />}
        <span className="flex-1">{question}</span>
        <BookOpen size={13} className="text-[var(--text-muted)] shrink-0" aria-hidden="true" />
      </button>
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}
