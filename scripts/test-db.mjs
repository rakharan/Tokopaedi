import { execSync, spawnSync } from 'child_process'
import mysql from 'mysql2/promise'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('[test-db] Starting test MySQL and Redis containers...')
execSync('docker compose -f docker-compose.test.yml up -d --wait --wait-timeout 120', {
  cwd: rootDir,
  stdio: 'inherit',
})

console.log('[test-db] Resetting tokopaedi_test database...')
let connection
for (let i = 0; i < 30; i++) {
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3308,
      user: 'root',
      password: 'test',
      multipleStatements: true,
    })
    break
  } catch (err) {
    if (i === 29) throw err
    await new Promise((r) => setTimeout(r, 1000))
  }
}

await connection.query('DROP DATABASE IF EXISTS `tokopaedi_test`; CREATE DATABASE `tokopaedi_test`;')
await connection.end()

console.log('[test-db] Running migrations and seeds...')
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const migrateEnv = {
  ...process.env,
  NODE_ENV: 'development',
  DB_IDENTIFIER: 'mysql',
  DB_HOST: '127.0.0.1',
  DB_PORT: '3308',
  DB_DATABASE: 'tokopaedi_test',
  DB_USER: 'root',
  DB_PASSWORD: 'test',
  TESTING: '',
  PRODUCTION: '',
}

const result = spawnSync(npmCmd, ['run', 'migrate:run'], {
  cwd: rootDir,
  env: migrateEnv,
  shell: true,
  stdio: 'inherit',
})

if (result.status !== 0) {
  console.error('[test-db] Migration failed')
  process.exit(result.status ?? 1)
}

console.log('[test-db] Database ready for integration tests.')
