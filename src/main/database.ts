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

