import { app } from 'electron'
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

let db: Database.Database | null = null

const seedCategories = [
  ['Salario', 'income'],
  ['Freelance', 'income'],
  ['Comida', 'expense'],
  ['Transporte', 'expense'],
  ['Servicios', 'expense'],
  ['Vivienda', 'expense'],
  ['Entretenimiento', 'expense'],
  ['Ahorros', 'expense']
] as const

export const getDb = (): Database.Database => {
  if (db) return db

  const userData = app.getPath('userData')
  const dbDir = path.join(userData, 'data')
  mkdirSync(dbDir, { recursive: true })
  const dbPath = path.join(dbDir, 'tucualto.db')

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

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
  `)

  const count = db.prepare('SELECT COUNT(*) as total FROM categories').get() as { total: number }
  if (!count.total) {
    const insertCategory = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)')
    const tx = db.transaction(() => {
      seedCategories.forEach(([name, type]) => insertCategory.run(name, type))
    })
    tx()
  }

  return db
}

export const closeDb = (): void => {
  if (db) {
    db.close()
    db = null
  }
}

