import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'frontend', 'dist')
const temp = path.join(root, '.pages-tmp')
const zip = path.join(root, 'yaodi-portfolio-pages.zip')

if (!fs.existsSync(path.join(source, 'index.html'))) {
  throw new Error('frontend/dist is missing. Run the build first.')
}

fs.rmSync(temp, { recursive: true, force: true })
fs.cpSync(source, temp, { recursive: true })

// Cloudflare Pages only accepts 200/301/302/303/307/308 redirects.
// API routes are intentionally not redirected: this package is frontend-only.
fs.writeFileSync(
  path.join(temp, '_redirects'),
  ['/*  /index.html  200', ''].join('\n'),
)

fs.rmSync(zip, { force: true })
execFileSync('zip', ['-r', zip, '.', '-x', '*.DS_Store'], { cwd: temp, stdio: 'ignore' })
fs.rmSync(temp, { recursive: true, force: true })

const size = (fs.statSync(zip).size / 1024 / 1024).toFixed(1)
console.log(`Pages package: ${zip} (${size} MB)`)
