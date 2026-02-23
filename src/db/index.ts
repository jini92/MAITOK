import Database, { type Database as DatabaseType } from 'better-sqlite3'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DB_PATH = process.env.DB_PATH ?? join(__dirname, '../../data/tikly.db')

mkdirSync(dirname(DB_PATH), { recursive: true })

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')

export const db: DatabaseType = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.exec(schema)

export default db
