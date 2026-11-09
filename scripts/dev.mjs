import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { context } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const assets = path.join(dist, 'assets')

fs.rmSync(dist, { recursive: true, force: true })
fs.mkdirSync(assets, { recursive: true })
fs.cpSync(path.join(root, 'public'), dist, { recursive: true })

const buildOptions = {
  absWorkingDir: root,
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: assets,
  entryNames: 'app',
  assetNames: '[name]',
  sourcemap: true,
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
  define: { 'process.env.NODE_ENV': '"development"' },
  legalComments: 'none',
  logLevel: 'info',
  plugins: [
    {
      name: 'write-index',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length) return
          const htmlSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
          const html = htmlSource
            .replace(/\s*<script type="module" src="\/src\/main\.tsx"><\/script>/, '')
            .replace('</head>', '    <link rel="stylesheet" href="/assets/app.css" />\n  </head>')
            .replace(
              '</body>',
              '    <script type="module" src="/assets/app.js"></script>\n  </body>',
            )
          fs.writeFileSync(path.join(dist, 'index.html'), html)
          console.log('  rebuilt · refresh http://127.0.0.1:8787')
        })
      },
    },
  ],
}

const ctx = await context(buildOptions)
await ctx.watch()

const server = spawn(process.execPath, ['--watch', 'server/index.js'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || '8787' },
})

function shutdown() {
  server.kill('SIGTERM')
  void ctx.dispose().finally(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
