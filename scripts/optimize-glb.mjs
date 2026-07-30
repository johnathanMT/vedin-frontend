#!/usr/bin/env node
/**
 * optimize-glb.mjs — shrink heavy Sanctuary .glb models without visible quality
 * loss, then make them Safari-safe.
 *
 * Pipeline per model:
 *   1) gltf-transform optimize  → Draco geometry + prune unused + WebP textures
 *      capped at 2048px. `--simplify false` keeps full mesh detail (lossless look).
 *   2) WebP→core patch          → moves EXT_texture_webp to a core image source and
 *      drops the extension, so three.js loads the WebP via the browser's native
 *      decoder (fixes the Safari "sourceDef.uri" crash). Draco stays intact.
 *
 * Setup (one-off):
 *   cd Myweb_Frontend
 *   npm i -D @gltf-transform/cli
 *
 * Run:
 *   node scripts/optimize-glb.mjs                 # all models below
 *   node scripts/optimize-glb.mjs ship village    # only these
 *
 * Originals are backed up to public/<name>.preopt.glb the first time.
 * NOTE: some models (e.g. a dense `hospital.glb`) can get LARGER from re-encoding;
 *       this script keeps the smaller of {original, optimized} automatically.
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const PUBLIC = 'public'
const TMP = '/tmp/glb-optimize'
const CLI = path.resolve('node_modules/.bin/gltf-transform')
const TEXTURE_SIZE = 2048 // use 1024 for an even smaller build

// Heavy models worth optimizing (skip tiny ones like sun/moon/sakura/torii).
const DEFAULT = ['plaza_night', 'london_university', 'ferris_wheel', 'satellite',
  'bagan', 'jp_castle', 'castle_sakura', 'village', 'ship', 'hospital']

const models = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT
fs.mkdirSync(TMP, { recursive: true })

function webpToCore(src, out) {
  const buf = fs.readFileSync(src)
  const len0 = buf.readUInt32LE(12)
  const json = JSON.parse(buf.toString('utf8', 20, 20 + len0))
  const binStart = 20 + len0
  const binLen = buf.readUInt32LE(binStart), binType = buf.readUInt32LE(binStart + 4)
  const bin = buf.subarray(binStart + 8, binStart + 8 + binLen)
  for (const tex of json.textures || []) {
    const ext = tex.extensions && tex.extensions.EXT_texture_webp
    if (ext && ext.source !== undefined && tex.source === undefined) tex.source = ext.source
    if (tex.extensions) { delete tex.extensions.EXT_texture_webp; if (!Object.keys(tex.extensions).length) delete tex.extensions }
    if (tex.source === undefined && (json.images || []).length) tex.source = 0
  }
  json.extensionsUsed = (json.extensionsUsed || []).filter((e) => e !== 'EXT_texture_webp')
  json.extensionsRequired = (json.extensionsRequired || []).filter((e) => e !== 'EXT_texture_webp')
  if (!json.extensionsUsed.length) delete json.extensionsUsed
  if (!json.extensionsRequired.length) delete json.extensionsRequired
  let s = JSON.stringify(json); while (s.length % 4) s += ' '
  const jb = Buffer.from(s, 'utf8')
  const total = 12 + 8 + jb.length + 8 + bin.length
  const o = Buffer.alloc(total)
  o.write('glTF', 0, 'ascii'); o.writeUInt32LE(2, 4); o.writeUInt32LE(total, 8)
  o.writeUInt32LE(jb.length, 12); o.writeUInt32LE(0x4e4f534a, 16); jb.copy(o, 20)
  const p = 20 + jb.length
  o.writeUInt32LE(bin.length, p); o.writeUInt32LE(binType, p + 4); bin.copy(o, p + 8)
  fs.writeFileSync(out, o)
}

const MB = (n) => (n / 1048576).toFixed(2)
for (const m of models) {
  const orig = `${PUBLIC}/${m}.glb`
  if (!fs.existsSync(orig)) { console.log(`• ${m}: not found, skipping`); continue }
  const before = fs.statSync(orig).size
  const tmp = `${TMP}/${m}.glb`
  try {
    execSync(`"${CLI}" optimize "${orig}" "${tmp}" --compress draco --simplify false --texture-compress webp --texture-size ${TEXTURE_SIZE}`, { stdio: 'ignore' })
  } catch { console.log(`• ${m}: optimize failed, skipping`); continue }
  webpToCore(tmp, tmp) // patch in place
  const after = fs.statSync(tmp).size
  if (after >= before) { console.log(`• ${m}: optimized (${MB(after)}MB) ≥ original (${MB(before)}MB) → keeping original`); continue }
  if (!fs.existsSync(`${PUBLIC}/${m}.preopt.glb`)) fs.copyFileSync(orig, `${PUBLIC}/${m}.preopt.glb`)
  fs.copyFileSync(tmp, orig)
  console.log(`✓ ${m}: ${MB(before)}MB → ${MB(after)}MB`)
}
console.log('\nDone. Hard-reload /#/sanctuary. Backups at public/*.preopt.glb (delete with: rm public/*.preopt.glb).')
