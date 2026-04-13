const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 55, bottom: 65, left: 55, right: 55 },
  bufferPages: true,
  info: {
    Title: 'Tu Cualto App - Manual de Usuario',
    Author: 'Tu Cualto App',
    Subject: 'Guia completa para el uso de Tu Cualto App',
    Creator: 'Tu Cualto App'
  }
})

const output = path.join(__dirname, 'Manual_de_Usuario_TuCualto.pdf')
const stream = fs.createWriteStream(output)
doc.pipe(stream)

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#080810',
  surface: '#0f0f1a',
  elevated: '#161625',
  accent: '#b5ff4d',
  violet: '#7c3aed',
  expense: '#ff4560',
  warning: '#ffb830',
  textPrimary: '#1a1a2e',
  textBody: '#333348',
  textMuted: '#6a6a88',
  border: '#e0e0ea',
  borderLight: '#f0f0f5',
  white: '#ffffff',
  headerBar: '#0d0d18'
}

const PAGE_W = 612
const PAGE_H = 792
const ML = 55
const MR = 55
const CONTENT_W = PAGE_W - ML - MR
const BOTTOM_LIMIT = PAGE_H - 80

// ─── Helpers ──────────────────────────────────────────────────────────────────

function check(needed) {
  if (doc.y + needed > BOTTOM_LIMIT) {
    doc.addPage()
    drawTopBar()
    doc.x = ML
    doc.y = 55
  }
}

function drawTopBar() {
  doc.save()
  doc.rect(0, 0, PAGE_W, 5).fill(C.accent)
  doc.restore()
}

function sectionTitle(text) {
  check(55)
  const y = doc.y
  doc.save()
  doc.roundedRect(ML, y, 4, 24, 2).fill(C.accent)
  doc.restore()
  doc.font('Helvetica-Bold').fontSize(17).fillColor(C.textPrimary)
  doc.text(text, ML + 14, y + 3, { width: CONTENT_W - 14 })
  doc.x = ML
  doc.moveDown(0.6)
  const ly = doc.y
  doc.save()
  doc.moveTo(ML, ly).lineTo(ML + CONTENT_W, ly).lineWidth(0.5).strokeColor(C.border).stroke()
  doc.restore()
  doc.moveDown(0.5)
}

function subTitle(text) {
  check(28)
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(C.textPrimary)
  doc.text(text, ML, doc.y, { width: CONTENT_W })
  doc.font('Helvetica')
  doc.moveDown(0.25)
}

function body(text) {
  check(20)
  doc.font('Helvetica').fontSize(10).fillColor(C.textBody)
  doc.text(text, ML, doc.y, { width: CONTENT_W, lineGap: 3 })
  doc.moveDown(0.35)
}

function bullet(text) {
  check(16)
  doc.font('Helvetica').fontSize(10).fillColor(C.textBody)
  const bx = ML + 10
  doc.text('\u2022  ' + text, bx, doc.y, { width: CONTENT_W - 10, lineGap: 2.5 })
  doc.moveDown(0.1)
}

function step(num, title, desc) {
  check(40)
  const y = doc.y
  // circle
  doc.save()
  doc.circle(ML + 9, y + 7, 8).fill(C.accent)
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.headerBar)
  doc.text(String(num), ML + 1, y + 3, { width: 16, align: 'center' })
  doc.restore()
  // title
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C.textPrimary)
  doc.text(title, ML + 26, y + 1, { width: CONTENT_W - 30 })
  // desc
  doc.font('Helvetica').fontSize(10).fillColor(C.textBody)
  doc.text(desc, ML + 26, doc.y + 1, { width: CONTENT_W - 30, lineGap: 2.5 })
  doc.x = ML
  doc.moveDown(0.3)
}

function kbdRow(shortcut, action, context) {
  check(24)
  const y = doc.y
  doc.save()
  doc.roundedRect(ML, y, 92, 18, 3).lineWidth(0.5).fillAndStroke(C.white, C.border)
  doc.font('Courier-Bold').fontSize(8.5).fillColor(C.textPrimary)
  doc.text(shortcut, ML + 4, y + 4, { width: 84, align: 'center' })
  doc.restore()
  doc.font('Helvetica').fontSize(10).fillColor(C.textBody)
  doc.text(action, ML + 102, y + 3, { width: 190 })
  doc.font('Helvetica').fontSize(9).fillColor(C.textMuted)
  doc.text(context, ML + 300, y + 4, { width: CONTENT_W - 300 })
  doc.x = ML
  doc.y = y + 26
}

function faqItem(question, answer) {
  check(50)
  // Q
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C.textPrimary)
  doc.text('P:  ' + question, ML, doc.y, { width: CONTENT_W })
  doc.moveDown(0.1)
  // A
  doc.font('Helvetica').fontSize(10).fillColor(C.textBody)
  doc.text('R:  ' + answer, ML, doc.y, { width: CONTENT_W, lineGap: 2.5 })
  doc.moveDown(0.3)
  const ly = doc.y
  doc.save()
  doc.moveTo(ML, ly).lineTo(ML + CONTENT_W, ly).lineWidth(0.3).strokeColor(C.borderLight).dash(3, { space: 3 }).stroke()
  doc.undash()
  doc.restore()
  doc.moveDown(0.35)
}

function spacer(n) { doc.moveDown(n || 0.4) }

// ═══════════════════════════════════════════════════════════════════════════════
//  COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════════

doc.rect(0, 0, PAGE_W, PAGE_H).fill(C.bg)
doc.rect(0, 0, PAGE_W, 7).fill(C.accent)

// decorative shapes
doc.save()
doc.circle(490, 110, 70).fill('#0e0e1a')
doc.circle(490, 110, 45).lineWidth(0.8).strokeColor('#1c1c30').stroke()
doc.circle(120, 640, 50).fill('#0b0b15')
doc.restore()

// gradient card
doc.save()
const grad = doc.linearGradient(0, 270, 0, 500)
grad.stop(0, C.surface).stop(1, C.bg)
doc.roundedRect(ML, 270, CONTENT_W, 210, 14).fill(grad)
doc.roundedRect(ML, 270, CONTENT_W, 210, 14).lineWidth(0.8).strokeColor('#1e1e35').stroke()
doc.restore()

// logo circle
doc.save()
doc.circle(PAGE_W / 2, 190, 32).fill(C.accent)
doc.font('Helvetica-Bold').fontSize(26).fillColor(C.headerBar)
doc.text('TC', PAGE_W / 2 - 18, 178, { width: 36, align: 'center' })
doc.restore()

// texts
doc.font('Helvetica-Bold').fontSize(34).fillColor(C.white)
doc.text('Tu Cualto App', 0, 300, { width: PAGE_W, align: 'center' })
doc.font('Helvetica').fontSize(14).fillColor(C.accent)
doc.text('Manual de Usuario', 0, 348, { width: PAGE_W, align: 'center' })
doc.font('Helvetica').fontSize(10.5).fillColor(C.textMuted)
doc.text('Tu cualto. Tu flow. Siempre en control.', 0, 378, { width: PAGE_W, align: 'center' })
doc.font('Helvetica').fontSize(10).fillColor('#4a4a68')
doc.text('Version 1.0  |  Abril 2026', 0, 420, { width: PAGE_W, align: 'center' })

doc.font('Helvetica').fontSize(8.5).fillColor('#3a3a58')
doc.text('Gestion financiera personal y empresarial', 0, 685, { width: PAGE_W, align: 'center' })
doc.text('Aplicacion de escritorio  |  Electron + React', 0, 698, { width: PAGE_W, align: 'center' })

// ═══════════════════════════════════════════════════════════════════════════════
//  TABLE OF CONTENTS
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage()
drawTopBar()

doc.font('Helvetica-Bold').fontSize(22).fillColor(C.textPrimary)
doc.text('Contenido', ML, 55, { width: CONTENT_W })
doc.moveDown(0.4)
const sepY = doc.y
doc.save()
doc.moveTo(ML, sepY).lineTo(ML + CONTENT_W, sepY).lineWidth(1).strokeColor(C.accent).stroke()
doc.restore()
doc.moveDown(0.8)

const toc = [
  ['01', 'Introduccion', 'Bienvenida y descripcion general de la aplicacion'],
  ['02', 'Dashboard', 'Centro de control financiero con indicadores y graficos'],
  ['03', 'Transacciones', 'Gestion completa de ingresos y gastos'],
  ['04', 'Sistema de Nomina', 'Empleados, calculo de deducciones y generacion de nominas'],
  ['05', 'Atajos de Teclado', 'Acciones rapidas para mayor productividad'],
  ['06', 'Preguntas Frecuentes', 'Respuestas a las dudas mas comunes']
]

toc.forEach(([num, title, desc]) => {
  const y = doc.y
  doc.save()
  doc.roundedRect(ML, y, 32, 32, 6).fill(C.elevated)
  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.accent)
  doc.text(num, ML, y + 9, { width: 32, align: 'center' })
  doc.restore()
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.textPrimary)
  doc.text(title, ML + 44, y + 4, { width: CONTENT_W - 48 })
  doc.font('Helvetica').fontSize(9.5).fillColor(C.textMuted)
  doc.text(desc, ML + 44, doc.y + 1, { width: CONTENT_W - 48 })
  doc.x = ML
  doc.y = y + 48
})

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTENT — flows continuously, no forced page breaks
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. INTRODUCTION ─────────────────────────────────────────────────────────
doc.addPage()
drawTopBar()
doc.y = 55

sectionTitle('1. Introduccion')
body(
  'Tu Cualto App es tu herramienta integral de gestion financiera personal y empresarial. ' +
  'Disenada con un enfoque minimalista y moderno, te permite llevar un control preciso de ' +
  'tus ingresos y gastos, gestionar la nomina de tus empleados y tener una vision clara ' +
  'de tu situacion financiera en todo momento.'
)

spacer(0.2)
subTitle('Funcionalidades principales')
bullet('Dashboard — Vista general con balance, ingresos, gastos, graficos de tendencia y actividad reciente.')
bullet('Transacciones — Registra, edita, elimina y filtra todos tus movimientos financieros con categorias.')
bullet('Nomina — Gestiona empleados, calcula automaticamente deducciones legales (AFP, SFS, ISR) y genera nominas.')
bullet('Manual de Ayuda — Guia integrada accesible desde cualquier momento dentro de la aplicacion.')

spacer(0.2)
subTitle('Navegacion')
body(
  'La aplicacion cuenta con una barra lateral izquierda que te permite moverte entre las ' +
  'distintas secciones. La seccion activa se resalta con un indicador verde. La barra superior ' +
  'muestra el nombre de la aplicacion y los controles de ventana (minimizar, maximizar, cerrar).'
)

spacer(0.2)
subTitle('Requisitos del sistema')
bullet('Sistema operativo: Windows 10 o superior')
bullet('Memoria RAM: 4 GB minimo recomendado')
bullet('Espacio en disco: 200 MB disponibles')
bullet('Resolucion de pantalla: 1280 x 720 o superior')

spacer(0.2)
subTitle('Accesibilidad')
body(
  'Tu Cualto App ha sido disenada siguiendo las guias de accesibilidad WCAG 2.1 nivel AA. ' +
  'Incluye navegacion completa por teclado, etiquetas ARIA para lectores de pantalla, ' +
  'contraste de colores adecuado, trampas de foco en dialogos modales y un enlace para ' +
  'saltar directamente al contenido principal. Ademas, la seccion de accesibilidad permite ' +
  'activar alto contraste, texto grande y reduccion de animaciones para mejorar la lectura.'
)

// ─── 2. DASHBOARD ────────────────────────────────────────────────────────────

spacer(0.6)
sectionTitle('2. Dashboard')
body(
  'El Dashboard es tu centro de control financiero. Al abrir la aplicacion, esta es la ' +
  'primera pantalla que veras. Presenta toda tu informacion financiera resumida de forma ' +
  'visual e intuitiva.'
)

spacer(0.2)
subTitle('Indicadores principales')
bullet('Balance neto — Diferencia entre ingresos y gastos del periodo actual. Se presenta en tipografia grande y color verde.')
bullet('Ingresos totales — Suma acumulada de todos los ingresos registrados.')
bullet('Gastos totales — Suma acumulada de todos los gastos registrados.')
bullet('Tasa de ahorro — Porcentaje de ingresos que estas ahorrando, con barra de progreso visual.')

spacer(0.2)
subTitle('Grafico de flujo mensual')
body(
  'El grafico de area muestra la evolucion de tus ingresos (linea verde) y gastos (linea roja) ' +
  'a lo largo de los ultimos meses. Puedes pasar el cursor sobre los puntos para ' +
  'ver los valores exactos.'
)

spacer(0.2)
subTitle('Distribucion de gastos')
body(
  'El grafico circular descompone tus gastos por categoria, permitiendote ' +
  'identificar rapidamente en que areas estas gastando mas. En el centro ' +
  'se muestra el total de gastos.'
)

spacer(0.2)
subTitle('Actividad reciente')
body(
  'Muestra las ultimas 5 transacciones registradas con su descripcion, categoria, ' +
  'fecha relativa (hoy, ayer, hace X dias) y el monto con codigo de color ' +
  '(verde para ingresos, rojo para gastos).'
)

spacer(0.2)
subTitle('Resumen de nominas')
body(
  'En la parte inferior del Dashboard se muestra un widget con las ultimas nominas enviadas, ' +
  'incluyendo el periodo, cantidad de empleados y el monto neto total.'
)

// ─── 3. TRANSACTIONS ─────────────────────────────────────────────────────────

spacer(0.6)
sectionTitle('3. Transacciones')
body(
  'La seccion de Transacciones te permite gestionar todos tus movimientos financieros. ' +
  'Puedes crear, editar, eliminar, filtrar y buscar transacciones de forma rapida.'
)

spacer(0.2)
subTitle('Crear una nueva transaccion')

step(1, 'Abrir el formulario',
  'Presiona el boton verde "+" en la esquina inferior derecha, o usa Ctrl+N desde cualquier pagina.')

step(2, 'Seleccionar el tipo',
  'Elige entre "Ingreso" o "Gasto". Los botones cambian de color: verde para ingresos, rojo para gastos.')

step(3, 'Ingresar el monto',
  'Escribe el monto en pesos dominicanos (RD$). Acepta decimales.')

step(4, 'Completar los detalles',
  'Agrega una descripcion (obligatoria), selecciona la categoria, la fecha y opcionalmente una nota.')

step(5, 'Guardar',
  'Presiona "Guardar". Veras una notificacion verde de confirmacion. Si hay errores, se mostraran mensajes en rojo.')

spacer(0.2)
subTitle('Editar una transaccion')
body(
  'Pasa el cursor sobre cualquier transaccion para ver los botones de accion. ' +
  'Presiona el icono de lapiz para editar. El formulario se abrira con los datos precargados.'
)

spacer(0.2)
subTitle('Eliminar una transaccion')
body(
  'Presiona el icono de papelera en la transaccion que deseas eliminar. Se mostrara un ' +
  'dialogo de confirmacion. La eliminacion es permanente y no se puede deshacer.'
)

spacer(0.2)
subTitle('Filtrar y buscar')
body(
  'Usa los botones "Todos", "Ingresos" y "Gastos" para filtrar por tipo. ' +
  'El campo de busqueda permite buscar por descripcion, categoria o nota. ' +
  'La busqueda tiene un retardo de 300ms para optimizar el rendimiento.'
)

// ─── 4. NOMINA ───────────────────────────────────────────────────────────────

spacer(0.6)
sectionTitle('4. Sistema de Nomina')
body(
  'El sistema de nomina te permite gestionar empleados, calcular automaticamente las ' +
  'deducciones legales de la Republica Dominicana y generar nominas periodicas. ' +
  'La seccion se divide en tres pestanas.'
)

spacer(0.3)
subTitle('Pestana: Empleados')
body('Aqui puedes ver, agregar, editar y eliminar los empleados de tu organizacion.')

step(1, 'Agregar un empleado',
  'Presiona "Agregar empleado" y completa: Nombre, Ocupacion, Sueldo base (obligatorios), ' +
  'y opcionalmente Departamento, Telefono y Email.')

step(2, 'Editar un empleado',
  'Presiona el icono de lapiz en la columna "Acciones" del empleado a modificar.')

step(3, 'Eliminar un empleado',
  'Presiona el icono de papelera. Se pedira confirmacion antes de eliminar.')

spacer(0.3)
subTitle('Pestana: Generar Nomina')
body('Esta pestana muestra una tabla con todos los empleados y el calculo detallado de sus deducciones:')

bullet('AFP — Administradora de Fondos de Pensiones: 2.87% del salario bruto.')
bullet('SFS — Seguro Familiar de Salud: 3.04% del salario bruto.')
bullet('ISR — Impuesto Sobre la Renta: calculado segun la escala progresiva vigente.')

spacer(0.1)
body(
  'Selecciona el periodo (mes/ano) y presiona "Enviar nomina". La tabla muestra ' +
  'los totales generales en la fila inferior.'
)

spacer(0.3)
subTitle('Pestana: Historial')
body(
  'Muestra un registro cronologico de todas las nominas enviadas. Cada registro incluye: ' +
  'periodo, cantidad de empleados, fecha de envio, bruto total, descuentos y neto.'
)

// ─── 5. SHORTCUTS ────────────────────────────────────────────────────────────

spacer(0.6)
sectionTitle('5. Atajos de Teclado')
body('Tu Cualto App incluye atajos de teclado para acciones frecuentes:')

spacer(0.3)

// table header
const thY = doc.y
doc.save()
doc.roundedRect(ML, thY, CONTENT_W, 24, 3).fill(C.elevated)
doc.font('Helvetica-Bold').fontSize(8).fillColor(C.textMuted)
doc.text('ATAJO', ML + 10, thY + 8, { width: 80 })
doc.text('ACCION', ML + 102, thY + 8, { width: 180 })
doc.text('CONTEXTO', ML + 300, thY + 8, { width: 150 })
doc.restore()
doc.x = ML
doc.y = thY + 32

kbdRow('Ctrl + N', 'Crear nueva transaccion', 'Desde cualquier pagina')
kbdRow('Escape', 'Cerrar modal o dialogo', 'Modal abierto')
kbdRow('Tab', 'Navegar entre elementos', 'Global')
kbdRow('Shift+Tab', 'Navegar en reversa', 'Global')
kbdRow('Enter', 'Confirmar formulario', 'Dentro de un formulario')

spacer(0.5)
subTitle('Navegacion por teclado')
body(
  'Toda la aplicacion es navegable mediante el teclado. Usa Tab para avanzar entre ' +
  'elementos interactivos y Shift+Tab para retroceder. Los elementos enfocados se resaltan ' +
  'con un borde verde.'
)
body(
  'Los dialogos modales implementan una "trampa de foco" que mantiene la navegacion ' +
  'dentro del dialogo mientras esta abierto.'
)

// ─── 6. FAQ ──────────────────────────────────────────────────────────────────

spacer(0.6)
sectionTitle('6. Preguntas Frecuentes')
body('Respuestas a las preguntas mas comunes sobre Tu Cualto App.')
spacer(0.3)

faqItem(
  'Como creo mi primera transaccion?',
  'Ve a "Transacciones" desde el menu lateral y presiona el boton verde "+". Tambien puedes usar Ctrl+N.'
)
faqItem(
  'Puedo editar una transaccion despues de crearla?',
  'Si. Pasa el cursor sobre la transaccion y presiona el icono de lapiz. Se abrira el formulario con los datos precargados.'
)
faqItem(
  'Que pasa si elimino una transaccion o empleado?',
  'Se mostrara un dialogo de confirmacion. Una vez confirmada, la eliminacion es permanente.'
)
faqItem(
  'Como se calculan las deducciones de nomina?',
  'Se calculan automaticamente: AFP al 2.87%, SFS al 3.04%, e ISR segun la escala progresiva de la DGII.'
)
faqItem(
  'Puedo filtrar mis transacciones por tipo?',
  'Si. Usa los botones "Todos", "Ingresos" y "Gastos" en la parte superior. Tambien puedes usar el campo de busqueda.'
)
faqItem(
  'Donde puedo ver el historial de nominas?',
  'En "Nomina", selecciona la pestana "Historial". Alli se muestran todas las nominas enviadas con sus detalles.'
)
faqItem(
  'La aplicacion es accesible con lector de pantalla?',
  'Si. Incluye etiquetas ARIA, navegacion por teclado, trampa de foco en modales y enlace para saltar al contenido.'
)

// ═══════════════════════════════════════════════════════════════════════════════
//  BACK COVER
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage()
doc.rect(0, 0, PAGE_W, PAGE_H).fill(C.bg)
doc.rect(0, 0, PAGE_W, 5).fill(C.accent)

doc.save()
doc.circle(PAGE_W / 2, 340, 26).fill(C.accent)
doc.font('Helvetica-Bold').fontSize(20).fillColor(C.headerBar)
doc.text('TC', PAGE_W / 2 - 14, 330, { width: 28, align: 'center' })
doc.restore()

doc.font('Helvetica-Bold').fontSize(18).fillColor(C.white)
doc.text('Tu Cualto App', 0, 385, { width: PAGE_W, align: 'center' })
doc.font('Helvetica').fontSize(10).fillColor(C.textMuted)
doc.text('Tu cualto. Tu flow. Siempre en control.', 0, 412, { width: PAGE_W, align: 'center' })
doc.font('Helvetica').fontSize(9).fillColor('#4a4a68')
doc.text('Version 1.0  |  Abril 2026', 0, 450, { width: PAGE_W, align: 'center' })
doc.text('Electron + React + TypeScript', 0, 465, { width: PAGE_W, align: 'center' })
doc.rect(PAGE_W / 2 - 35, PAGE_H - 8, 70, 5).fill(C.accent)

// ═══════════════════════════════════════════════════════════════════════════════
//  ADD PAGE NUMBERS (using buffered pages)
// ═══════════════════════════════════════════════════════════════════════════════

const range = doc.bufferedPageRange()
// skip cover (page 0) and back cover (last page)
for (let i = 1; i < range.count - 1; i++) {
  doc.switchToPage(i)
  doc.save()
  doc.font('Helvetica').fontSize(8).fillColor(C.textMuted)
  doc.text('Tu Cualto App — Manual de Usuario', ML, PAGE_H - 45, { width: CONTENT_W / 2, align: 'left' })
  doc.text('Pagina ' + i, ML + CONTENT_W / 2, PAGE_H - 45, { width: CONTENT_W / 2, align: 'right' })
  doc.restore()
}

doc.end()

stream.on('finish', () => {
  console.log('PDF generado: ' + output)
})
