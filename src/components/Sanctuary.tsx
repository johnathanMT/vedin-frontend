import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode, type FormEvent } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Grid, Html, OrbitControls, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine, ISourceOptions } from '@tsparticles/engine'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sun as SunIcon, Moon as MoonIcon, Mail, X, Send, Pencil, Sparkles, ArrowRight, Lock, Shield } from 'lucide-react'
import DOMPurify from 'dompurify'
import { getParticlesOptions } from '../lib/sanctuaryParticles'
import { SITE } from '../config/site'
import type { Memory } from '../types/api'

// ── Shared types ──────────────────────────────────────────────────────────────
type Vec3 = [number, number, number]
interface FloatCfg { amp: number; speed: number }
interface FitConfig { url: string; rotation?: Vec3; scale?: number | Vec3; fit?: 'footprint'; size: number; sky?: boolean }
interface SceneConfig extends FitConfig { position: Vec3; heavy?: boolean; city?: boolean; celestial?: 'sun' | 'moon'; float?: FloatCfg }
interface FittedModel { obj: THREE.Object3D; scale: Vec3; offset: Vec3 }
interface Tag { id: number | string; author: string; message: string; landmark: string; position?: Vec3; date?: string; ownerId?: string }
interface Plant { id: number | string; name: string; plantType: string; position: Vec3 }
interface PendingPlant { id?: number | string; name: string; plantType?: string; position: Vec3 }
interface OrbitLike { target: THREE.Vector3; enabled: boolean; update: () => void }
interface TLang {
  title: string; sub: string; day: string; night: string; leave: string; editMine: string
  from: string; at: string; place: string; name: string; msg: string; hang: string; save: string
  demo: string; edit: string; namePh: string; msgPh: string; home: string; placeHint: string
  steps: string[]; lm: Record<string, string>
}

// Strip ALL HTML/scripts → plain text. Defense-in-depth for user messages.
const clean = (s: unknown): string => DOMPurify.sanitize(String(s ?? ''), { ALLOWED_TAGS: [], ALLOWED_ATTR: [], KEEP_CONTENT: true }).trim()

const G = 0   // ground level
// Rotate a building to face the central Sakura tree, given its world position.
const faceCenter = (p: Vec3): Vec3 => [0, Math.atan2(p[0], p[2]) + Math.PI, 0]
const SCENE_LAYOUT: Record<string, SceneConfig> = {
  // ── centre + entrance ──
  sakura:        { url: 'sakura.glb',        position: [0, G, 0],     rotation: [0, 0, 0],                 size: 4.0 },
  torii:         { url: 'torigate.glb',      position: [0, G, 14],    rotation: [0, Math.PI, 0],           size: 5.5 },
  // ── CITY DISTRICT ──
  london_university: { url: 'london_university.glb', position: [-26, G, -62], rotation: faceCenter([-70, G, -48]), size: 12, heavy: true },
  hospital:          { url: 'hospital.glb',          position: [26, G, -58],  rotation: faceCenter([5, G, -370]),  size: 9, heavy: true },
  // ── SPACIOUS RING ──
  plaza_night:   { url: 'plaza_night.glb',   position: [15, G, 26],   rotation: faceCenter([15, G, 26]),   size: 16, fit: 'footprint', city: true, heavy: true },
  village:       { url: 'village.glb',       position: [-15, G, 26],  rotation: faceCenter([-15, G, 26]),  size: 6 },
  bagan:         { url: 'bagan.glb',         position: [30, G, 0],    rotation: faceCenter([30, G, 0]),    size: 8 },
  castle_sakura: { url: 'castle_sakura.glb', position: [-30, G, 0],   rotation: faceCenter([-30, G, 0]),   size: 7 },
  ferris_wheel:  { url: 'ferris_wheel.glb',  position: [10, G, -30],  rotation: faceCenter([5, G, -200]),  size: 9, city: true },
  jp_castle:     { url: 'jp_castle.glb',     position: [-16, G, -26], rotation: faceCenter([-16, G, -26]), size: 9 },
  // ── accent ──
  ship:          { url: 'ship.glb',          position: [27, G + 0.4, 20], rotation: faceCenter([27, G, 20]), size: 5, float: { amp: 0.18, speed: 1.1 } },
  // ── sky ──
  satellite:     { url: 'satellite.glb',     position: [0, 30, 2],     rotation: [0.3, 0.6, 0],            size: 5.5, sky: true, float:  { amp: 0.3, speed: 0.8 } },
  sun:           { url: 'sun.glb',           position: [-26, 19, -34], rotation: [0, 0, 0],                size: 2.6, sky: true, celestial: 'sun' },
  moon:          { url: 'moon.glb',          position: [26, 19, -34],  rotation: [0, 0, 0],                size: 2.6, sky: true, celestial: 'moon' },
  glider:        { url: 'glider.glb',        position: [8, 12, 2],     rotation: [0, -0.6, 0],             size: 2.4, sky: true, float: { amp: 0.4, speed: 0.6 } },
}
const BASE = import.meta.env.BASE_URL || '/'
const u = (f: string): string => `${BASE}${f}`

const IS_MOBILE = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
const showOnDevice = (cfg: SceneConfig): boolean => !(IS_MOBILE && cfg.heavy)

// Preload ONLY the models this device will actually render.
const ALL_URLS = Object.values(SCENE_LAYOUT).filter(showOnDevice).map((m) => u(m.url))
ALL_URLS.forEach((url) => useGLTF.preload(url))

const BUILDING_LABEL: Record<string, string> = {
  sakura: 'Sakura Tree', torii: 'Torii Gate', ship: "Ship's Deck", village: 'Village',
  bagan: 'Bagan Temple', ferris_wheel: 'Ferris Wheel', jp_castle: 'Japanese Castle',
  castle_sakura: 'Sakura Castle', plaza_night: 'Night Plaza', hospital: 'Hospital',
  london_university: 'University', tree: 'Sakura Tree', castle: 'Castle', plaza: 'Plaza',
}
const PLACE_KEYS = ['sakura', 'torii', 'ship', 'village', 'bagan', 'ferris_wheel', 'jp_castle', 'castle_sakura', 'plaza_night', 'hospital', 'london_university']

const WELCOME: Record<string, string> = {
  en: 'Welcome to the Memory World. You can choose your favorite spot to leave a message for Ko Myo Thant Naing.',
  jp: 'メモリーワールドへようこそ。ナインへのメッセージを、お好きな場所を選んで残すことができます。',
  mm: 'Memory World မှ နွေးထွေးစွာ ကြိုဆိုပါတယ်။ Ko Myo Thant Ning အတွက် အမှတ်တရစကားလေးကို သင်နှစ်သက်ရာ နေရာလေးမှာ ရွေးချယ်ချိတ်ဆွဲခဲ့နိုင်ပါတယ်။',
}

// Landmarks tags hang from — anchors derived from SCENE_LAYOUT positions.
const LANDMARKS: Record<string, { anchor: Vec3 }> = {
  tree:    { anchor: [0, 3.0, 0.8] },
  ship:    { anchor: [SCENE_LAYOUT.ship.position[0], 3.6, SCENE_LAYOUT.ship.position[2]] },
  village: { anchor: [SCENE_LAYOUT.village.position[0], 3.6, SCENE_LAYOUT.village.position[2]] },
  castle:  { anchor: [SCENE_LAYOUT.jp_castle.position[0], 6.5, SCENE_LAYOUT.jp_castle.position[2]] },
  plaza:   { anchor: [SCENE_LAYOUT.plaza_night.position[0], 4.0, SCENE_LAYOUT.plaza_night.position[2]] },
}

/* ───────── i18n (EN / JP / MM) ───────── */
const T: Record<string, TLang> = {
  en: { title: 'The Memory World', sub: 'Drag to look · scroll to fly out · tap a tag', day: 'Day', night: 'Night', leave: 'Leave a Memory', editMine: 'Edit your memory', from: 'A memory from', at: 'at the', place: 'Place it at', name: 'Your name', msg: 'Message', hang: 'Hang it', save: 'Save changes', demo: 'One memory per visitor · editable, never deleted.', edit: 'Edit', namePh: 'Please input your name', msgPh: 'A few words to remember…', home: 'Home',
    placeHint: 'Step 1 — Click anywhere in the 3D world to choose a spot',
    steps: ['Choose a spot from the "Place it at" list.', 'Write your name and your memory.', 'Press the button below to plant it.'],
    lm: { tree: 'Sakura Tree', ship: "Ship's Deck", village: 'Village Gate', castle: 'Castle Gates', plaza: 'Night Plaza' } },
  jp: { title: '思い出の世界', sub: 'ドラッグで視点 · スクロールで俯瞰 · タグをタップ', day: '昼', night: '夜', leave: '思い出を残す', editMine: '思い出を編集', from: '思い出をくれた人', at: '場所：', place: '場所を選ぶ', name: 'お名前', msg: 'メッセージ', hang: '木に掛ける', save: '変更を保存', demo: '一人につき一つ · 編集可・削除不可。', edit: '編集', namePh: 'お名前を入力してください', msgPh: 'ひとことどうぞ…', home: 'ホーム',
    placeHint: 'ステップ1 — 3Dの世界をクリックして場所を選んでください',
    steps: ['「場所を選ぶ」リストから場所を選びます。', 'お名前と思い出を書きます。', '下のボタンを押して残します。'],
    lm: { tree: '桜の木', ship: '船の甲板', village: '村の入口', castle: '城門', plaza: '夜の広場' } },
  mm: { title: 'အမှတ်တရ ကမ္ဘာ', sub: 'ကြည့်ရန် ဖိဆွဲ · အပြင်ထွက်ရန် scroll · tag ကိုနှိပ်', day: 'နေ့', night: 'ည', leave: 'အမှတ်တရ ချန်ထားရန်', editMine: 'သင့်စာ ပြင်ရန်', from: 'အမှတ်တရ ပေးသူ', at: 'နေရာ —', place: 'နေရာ ရွေးပါ', name: 'သင့်အမည်', msg: 'စာ', hang: 'ချိတ်ဆွဲရန်', save: 'သိမ်းရန်', demo: 'တစ်ဦးလျှင် တစ်ခု · ပြင်နိုင်၊ ဖျက်၍မရ။', edit: 'ပြင်ရန်', namePh: 'သင့်အမည် ထည့်ပါ', msgPh: 'မှတ်မိစရာ စကားအနည်းငယ်…', home: 'ပင်မ',
    placeHint: 'အဆင့် ၁ — နေရာရွေးရန် 3D ကမ္ဘာတွင် နှိပ်ပါ',
    steps: ['“နေရာ ရွေးပါ” စာရင်းမှ နေရာတစ်ခု ရွေးပါ။', 'သင့်အမည်နှင့် အမှတ်တရစာ ရေးပါ။', 'အောက်ကခလုတ်ကိုနှိပ်၍ ချန်ထားပါ။'],
    lm: { tree: 'ဆာကူရာပင်', ship: 'သင်္ဘောကုန်း', village: 'ရွာဝင်ပေါက်', castle: 'ရဲတိုက်တံခါး', plaza: 'ညဈေး' } },
}
const LANGS = [{ code: 'en', label: 'EN' }, { code: 'jp', label: '日本語' }, { code: 'mm', label: 'မြန်မာ' }]

const API_MSG: Record<string, Record<string, string>> = {
  en: { offline: 'Server offline — showing sample memories.', save: 'Couldn’t save to the server — kept on this device.' },
  jp: { offline: 'サーバーオフライン — サンプルを表示中。', save: 'サーバーに保存できませんでした（端末に保存）。' },
  mm: { offline: 'ဆာဗာ အော့ဖ်လိုင်း — နမူနာများ ပြသနေသည်။', save: 'ဆာဗာသို့ မသိမ်းနိုင်ပါ — စက်တွင်းသာ သိမ်းထားသည်။' },
}
const API = `${SITE.apiUrl}/api/sanctuary/memories`
const FAREWELL_API = `${SITE.apiUrl}/api/farewell/plants`
const PENDING_PLANT_KEY = 'mtn_pending_plant'

/* ───────── operator identity + persistence ───────── */
function getOperatorId(): string {
  try {
    let id = localStorage.getItem('mtn_operator_id')
    if (!id) { id = crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`; localStorage.setItem('mtn_operator_id', id) }
    return id
  } catch { return 'anon' }
}
function loadMyMemory(): Tag | null { try { const s = localStorage.getItem('mtn_my_memory'); return s ? (JSON.parse(s) as Tag) : null } catch { return null } }
function saveMyMemory(t: Tag): void { try { localStorage.setItem('mtn_my_memory', JSON.stringify(t)) } catch { /* ignore */ } }

const initEngine = async (engine: Engine): Promise<void> => { await loadSlim(engine) }

const MOCK_TAGS: Tag[] = [
  { id: 1, landmark: 'tree', author: 'Nomura-san', date: '2024-03-15', message: 'Working beside you made the hard days lighter. Fly far — we are proud of you.' },
  { id: 2, landmark: 'ship', author: 'Aiko', date: '2024-03-18', message: 'Thank you for every coffee and every kind word. Smooth sailing ahead, captain.' },
  { id: 3, landmark: 'village', author: 'The Kaigo Team', date: '2024-03-20', message: 'From caring to coding — you carried the same heart into both. Go shine, engineer.' },
  { id: 4, landmark: 'castle', author: 'Tanaka', date: '2024-03-21', message: 'I still remember your first day. Look how far you’ve come. ありがとう。' },
  { id: 5, landmark: 'plaza', author: 'Yuki', date: '2024-03-22', message: 'May your new path glow like these lanterns. Come back and visit us someday.' },
]

/* ───────── bbox auto-fit + auto-ground ───────── */
function useFitted(cfg: FitConfig): FittedModel {
  const { scene } = useGLTF(u(cfg.url))
  return useMemo(() => {
    const obj = scene.clone(true)
    if (cfg.rotation) obj.rotation.set(cfg.rotation[0] || 0, cfg.rotation[1] || 0, cfg.rotation[2] || 0)
    obj.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(obj)
    const size = new THREE.Vector3(); box.getSize(size)
    let s: Vec3
    if (cfg.scale != null) {
      s = Array.isArray(cfg.scale) ? cfg.scale : [cfg.scale, cfg.scale, cfg.scale]
    } else {
      const denom = cfg.fit === 'footprint' ? (Math.max(size.x, size.z) || 1) : (size.y || Math.max(size.x, size.z) || 1)
      const k = cfg.size / denom
      s = [k, k, k]
    }
    const cx = ((box.min.x + box.max.x) / 2) * s[0]
    const cz = ((box.min.z + box.max.z) / 2) * s[2]
    const y = cfg.sky ? -((box.min.y + box.max.y) / 2) * s[1] : -box.min.y * s[1]
    return { obj, scale: s, offset: [-cx, y, -cz] }
  }, [scene, cfg])
}

function applyEmissive(obj: THREE.Object3D, color: string, intensity: number): void {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh && mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial
        m.emissive = new THREE.Color(color); m.emissiveIntensity = intensity; m.toneMapped = false; m.needsUpdate = true
      })
    }
  })
}

function Floating({ amp = 0.15, speed = 1, children }: { amp?: number; speed?: number; children?: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const seed = useMemo(() => Math.random() * 10, [])
  useFrame((s) => { if (ref.current) ref.current.position.y = Math.sin(s.clock.elapsedTime * speed + seed) * amp })
  return <group ref={ref}>{children}</group>
}

function Asset({ cfg, night }: { cfg: SceneConfig; night: boolean }) {
  const fit = useFitted(cfg)

  useEffect(() => {
    if (cfg.celestial === 'sun') applyEmissive(fit.obj, '#ffd27a', night ? 0.12 : 2.6)
    else if (cfg.celestial === 'moon') applyEmissive(fit.obj, '#cdd6ff', night ? 2.6 : 0.12)
    else if (cfg.city) applyEmissive(fit.obj, '#ffc04d', night ? 1.1 : 0.0)
  }, [fit.obj, night, cfg])

  const inner = <primitive object={fit.obj} scale={fit.scale} position={fit.offset} />

  // Purely decorative — NO pointer/click events, so dragging the canvas only
  // rotates the camera (OrbitControls) and never opens the memory modal.
  return (
    <group position={cfg.position}>
      {cfg.float ? <Floating {...cfg.float}>{inner}</Floating> : inner}
    </group>
  )
}

// Per-model isolation: a missing/broken GLB drops only itself.
class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err: unknown) { console.error('[Sanctuary] a model failed (others still render):', err) }
  render(): ReactNode { return this.state.failed ? null : this.props.children }
}
function Safe({ children }: { children: ReactNode }) { return <ModelBoundary><Suspense fallback={null}>{children}</Suspense></ModelBoundary> }

function SwayGroup({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((s) => { if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.18) * 0.08 })
  return <group ref={ref}>{children}</group>
}

function Lights({ night }: { night: boolean }) {
  if (night) {
    return (<>
      <ambientLight intensity={0.45} color="#9fb4ff" />
      <directionalLight position={[12, 14, -12]} intensity={0.6} color="#aab8ff" />
      <pointLight position={[0, 3, 3]} intensity={2.2} distance={22} color="#ffcf8a" />
    </>)
  }
  return (<>
    <ambientLight intensity={1.0} color="#fff4e6" />
    <directionalLight position={[-12, 16, -10]} intensity={1.7} color="#fff1d6" />
    <hemisphereLight args={['#ffe9c8', '#6b8f6b', 0.6]} />
  </>)
}

function TagPlaque({ tag, index, paused, mine, onOpen }: { tag: Tag; index: number; paused: boolean; mine: boolean; onOpen: (tag: Tag) => void }) {
  return (
    <button type="button" onClick={() => onOpen(tag)} aria-label={`Read the memory from ${tag.author}`}
      className="sanctuary-tag group cursor-pointer focus:outline-none"
      style={{ animationDelay: `${-(index * 0.8)}s`, animationPlayState: paused ? 'paused' : 'running' }}>
      <span className="mx-auto block h-6 w-px bg-gradient-to-b from-amber-100/80 to-amber-700/30" />
      <span className={`relative -mt-px block whitespace-nowrap rounded-md border bg-gradient-to-b from-amber-200 to-amber-400 px-3 py-1.5 font-serif text-xs font-semibold text-amber-950 shadow-[0_5px_12px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_0_24px_rgba(253,224,140,0.95)] group-hover:brightness-110 ${mine ? 'border-fuchsia-400/80 ring-2 ring-fuchsia-400/50' : 'border-amber-900/40'}`}>
        <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-900/70" />
        {tag.author}
      </span>
    </button>
  )
}

function OrbitingSatellite() {
  const fit = useFitted(SCENE_LAYOUT.satellite)
  const ref = useRef<THREE.Group>(null)
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.12
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * 36, 26 + Math.sin(t * 0.7) * 3, Math.sin(t) * 36)
      ref.current.rotation.y = -t + Math.PI / 2
    }
  })
  return <group ref={ref}><primitive object={fit.obj} scale={fit.scale} position={fit.offset} /></group>
}

/* ════════════ FAREWELL "living monument" plants ════════════ */
function plantCfgFor(type: string): FitConfig {
  return { url: 'sakura.glb', rotation: [0, 0, 0], size: type === 'orchid' ? 1.9 : 3.4 }
}

function PlantTag({ name, show, paused }: { name: string; show: boolean; paused: boolean }) {
  return (
    <div className="sanctuary-tag" style={{ opacity: show ? 1 : 0, transition: 'opacity 700ms ease', animationPlayState: paused ? 'paused' : 'running' }}>
      <span className="mx-auto block h-6 w-px bg-gradient-to-b from-emerald-100/80 to-emerald-700/30" />
      <span className="relative -mt-px block whitespace-nowrap rounded-md border border-emerald-900/40 bg-gradient-to-b from-emerald-200 to-emerald-400 px-3 py-1.5 font-serif text-xs font-semibold text-emerald-950 shadow-[0_5px_12px_rgba(0,0,0,0.4)]">
        <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-900/70" />
        🌱 Planted by {name}
      </span>
    </div>
  )
}

function FarewellPlant({ plant, paused = false, drop = false, onDropDone }: { plant: Plant; paused?: boolean; drop?: boolean; onDropDone?: () => void }) {
  const cfg = useMemo(() => plantCfgFor(plant.plantType), [plant.plantType])
  const fit = useFitted(cfg)
  const grp = useRef<THREE.Group>(null)
  const startRef = useRef<number | null>(null)
  const doneRef = useRef(false)
  const [landed, setLanded] = useState(!drop)

  useEffect(() => { if (plant.plantType === 'orchid') applyEmissive(fit.obj, '#b14ad6', 0.22) }, [fit.obj, plant.plantType])

  useFrame((s) => {
    if (!drop || !grp.current || doneRef.current) return
    if (startRef.current == null) startRef.current = s.clock.elapsedTime
    const t = s.clock.elapsedTime - startRef.current
    const delay = 0.4, dur = 1.6
    const p = Math.min(1, Math.max(0, (t - delay) / dur))
    const ease = 1 - Math.pow(1 - p, 3)
    grp.current.position.y = (1 - ease) * 11
    const sc = 0.15 + ease * 0.85
    grp.current.scale.setScalar(sc)
    if (p >= 1) { doneRef.current = true; setLanded(true); onDropDone?.() }
  })

  const nameY = plant.plantType === 'orchid' ? 2.6 : 4.4
  return (
    <group position={plant.position}>
      <group ref={grp} scale={drop ? 0.15 : 1} position={drop ? [0, 11, 0] : [0, 0, 0]}>
        <primitive object={fit.obj} scale={fit.scale} position={fit.offset} />
      </group>
      <Html position={[0, nameY, 0]} center distanceFactor={11} zIndexRange={[30, 0]}>
        <PlantTag name={plant.name} show={landed} paused={paused} />
      </Html>
    </group>
  )
}

function FarewellPlants({ plants, pendingId, paused, onPlanted }: { plants: Plant[]; pendingId: number | string | null; paused: boolean; onPlanted: () => void }) {
  return (
    <>
      {plants.map((p) => (
        <Safe key={p.id}>
          <FarewellPlant plant={p} paused={paused} drop={p.id === pendingId} onDropDone={p.id === pendingId ? onPlanted : undefined} />
        </Safe>
      ))}
    </>
  )
}

function PlantingDirector({ target, onDone }: { target: Vec3; onDone?: () => void }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null
  const startRef = useRef<number | null>(null)
  const fromPos = useRef(new THREE.Vector3())
  const fromTgt = useRef(new THREE.Vector3())
  const doneRef = useRef(false)
  const destPos = useMemo(() => new THREE.Vector3(target[0] + 8, target[1] + 6, target[2] + 12), [target])
  const destTgt = useMemo(() => new THREE.Vector3(target[0], target[1] + 1.5, target[2]), [target])

  useFrame((s) => {
    if (doneRef.current) return
    if (startRef.current == null) {
      if (!controls?.target) return
      startRef.current = s.clock.elapsedTime
      fromPos.current.copy(camera.position)
      fromTgt.current.copy(controls.target)
      controls.enabled = false
    }
    const dur = 2.8
    const t = Math.min(1, (s.clock.elapsedTime - startRef.current) / dur)
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    camera.position.lerpVectors(fromPos.current, destPos, e)
    if (controls?.target) { controls.target.lerpVectors(fromTgt.current, destTgt, e); controls.update() }
    else camera.lookAt(destTgt)
    if (t >= 1) { doneRef.current = true; if (controls) controls.enabled = true; onDone?.() }
  })
  return null
}

interface PlacedTag { tag: Tag; index: number; position: Vec3 }
interface WorldProps {
  night: boolean; tags: Tag[]; paused: boolean; operatorId: string
  onOpen: (tag: Tag) => void; plants?: Plant[]; pendingId?: number | string | null; onPlanted: () => void
}

function World({ night, tags, paused, operatorId, onOpen, plants = [], pendingId = null, onPlanted }: WorldProps) {
  const placedTags = useMemo<PlacedTag[]>(() => {
    const out: PlacedTag[] = []
    const byLm: Record<string, Tag[]> = {}
    tags.forEach((tag) => {
      if (Array.isArray(tag.position)) {
        out.push({ tag, index: 0, position: [tag.position[0], tag.position[1] + 2.2, tag.position[2]] })
      } else {
        const k = LANDMARKS[tag.landmark] ? tag.landmark : 'tree'
        ;(byLm[k] ||= []).push(tag)
      }
    })
    for (const [k, arr] of Object.entries(byLm)) {
      const a = LANDMARKS[k].anchor
      arr.forEach((tag, i) => {
        const n = arr.length
        out.push({ tag, index: i, position: [a[0] + (i - (n - 1) / 2) * 0.85, a[1] + (i % 2) * 0.35, a[2]] })
      })
    }
    return out
  }, [tags])

  return (
    <>
      <Safe><OrbitingSatellite /></Safe>

      <Safe><Asset cfg={SCENE_LAYOUT.sun} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.moon} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.glider} night={night} /></Safe>

      <Safe><Asset cfg={SCENE_LAYOUT.ship} night={night} /></Safe>
      {showOnDevice(SCENE_LAYOUT.plaza_night) && <Safe><Asset cfg={SCENE_LAYOUT.plaza_night} night={night} /></Safe>}
      <Safe><Asset cfg={SCENE_LAYOUT.bagan} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.ferris_wheel} night={night} /></Safe>
      {showOnDevice(SCENE_LAYOUT.hospital) && <Safe><Asset cfg={SCENE_LAYOUT.hospital} night={night} /></Safe>}
      {showOnDevice(SCENE_LAYOUT.london_university) && <Safe><Asset cfg={SCENE_LAYOUT.london_university} night={night} /></Safe>}
      <Safe><Asset cfg={SCENE_LAYOUT.village} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.jp_castle} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.castle_sakura} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.torii} night={night} /></Safe>

      <SwayGroup>
        <Safe><Asset cfg={SCENE_LAYOUT.sakura} night={night} /></Safe>
        {night && ([[-1.0, 2.3, 0.4], [1.0, 2.6, 0.2], [0.0, 1.9, 0.8]] as Vec3[]).map((o, i) => (
          <mesh key={`lantern-${i}`} position={o}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#ffcf8a" emissive="#ffb347" emissiveIntensity={2.6} toneMapped={false} />
          </mesh>
        ))}
      </SwayGroup>

      {placedTags.map(({ tag, index, position }) => (
        <Html key={tag.id} position={position} center distanceFactor={11} zIndexRange={[30, 0]}>
          <TagPlaque tag={tag} index={index} paused={paused} mine={tag.ownerId === operatorId} onOpen={onOpen} />
        </Html>
      ))}

      <FarewellPlants plants={plants} pendingId={pendingId} paused={paused} onPlanted={onPlanted} />
    </>
  )
}

interface SceneProps extends WorldProps { plantingTarget: Vec3 | null }

function Scene({ night, tags, paused, operatorId, onOpen, plants, pendingId, plantingTarget, onPlanted }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 16, 56], fov: 50, near: 0.1, far: 2000 }}
      dpr={IS_MOBILE ? [1, 1] : [1, 1.5]}
      gl={{
        alpha: true,
        antialias: !IS_MOBILE,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false,
      }}
      performance={{ min: 0.5 }}
      style={{ background: 'transparent' }}
    >
      <fog attach="fog" args={[night ? '#0a0e1f' : '#dfe7ee', 60, 220]} />
      <Lights night={night} />
      <Grid
        position={[0, G, 0]} args={[200, 200]} infiniteGrid
        cellSize={1} cellThickness={0.6} cellColor={night ? '#3a3f63' : '#c9b89a'}
        sectionSize={5} sectionThickness={1.1} sectionColor={night ? '#7c5cff' : '#b8860b'}
        fadeDistance={120} fadeStrength={1.4} followCamera={false}
      />
      <World night={night} tags={tags} paused={paused} operatorId={operatorId} onOpen={onOpen} plants={plants} pendingId={pendingId} onPlanted={onPlanted} />

      {plantingTarget && <PlantingDirector target={plantingTarget} onDone={onPlanted} />}

      {night && !IS_MOBILE && (
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      )}

      <OrbitControls
        makeDefault enabled={!paused} enablePan={false} enableZoom
        enableDamping dampingFactor={IS_MOBILE ? 0.08 : 0.05}
        rotateSpeed={IS_MOBILE ? 0.4 : 0.6}
        zoomSpeed={IS_MOBILE ? 0.6 : 0.8}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        minDistance={5} maxDistance={150} minPolarAngle={0.1} maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 1, 0]}
      />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  )
}

// A human label for any place key.
const labelOf = (k: string, t: TLang): string => (t?.lm && t.lm[k]) || BUILDING_LABEL[k] || k

/* ───────── overlay UI ───────── */
function ReadModal({ tag, t, canRead, canEdit, onEdit, onClose }: { tag: Tag | null; t: TLang; canRead: boolean; canEdit: boolean; onEdit: (tag: Tag) => void; onClose: () => void }) {
  useEffect(() => {
    if (!tag) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [tag, onClose])
  return (
    <AnimatePresence>
      {tag && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true">
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="relative w-full max-w-md rounded-3xl border border-white/25 bg-white/15 p-7 text-white shadow-2xl backdrop-blur-2xl">
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"><X size={18} /></button>
            <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-amber-200/80">{t.from}</p>
            <h3 className="mt-1 font-serif text-2xl font-bold">{tag.author}</h3>
            {tag.landmark && <p className="mt-0.5 font-mono text-[11px] text-amber-200/70">{t.at} {labelOf(tag.landmark, t)}</p>}
            {canRead ? (
              <p className="mt-4 whitespace-pre-line font-serif text-[15px] leading-relaxed text-white/90">“{tag.message}”</p>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/15 bg-black/25 px-4 py-3 font-mono text-sm text-amber-200/80">
                <Lock size={15} /> 🔒 Private Message
              </div>
            )}
            <div className="mt-6 flex items-center justify-between">
              {canEdit ? (
                <button type="button" onClick={() => onEdit(tag)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-300 to-emerald-400 px-4 py-2 font-serif text-sm font-semibold text-amber-950 transition hover:brightness-105"><Pencil size={14} /> {t.edit}</button>
              ) : <span />}
              <p className="font-mono text-xs text-white/55">{tag.date}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function WriteModal({ open, editing, presetPlace, t, onClose, onSubmit }: { open: boolean; editing: Tag | null; presetPlace: string | null; t: TLang; onClose: () => void; onSubmit: (data: { author: string; message: string; landmark: string }) => void }) {
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [landmark, setLandmark] = useState(PLACE_KEYS[0])
  const options = useMemo(() => {
    const base = [...PLACE_KEYS]
    if (presetPlace && !base.includes(presetPlace)) base.unshift(presetPlace)
    return base
  }, [presetPlace])
  useEffect(() => {
    if (!open) return
    setAuthor(editing?.author || '')
    setMessage(editing?.message || '')
    setLandmark(presetPlace || editing?.landmark || PLACE_KEYS[0])
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, editing, presetPlace, onClose])
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!author.trim() || !message.trim()) return
    onSubmit({ author: author.trim(), message: message.trim(), landmark })
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true">
          <motion.form onClick={(e) => e.stopPropagation()} onSubmit={submit} initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/25 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-2xl sm:p-7"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"><X size={18} /></button>
            <h3 className="font-serif text-2xl font-bold">{editing ? t.editMine : t.leave}</h3>

            <ol className="mt-3 space-y-1.5 rounded-xl border border-white/15 bg-white/5 p-3">
              {t.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 font-serif text-[13px] leading-snug text-white/85">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-300 text-[10px] font-bold text-amber-950">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>

            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.place}</span>
              <select value={landmark} onChange={(e) => setLandmark(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base sm:py-2.5 sm:text-sm text-white outline-none transition focus:border-amber-200/60 focus:bg-white/15">
                {options.map((k) => <option key={k} value={k} className="text-black">{labelOf(k, t)}</option>)}
              </select>
              {presetPlace && (
                <span className="mt-1.5 block font-mono text-[11px] text-amber-200/70">📍 {labelOf(presetPlace, t)}</span>
              )}
            </label>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.name}</span>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={40} required placeholder={t.namePh} className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base sm:py-2.5 sm:text-sm text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15" />
            </label>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.msg}</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} required rows={4} placeholder={t.msgPh} className="mt-1.5 w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base sm:py-2.5 sm:text-sm text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15" />
              <span className="mt-1 block text-right font-mono text-[10px] text-white/40">{message.length}/240</span>
            </label>
            <button type="submit" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-300 to-emerald-400 px-5 py-3 font-serif text-sm font-semibold text-amber-950 shadow-lg transition hover:brightness-105 active:scale-[0.99]">{editing ? t.save : t.hang} <Send size={15} /></button>
            <p className="mt-3 text-center font-mono text-[10px] text-white/45">{t.demo}</p>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Weather({ night }: { night: boolean }) {
  const { loaded } = useParticlesProvider()
  // getParticlesOptions lives in a JS module; its inferred type widens enum-like
  // strings (e.g. move.direction) so we assert the validated tsparticles shape.
  const options = useMemo(() => getParticlesOptions(night) as unknown as ISourceOptions, [night])
  if (!loaded) return null
  return <Particles id="sanctuary-weather" key={night ? 'night' : 'day'} options={options} className="pointer-events-none absolute inset-0 z-40" />
}

function WelcomeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true">
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 12 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/25 bg-white/15 p-6 text-center text-white shadow-2xl backdrop-blur-2xl sm:p-9"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-lime-300 to-emerald-400 text-amber-950 shadow-[0_0_24px_rgba(253,224,140,0.6)]">
              <Sparkles size={22} />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-wide">Welcome to the Memory World</h2>
            <div className="mx-auto mt-5 max-w-md space-y-4 text-left">
              <p className="font-serif text-[14px] leading-relaxed text-white/90">{WELCOME.en}</p>
              <p className="border-t border-white/15 pt-4 font-serif text-[14px] leading-relaxed text-white/80">{WELCOME.jp}</p>
              <p className="border-t border-white/15 pt-4 font-serif text-[14px] leading-relaxed text-white/80">{WELCOME.mm}</p>
            </div>
            <button type="button" onClick={onClose}
              className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-300 to-emerald-400 px-7 py-3 font-serif text-sm font-semibold text-amber-950 shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition hover:brightness-105 active:scale-[0.98]">
              Enter Sanctuary <ArrowRight size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Server response shapes (extra fields beyond the public Memory view).
interface ServerPlant { id: number | string; name: string; plantType?: string; position: { x: number; y: number; z: number } }

/* ───────── main page ───────── */
export default function Sanctuary() {
  const operatorId = useRef(getOperatorId()).current
  const isAdmin = useMemo(() => { try { return localStorage.getItem('mtn_admin') === '1' } catch { return false } }, [])
  const hasAdminSession = useMemo(() => { try { return !!localStorage.getItem('mtn_admin_jwt') } catch { return false } }, [])
  const [lang, setLang] = useState<string>(() => { try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' } })
  useEffect(() => { try { localStorage.setItem('mtn_lang', lang) } catch { /* ignore */ } }, [lang])
  const t = T[lang] || T.en

  const [night, setNight] = useState<boolean>(() => { const h = new Date().getHours(); return h < 6 || h >= 18 })
  const [tags, setTags] = useState<Tag[]>(() => { const mine = loadMyMemory(); return mine ? [...MOCK_TAGS, mine] : MOCK_TAGS })
  const [activeTag, setActiveTag] = useState<Tag | null>(null)
  const [writeOpen, setWriteOpen] = useState(false)
  const [editing, setEditing] = useState<Tag | null>(null)
  const [welcome, setWelcome] = useState<boolean>(() => { try { return !localStorage.getItem(PENDING_PLANT_KEY) } catch { return true } })
  const [apiError, setApiError] = useState<'offline' | 'save' | null>(null)
  const [placedPoint, setPlacedPoint] = useState<Vec3 | null>(null)
  const [pickedPlace, setPickedPlace] = useState<string | null>(null)

  const [plants, setPlants] = useState<Plant[]>([])
  const [pending] = useState<PendingPlant | null>(() => {
    try {
      const s = localStorage.getItem(PENDING_PLANT_KEY)
      localStorage.removeItem(PENDING_PLANT_KEY)
      const p = s ? JSON.parse(s) : null
      return (p && Array.isArray(p.position)) ? (p as PendingPlant) : null
    } catch { return null }
  })
  const [planting, setPlanting] = useState<boolean>(() => !!pending)
  const paused = !!activeTag || writeOpen || welcome || planting

  useEffect(() => () => { try { useGLTF.clear(ALL_URLS) } catch { /* ignore */ } }, [])

  // ── LOAD memories from the .NET API on mount (falls back to mock if offline) ──
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(API, { headers: { 'X-Operator-Token': operatorId }, credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { memories?: Memory[] }
        if (cancelled || !Array.isArray(data.memories)) return
        setTags(data.memories.map((m): Tag => ({
          id: m.id,
          author: m.author,
          message: m.message,
          landmark: m.landmark || 'tree',
          position: (m.position && typeof m.position.x === 'number') ? [m.position.x, m.position.y, m.position.z] : undefined,
          date: (m.createdAt || '').slice(0, 10),
          ownerId: m.mine ? operatorId : `other-${m.id}`,
        })))
        setApiError(null)
      } catch (err) {
        console.error('[Sanctuary] GET /memories failed:', err)
        if (!cancelled) setApiError('offline')
      }
    })()
    return () => { cancelled = true }
  }, [operatorId])

  // ── LOAD farewell monuments (public projection) ──
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(FAREWELL_API, { headers: { 'X-Operator-Token': operatorId }, credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { plants?: ServerPlant[] }
        if (cancelled || !Array.isArray(data.plants)) return
        setPlants(data.plants
          .filter((p) => p.position && typeof p.position.x === 'number')
          .map((p): Plant => ({ id: p.id, name: p.name, plantType: p.plantType || 'sakura', position: [p.position.x, p.position.y, p.position.z] })))
      } catch (err) {
        console.error('[Sanctuary] GET /farewell/plants failed:', err)
        // Cherry-tree monuments have no mock fallback, so a silent failure makes
        // them simply disappear. Surface the offline banner (without clobbering a
        // more specific 'save' error) so an outage is visible, not invisible.
        if (!cancelled) setApiError((prev) => prev ?? 'offline')
      }
    })()
    return () => { cancelled = true }
  }, [operatorId])

  const pendingId = pending ? (pending.id ?? 'pending-local') : null
  const allPlants = useMemo<Plant[]>(() => {
    if (!pending) return plants
    const exists = plants.some((p) => p.id === pending.id)
    if (exists) return plants
    return [...plants, { id: pending.id ?? 'pending-local', name: pending.name, plantType: pending.plantType || 'sakura', position: pending.position }]
  }, [plants, pending])

  const onPlanted = () => setPlanting(false)
  useEffect(() => { if (!planting) return; const id = setTimeout(() => setPlanting(false), 6000); return () => clearTimeout(id) }, [planting])

  const myTag = tags.find((x) => x.ownerId === operatorId) || null

  const openWrite = () => {
    // Leave-a-memory is ONLY triggered by this 2D button — never by clicking a
    // 3D mesh. Open the form directly; the location comes from the modal's
    // "Place it at" dropdown (no clicking the 3D world required).
    setPickedPlace(null)
    setPlacedPoint(null)
    setEditing(myTag || null)
    setWriteOpen(true)
  }
  const editFromRead = (tag: Tag) => { setActiveTag(null); setPickedPlace(null); setEditing(tag); setPlacedPoint(null); setWriteOpen(true) }

  const submitMemory = async ({ author, message, landmark }: { author: string; message: string; landmark: string }) => {
    const a = clean(author), m = clean(message)
    if (!a || !m) return
    const lm = (LANDMARKS[landmark] || PLACE_KEYS.includes(landmark)) ? landmark : 'tree'
    const coords: Vec3 = placedPoint || editing?.position || LANDMARKS[lm]?.anchor || ([0, 4, 0] as Vec3)

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Operator-Token': operatorId },
        credentials: 'include',
        body: JSON.stringify({ author: a, message: m, landmark: lm, positionX: coords[0], positionY: coords[1], positionZ: coords[2] }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setApiError(null)
    } catch (err) {
      console.error('[Sanctuary] POST /memories failed:', err)
      setApiError('save')
    }

    const position = placedPoint || editing?.position || undefined
    if (editing) {
      const updated: Tag = { ...editing, author: a, message: m, landmark: lm, position }
      setTags((prev) => prev.map((x) => (x.id === editing.id ? updated : x)))
      saveMyMemory(updated)
    } else if (!myTag) {
      const created: Tag = { id: Date.now(), ownerId: operatorId, author: a, message: m, landmark: lm, position, date: new Date().toISOString().slice(0, 10) }
      setTags((prev) => [...prev, created])
      saveMyMemory(created)
    }
    setWriteOpen(false); setEditing(null); setPlacedPoint(null); setPickedPlace(null)
  }

  return (
    <ParticlesProvider init={initEngine}>
      <div className="relative h-[100dvh] w-screen overflow-hidden overscroll-none bg-black font-sans" style={{ WebkitTapHighlightColor: 'transparent' }}>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-sky-300 via-rose-200 to-amber-100 transition-opacity duration-[1200ms]" style={{ opacity: night ? 0 : 1 }} aria-label="Daytime sky" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#070b1c] via-[#141a38] to-[#2a1a3a] transition-opacity duration-[1200ms]" style={{ opacity: night ? 1 : 0, backgroundImage: 'radial-gradient(1px 1px at 12% 18%, #fff, transparent), radial-gradient(1px 1px at 28% 32%, #fff, transparent), radial-gradient(1.5px 1.5px at 45% 12%, #fff, transparent), radial-gradient(1px 1px at 63% 26%, #fff, transparent), radial-gradient(1px 1px at 78% 14%, #fff, transparent), radial-gradient(1.5px 1.5px at 88% 30%, #fff, transparent), linear-gradient(to bottom, #070b1c, #141a38, #2a1a3a)' }} aria-label="Starry night sky" />

        <div className="absolute inset-0 z-[15]">
          <Scene night={night} tags={tags} paused={paused} operatorId={operatorId} onOpen={setActiveTag}
            plants={allPlants} pendingId={pendingId} plantingTarget={planting && pending ? pending.position : null} onPlanted={onPlanted} />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[18] transition-opacity duration-[1200ms]" style={{ opacity: night ? 1 : 0, background: 'radial-gradient(circle at 50% 40%, transparent 30%, rgba(6,10,28,0.55) 100%)' }} aria-hidden />

        <Weather night={night} />

        <div className="absolute inset-x-0 top-0 z-[45] flex items-start justify-between gap-2 px-3 sm:px-4" style={{ paddingTop: 'max(0.85rem, env(safe-area-inset-top))' }}>
          <Link to="/" aria-label={t.home} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-white/25 bg-black/40 px-3.5 py-2 font-mono text-xs text-white/90 backdrop-blur-md transition hover:bg-black/60 sm:min-w-0"><ArrowLeft size={15} /><span className="hidden sm:inline">{t.home}</span></Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 p-1 backdrop-blur-md">
              {LANGS.map((l) => (
                <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`min-h-[36px] min-w-[40px] rounded-full px-3 py-1.5 font-mono text-[11px] transition ${lang === l.code ? 'bg-accent/70 text-white' : 'text-white/70 hover:text-white'}`}>{l.label}</button>
              ))}
            </div>
            <button type="button" onClick={() => setNight((n) => !n)} aria-label={night ? t.day : t.night} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-2 font-mono text-xs text-white/90 backdrop-blur-md transition hover:bg-black/60 sm:min-w-0">{night ? <SunIcon size={15} /> : <MoonIcon size={15} />}<span className="hidden sm:inline">{night ? t.day : t.night}</span></button>
            {hasAdminSession && (
              <Link to="/sanctuary-admin" aria-label="Admin dashboard" title="Admin dashboard" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-2 font-mono text-xs text-white/90 backdrop-blur-md transition hover:bg-black/60 sm:min-w-0"><Shield size={14} /><span className="hidden sm:inline">Admin</span></Link>
            )}
            <button type="button" onClick={openWrite} aria-label={myTag ? t.editMine : t.leave} className="sanctuary-pulse group inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-amber-100/70 bg-gradient-to-r from-lime-300 to-emerald-400 px-4 py-2.5 font-serif text-sm font-bold text-amber-950 ring-1 ring-white/40 backdrop-blur-sm transition hover:brightness-110 active:scale-[0.97] sm:min-w-0">
              {myTag ? <Pencil size={16} /> : <Mail size={17} className="transition-transform group-hover:-translate-y-0.5" />}<span className="hidden sm:inline">{myTag ? t.editMine : t.leave}</span>
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 z-[44] -translate-x-1/2 text-center" style={{ top: 'calc(max(0.85rem, env(safe-area-inset-top)) + 3.3rem)' }}>
          <h1 className="font-serif text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-3xl">{t.title}</h1>
          <p className="mt-1 hidden font-serif text-xs text-white/80 drop-shadow sm:block">{t.sub}</p>
          {apiError && (
            <p className="mx-auto mt-2 w-fit rounded-full border border-amber-300/40 bg-black/55 px-3 py-1 font-mono text-[11px] text-amber-200/90 backdrop-blur-md">
              {(API_MSG[lang] || API_MSG.en)[apiError]}
            </p>
          )}
        </div>

        <ReadModal tag={activeTag} t={t} canRead={!!activeTag && (activeTag.ownerId === operatorId || isAdmin)} canEdit={!!activeTag && activeTag.ownerId === operatorId} onEdit={editFromRead} onClose={() => setActiveTag(null)} />
        <WriteModal open={writeOpen} editing={editing} presetPlace={pickedPlace} t={t} onClose={() => { setWriteOpen(false); setEditing(null); setPickedPlace(null) }} onSubmit={submitMemory} />
        <WelcomeModal open={welcome} onClose={() => setWelcome(false)} />
      </div>
    </ParticlesProvider>
  )
}
