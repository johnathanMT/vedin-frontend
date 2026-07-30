// ─────────────────────────────────────────────────────────────────────────────
// optimize-images.mjs — convert heavy PNG/JPG assets in /public to compressed WebP
//
// WHY: WebP is ~25-35% smaller than JPEG and ~50-80% smaller than PNG at the same
// visual quality. Serving avatars / backgrounds as WebP is the single biggest
// static-asset win for slow mobile connections.
//
// SETUP (one-time):
//   cd Myweb_Frontend
//   npm i -D sharp
//
// RUN:
//   node scripts/optimize-images.mjs            # convert everything in /public
//   node scripts/optimize-images.mjs public/sayar.jpg   # a specific file
//
// The originals are LEFT IN PLACE (so <img> fallbacks keep working). For each
// source it writes a sibling `.webp`. Point your <img>/<picture> at the .webp,
// or use a <picture> element with the original as fallback:
//
//   <picture>
//     <source srcset="/sayar.webp" type="image/webp" />
//     <img src="/sayar.jpg" alt="…" loading="lazy" decoding="async" />
//   </picture>
// ─────────────────────────────────────────────────────────────────────────────
import { readdir, stat } from 'node:fs/promises'
import { join, extname, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const EXT = new Set(['.jpg', '.jpeg', '.png'])
const QUALITY = 78 // 0-100; 74-82 is the sweet spot for photos

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('\n  ✗ sharp is not installed. Run:  npm i -D sharp\n')
  process.exit(1)
}

async function collect(dir) {
  const out = []
  for (const name of await readdir(dir)) {
    const p = join(dir, name)
    const s = await stat(p)
    if (s.isDirectory()) out.push(...await collect(p))
    else if (EXT.has(extname(name).toLowerCase())) out.push(p)
  }
  return out
}

const args = process.argv.slice(2)
const files = args.length
  ? args.map((a) => (a.startsWith('/') ? a : join(ROOT, a)))
  : await collect(PUBLIC)

if (!files.length) { console.log('No PNG/JPG assets found.'); process.exit(0) }

let saved = 0
for (const src of files) {
  const dst = join(dirname(src), basename(src, extname(src)) + '.webp')
  try {
    const before = (await stat(src)).size
    await sharp(src).webp({ quality: QUALITY, effort: 6 }).toFile(dst)
    const after = (await stat(dst)).size
    saved += before - after
    const pct = ((1 - after / before) * 100).toFixed(0)
    console.log(`  ✓ ${basename(src)} → ${basename(dst)}   ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (-${pct}%)`)
  } catch (e) {
    console.error(`  ✗ ${basename(src)}: ${e.message}`)
  }
}
console.log(`\n  Total saved: ${(saved / 1024).toFixed(0)} KB\n`)
