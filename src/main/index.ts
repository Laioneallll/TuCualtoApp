import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import { join } from 'node:path'
import { closeDb, getDb } from './database'
import { calculateNomina } from '../renderer/src/utils/nominaCalc'

let mainWindow: BrowserWindow | null = null

const createAppIcon = () => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" rx="56" fill="#080810"/>
    <rect x="20" y="20" width="216" height="216" rx="48" fill="#0f0f1a" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>
    <path d="M70 162l34-68 30 40 26-30 26 58H70z" fill="#7c3aed" fill-opacity="0.85"/>
    <path d="M72 150l28-56 36 30 22-28 24 54H72z" fill="#b5ff4d"/>
  </svg>`
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`)
}

const createWindow = (): void => {
  const icon = createAppIcon()
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#070b14',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('maximize', () => mainWindow?.webContents.send('window:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window:maximized', false))

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const registerIpc = (): void => {
  const db = getDb()

  ipcMain.handle('transactions:list', () => {
    const rows = db
      .prepare(
        `SELECT t.id, t.title, t.amount, t.type, t.categoryId, c.name as categoryName, t.date, t.note, t.createdAt, t.updatedAt
         FROM transactions t
         JOIN categories c ON c.id = t.categoryId
         ORDER BY date(t.date) DESC, t.id DESC`
      )
      .all()
    return rows
  })

  ipcMain.handle('transactions:create', (_event, payload) => {
    const stmt = db.prepare(
      'INSERT INTO transactions (title, amount, type, categoryId, date, note) VALUES (@title, @amount, @type, @categoryId, @date, @note)'
    )
    const result = stmt.run({ ...payload, note: payload.note ?? '' })
    return { id: Number(result.lastInsertRowid) }
  })

  ipcMain.handle('transactions:update', (_event, id: number, payload) => {
    const stmt = db.prepare(
      `UPDATE transactions
       SET title=@title, amount=@amount, type=@type, categoryId=@categoryId, date=@date, note=@note
       WHERE id=@id`
    )
    const result = stmt.run({ id, ...payload, note: payload.note ?? '' })
    return { updated: result.changes > 0 }
  })

  ipcMain.handle('transactions:delete', (_event, id: number) => {
    const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
    return { deleted: result.changes > 0 }
  })

  ipcMain.handle('categories:list', () => db.prepare('SELECT id, name, type FROM categories ORDER BY name ASC').all())

  ipcMain.handle('stats:dashboard', () => {
    const summary = db
      .prepare(
        `SELECT
          COALESCE(SUM(CASE WHEN type='income' THEN amount END), 0) as totalIncome,
          COALESCE(SUM(CASE WHEN type='expense' THEN amount END), 0) as totalExpense
         FROM transactions`
      )
      .get() as { totalIncome: number; totalExpense: number }

    const monthly = db
      .prepare(
        `SELECT strftime('%Y-%m', date) as month,
          COALESCE(SUM(CASE WHEN type='income' THEN amount END), 0) as income,
          COALESCE(SUM(CASE WHEN type='expense' THEN amount END), 0) as expense
         FROM transactions
         GROUP BY strftime('%Y-%m', date)
         ORDER BY month DESC
         LIMIT 6`
      )
      .all()
      .reverse()

    const categoryBreakdown = db
      .prepare(
        `SELECT c.name as category, t.type as type, COALESCE(SUM(t.amount),0) as total
         FROM transactions t
         JOIN categories c ON c.id = t.categoryId
         GROUP BY c.name, t.type
         ORDER BY total DESC`
      )
      .all()

    return {
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      balance: summary.totalIncome - summary.totalExpense,
      monthly,
      categoryBreakdown
    }
  })

  ipcMain.handle('nomina:calculate', (_event, salary: number) => calculateNomina(salary))

  // ─── Employee handlers ────────────────────────────────────────────────────
  ipcMain.handle('employees:list', () =>
    db.prepare('SELECT * FROM employees ORDER BY name ASC').all()
  )

  ipcMain.handle('employees:create', (_event, payload) => {
    const stmt = db.prepare(
      'INSERT INTO employees (name, occupation, salaryBase, department, phone, email) VALUES (@name, @occupation, @salaryBase, @department, @phone, @email)'
    )
    const result = stmt.run({
      name: payload.name,
      occupation: payload.occupation,
      salaryBase: payload.salaryBase,
      department: payload.department ?? '',
      phone: payload.phone ?? '',
      email: payload.email ?? ''
    })
    return { id: Number(result.lastInsertRowid) }
  })

  ipcMain.handle('employees:update', (_event, id: number, payload) => {
    const stmt = db.prepare(
      'UPDATE employees SET name=@name, occupation=@occupation, salaryBase=@salaryBase, department=@department, phone=@phone, email=@email WHERE id=@id'
    )
    const result = stmt.run({
      id,
      name: payload.name,
      occupation: payload.occupation,
      salaryBase: payload.salaryBase,
      department: payload.department ?? '',
      phone: payload.phone ?? '',
      email: payload.email ?? ''
    })
    return { updated: result.changes > 0 }
  })

  ipcMain.handle('employees:delete', (_event, id: number) => {
    const result = db.prepare('DELETE FROM employees WHERE id = ?').run(id)
    return { deleted: result.changes > 0 }
  })

  // ─── Payroll handlers ─────────────────────────────────────────────────────
  ipcMain.handle('payroll:send', (_event, payload) => {
    const stmt = db.prepare(
      'INSERT INTO payroll_records (period, employeeCount, totalGross, totalNet, totalDeductions, details) VALUES (@period, @employeeCount, @totalGross, @totalNet, @totalDeductions, @details)'
    )
    const result = stmt.run({
      period: payload.period,
      employeeCount: payload.employeeCount,
      totalGross: payload.totalGross,
      totalNet: payload.totalNet,
      totalDeductions: payload.totalDeductions,
      details: JSON.stringify(payload.details ?? [])
    })
    return { id: Number(result.lastInsertRowid) }
  })

  ipcMain.handle('payroll:list', () =>
    db
      .prepare(
        'SELECT id, period, employeeCount, totalGross, totalNet, totalDeductions, sentAt FROM payroll_records ORDER BY sentAt DESC LIMIT 20'
      )
      .all()
  )

  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:toggle-maximize', () => {
    if (!mainWindow) return false
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
      return false
    }
    mainWindow.maximize()
    return true
  })
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false)
  ipcMain.handle('window:close', () => mainWindow?.close())
}

app.whenReady().then(() => {
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  closeDb()
})

