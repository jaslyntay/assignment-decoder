// Local preview: serves public/ and runs api/decode.js the way Vercel would.
// Run with: npm run dev   (reads ANTHROPIC_API_KEY from .env if present)
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
const { default: decode } = await import('./api/decode.js')

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' }
const PORT = Number(process.env.PORT) || 5173

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname === '/api/decode') {
    let raw = ''
    for await (const chunk of req) raw += chunk
    try { req.body = JSON.parse(raw || '{}') } catch { req.body = {} }
    res.status = (code) => { res.statusCode = code; return res }
    res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
    return decode(req, res)
  }
  const path = normalize(join('public', url.pathname === '/' ? 'index.html' : url.pathname))
  if (!path.startsWith('public')) { res.statusCode = 403; return res.end() }
  try {
    const body = await readFile(path)
    res.setHeader('Content-Type', TYPES[extname(path)] || 'application/octet-stream')
    res.end(body)
  } catch {
    res.statusCode = 404
    res.end('Not found')
  }
}).listen(PORT, () => {
  console.log(`Assignment Decoder running at http://localhost:${PORT}`)
  console.log(process.env.ANTHROPIC_API_KEY ? 'Live decoding is on.' : 'No ANTHROPIC_API_KEY set: examples work, live decoding is off.')
})
