import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const assets = path.join(dist, 'assets')

const seedSource = path.join(root, 'backend', 'data', 'content.json')
const seedTargets = [
  path.join(root, 'server', 'seed-content.json'),
  path.join(root, 'worker', 'seed-content.json'),
]
if (fs.existsSync(seedSource)) {
  for (const seedTarget of seedTargets) {
    fs.mkdirSync(path.dirname(seedTarget), { recursive: true })
    fs.copyFileSync(seedSource, seedTarget)
  }
}

fs.rmSync(dist, { recursive: true, force: true })
fs.mkdirSync(assets, { recursive: true })

const result = await build({
  absWorkingDir: root,
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: assets,
  entryNames: 'app-[hash]',
  assetNames: '[name]-[hash]',
  minify: true,
  sourcemap: false,
  target: ['chrome100', 'safari15', 'firefox100'],
  jsx: 'automatic',
  loader: {
    '.woff': 'file',
    '.woff2': 'file',
    '.ttf': 'file',
    '.otf': 'file',
    '.svg': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.webp': 'file',
    '.gif': 'file',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  legalComments: 'none',
  metafile: true,
  logLevel: 'info',
})

fs.cpSync(path.join(root, 'public'), dist, { recursive: true })

const outputs = Object.keys(result.metafile.outputs)
const jsFile = outputs.find((file) => file.endsWith('.js'))
const cssFile = outputs.find((file) => file.endsWith('.css'))
if (!jsFile) throw new Error('Build did not emit a JavaScript bundle')

const htmlSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
const html = htmlSource
  .replace(/\s*<script type="module" src="\/src\/main\.tsx"><\/script>/, '')
  .replace(
    '</head>',
    `${cssFile ? `    <link rel="stylesheet" href="/${path.relative(dist, path.join(root, cssFile)).split(path.sep).join('/')}" />\n` : ''}  </head>`,
  )
  .replace(
    '</body>',
    `    <script type="module" src="/${path.relative(dist, path.join(root, jsFile)).split(path.sep).join('/')}"></script>\n  </body>`,
  )

fs.writeFileSync(path.join(dist, 'index.html'), html)
console.log(`\nBuilt ${path.relative(root, jsFile)}${cssFile ? ` + ${path.relative(root, cssFile)}` : ''}`)
console.log(`Static site ready at ${dist}\n`)
