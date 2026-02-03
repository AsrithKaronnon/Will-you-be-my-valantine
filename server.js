import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 3001

const dataDir = path.join(__dirname, 'data')
const storePath = path.join(dataDir, 'status.json')

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ accepted: false, name: 'Ancy', timestamp: null }, null, 2))
  }
}

function readStatus() {
  ensureStore()
  try {
    const raw = fs.readFileSync(storePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return { accepted: false, name: 'Ancy', timestamp: null }
  }
}

function writeStatus(next) {
  ensureStore()
  fs.writeFileSync(storePath, JSON.stringify(next, null, 2))
}

app.use(cors())
app.use(express.json())

app.get('/api/status', (req, res) => {
  res.json(readStatus())
})

app.post('/api/accept', (req, res) => {
  const cur = readStatus()
  const { name, accepted } = req.body || {}
  const next = {
    ...cur,
    accepted: accepted !== undefined ? !!accepted : true,
    name: name || cur.name || 'Ancy',
    timestamp: new Date().toISOString(),
  }
  writeStatus(next)
  res.json({ ok: true, accepted: next.accepted, name: next.name })
})

// In production, serve the built client
const distDir = path.join(__dirname, 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
