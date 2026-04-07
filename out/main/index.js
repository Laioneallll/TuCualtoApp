import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import path, { join } from "node:path";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
let db = null;
const seedCategories = [
  ["Salario", "income"],
  ["Freelance", "income"],
  ["Comida", "expense"],
  ["Transporte", "expense"],
  ["Servicios", "expense"],
  ["Vivienda", "expense"],
  ["Entretenimiento", "expense"],
  ["Ahorros", "expense"]
];
const getDb = () => {
  if (db) return db;
  const userData = app.getPath("userData");
  const dbDir = path.join(userData, "data");
  mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, "tucualto.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount >= 0),
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      categoryId INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(categoryId) REFERENCES categories(id)
    );

    CREATE TRIGGER IF NOT EXISTS transactions_updated_at
    AFTER UPDATE ON transactions
    BEGIN
      UPDATE transactions SET updatedAt = datetime('now') WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      occupation TEXT NOT NULL,
      salaryBase REAL NOT NULL DEFAULT 0 CHECK(salaryBase >= 0),
      department TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payroll_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period TEXT NOT NULL,
      employeeCount INTEGER NOT NULL,
      totalGross REAL NOT NULL,
      totalNet REAL NOT NULL,
      totalDeductions REAL NOT NULL,
      details TEXT NOT NULL DEFAULT '[]',
      sentAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const count = db.prepare("SELECT COUNT(*) as total FROM categories").get();
  if (!count.total) {
    const insertCategory = db.prepare("INSERT INTO categories (name, type) VALUES (?, ?)");
    const tx = db.transaction(() => {
      seedCategories.forEach(([name, type]) => insertCategory.run(name, type));
    });
    tx();
  }
  return db;
};
const closeDb = () => {
  if (db) {
    db.close();
    db = null;
  }
};
const round2 = (value) => Math.round(value * 100) / 100;
const calculateNomina = (salary) => {
  const safeSalary = Number.isFinite(salary) && salary > 0 ? salary : 0;
  const afp = safeSalary * 0.0287;
  const sfs = safeSalary * 0.0304;
  const taxable = Math.max(safeSalary - afp - sfs, 0);
  const annualTaxable = taxable * 12;
  let annualIsr = 0;
  if (annualTaxable > 867123) {
    annualIsr = 79776 + (annualTaxable - 867123) * 0.25;
  } else if (annualTaxable > 624329) {
    annualIsr = 31216 + (annualTaxable - 624329) * 0.2;
  } else if (annualTaxable > 416220) {
    annualIsr = (annualTaxable - 416220) * 0.15;
  }
  const isr = annualIsr / 12;
  const totalDeductions = afp + sfs + isr;
  const netSalary = safeSalary - totalDeductions;
  return {
    salary: round2(safeSalary),
    afp: round2(afp),
    sfs: round2(sfs),
    taxable: round2(taxable),
    isr: round2(isr),
    totalDeductions: round2(totalDeductions),
    netSalary: round2(netSalary)
  };
};
let mainWindow = null;
const createAppIcon = () => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" rx="56" fill="#080810"/>
    <rect x="20" y="20" width="216" height="216" rx="48" fill="#0f0f1a" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>
    <path d="M70 162l34-68 30 40 26-30 26 58H70z" fill="#7c3aed" fill-opacity="0.85"/>
    <path d="M72 150l28-56 36 30 22-28 24 54H72z" fill="#b5ff4d"/>
  </svg>`;
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`);
};
const createWindow = () => {
  const icon = createAppIcon();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#070b14",
    icon,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.on("maximize", () => mainWindow?.webContents.send("window:maximized", true));
  mainWindow.on("unmaximize", () => mainWindow?.webContents.send("window:maximized", false));
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
};
const registerIpc = () => {
  const db2 = getDb();
  ipcMain.handle("transactions:list", () => {
    const rows = db2.prepare(
      `SELECT t.id, t.title, t.amount, t.type, t.categoryId, c.name as categoryName, t.date, t.note, t.createdAt, t.updatedAt
         FROM transactions t
         JOIN categories c ON c.id = t.categoryId
         ORDER BY date(t.date) DESC, t.id DESC`
    ).all();
    return rows;
  });
  ipcMain.handle("transactions:create", (_event, payload) => {
    const stmt = db2.prepare(
      "INSERT INTO transactions (title, amount, type, categoryId, date, note) VALUES (@title, @amount, @type, @categoryId, @date, @note)"
    );
    const result = stmt.run({ ...payload, note: payload.note ?? "" });
    return { id: Number(result.lastInsertRowid) };
  });
  ipcMain.handle("transactions:update", (_event, id, payload) => {
    const stmt = db2.prepare(
      `UPDATE transactions
       SET title=@title, amount=@amount, type=@type, categoryId=@categoryId, date=@date, note=@note
       WHERE id=@id`
    );
    const result = stmt.run({ id, ...payload, note: payload.note ?? "" });
    return { updated: result.changes > 0 };
  });
  ipcMain.handle("transactions:delete", (_event, id) => {
    const result = db2.prepare("DELETE FROM transactions WHERE id = ?").run(id);
    return { deleted: result.changes > 0 };
  });
  ipcMain.handle("categories:list", () => db2.prepare("SELECT id, name, type FROM categories ORDER BY name ASC").all());
  ipcMain.handle("stats:dashboard", () => {
    const summary = db2.prepare(
      `SELECT
          COALESCE(SUM(CASE WHEN type='income' THEN amount END), 0) as totalIncome,
          COALESCE(SUM(CASE WHEN type='expense' THEN amount END), 0) as totalExpense
         FROM transactions`
    ).get();
    const monthly = db2.prepare(
      `SELECT strftime('%Y-%m', date) as month,
          COALESCE(SUM(CASE WHEN type='income' THEN amount END), 0) as income,
          COALESCE(SUM(CASE WHEN type='expense' THEN amount END), 0) as expense
         FROM transactions
         GROUP BY strftime('%Y-%m', date)
         ORDER BY month DESC
         LIMIT 6`
    ).all().reverse();
    const categoryBreakdown = db2.prepare(
      `SELECT c.name as category, t.type as type, COALESCE(SUM(t.amount),0) as total
         FROM transactions t
         JOIN categories c ON c.id = t.categoryId
         GROUP BY c.name, t.type
         ORDER BY total DESC`
    ).all();
    return {
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      balance: summary.totalIncome - summary.totalExpense,
      monthly,
      categoryBreakdown
    };
  });
  ipcMain.handle("nomina:calculate", (_event, salary) => calculateNomina(salary));
  ipcMain.handle(
    "employees:list",
    () => db2.prepare("SELECT * FROM employees ORDER BY name ASC").all()
  );
  ipcMain.handle("employees:create", (_event, payload) => {
    const stmt = db2.prepare(
      "INSERT INTO employees (name, occupation, salaryBase, department, phone, email) VALUES (@name, @occupation, @salaryBase, @department, @phone, @email)"
    );
    const result = stmt.run({
      name: payload.name,
      occupation: payload.occupation,
      salaryBase: payload.salaryBase,
      department: payload.department ?? "",
      phone: payload.phone ?? "",
      email: payload.email ?? ""
    });
    return { id: Number(result.lastInsertRowid) };
  });
  ipcMain.handle("employees:update", (_event, id, payload) => {
    const stmt = db2.prepare(
      "UPDATE employees SET name=@name, occupation=@occupation, salaryBase=@salaryBase, department=@department, phone=@phone, email=@email WHERE id=@id"
    );
    const result = stmt.run({
      id,
      name: payload.name,
      occupation: payload.occupation,
      salaryBase: payload.salaryBase,
      department: payload.department ?? "",
      phone: payload.phone ?? "",
      email: payload.email ?? ""
    });
    return { updated: result.changes > 0 };
  });
  ipcMain.handle("employees:delete", (_event, id) => {
    const result = db2.prepare("DELETE FROM employees WHERE id = ?").run(id);
    return { deleted: result.changes > 0 };
  });
  ipcMain.handle("payroll:send", (_event, payload) => {
    const stmt = db2.prepare(
      "INSERT INTO payroll_records (period, employeeCount, totalGross, totalNet, totalDeductions, details) VALUES (@period, @employeeCount, @totalGross, @totalNet, @totalDeductions, @details)"
    );
    const result = stmt.run({
      period: payload.period,
      employeeCount: payload.employeeCount,
      totalGross: payload.totalGross,
      totalNet: payload.totalNet,
      totalDeductions: payload.totalDeductions,
      details: JSON.stringify(payload.details ?? [])
    });
    return { id: Number(result.lastInsertRowid) };
  });
  ipcMain.handle(
    "payroll:list",
    () => db2.prepare(
      "SELECT id, period, employeeCount, totalGross, totalNet, totalDeductions, sentAt FROM payroll_records ORDER BY sentAt DESC LIMIT 20"
    ).all()
  );
  ipcMain.handle("window:minimize", () => mainWindow?.minimize());
  ipcMain.handle("window:toggle-maximize", () => {
    if (!mainWindow) return false;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    }
    mainWindow.maximize();
    return true;
  });
  ipcMain.handle("window:is-maximized", () => mainWindow?.isMaximized() ?? false);
  ipcMain.handle("window:close", () => mainWindow?.close());
};
app.whenReady().then(() => {
  registerIpc();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", () => {
  closeDb();
});
