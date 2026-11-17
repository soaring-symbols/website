// Puts a local build of soaring-symbols into node_modules, so the dev server
// shows airlines and SVGs that aren't released yet. `bun run dev:local` runs
// it before `nuxt dev`; `bun install --force` brings back the release
// from npm (a plain `bun install` keeps the copy, since the version matches).
//
//   node scripts/use-local-package.mjs [--no-build]
//
// The package is read from ../soaring-symbols, or SOARING_SYMBOLS_PATH.
// Without --no-build it runs `npm run build` there first, which also runs the
// package's `generate` and may rewrite its airlines.json.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageDir = resolve(
  root,
  process.env.SOARING_SYMBOLS_PATH ?? '../soaring-symbols',
)
const build = !process.argv.includes('--no-build')

if (!existsSync(resolve(packageDir, 'package.json'))) {
  console.error(`No soaring-symbols checkout at ${packageDir}`)
  console.error('Set SOARING_SYMBOLS_PATH to where it is.')
  process.exit(1)
}

if (build) {
  console.log(`Building soaring-symbols in ${packageDir}...`)
  execFileSync('npm', ['run', 'build'], {
    cwd: packageDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

const source = resolve(packageDir, 'dist')
if (!existsSync(source)) {
  console.error(`No build at ${source}; run it without --no-build.`)
  process.exit(1)
}

const require = createRequire(import.meta.url)
const target = resolve(
  dirname(require.resolve('soaring-symbols/package.json')),
  'dist',
)
rmSync(target, { recursive: true, force: true })
cpSync(source, target, { recursive: true })

console.log(`Copied ${source} to ${target}.`)
console.log('Run `bun install --force` to go back to the release from npm.')
