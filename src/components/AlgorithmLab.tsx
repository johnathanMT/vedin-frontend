import { useEffect, useMemo, useRef, useState } from 'react'
import { Cpu, Play, Shuffle, RotateCcw, Route, BarChart3, Binary, Plus, Swords, Gauge, type LucideIcon } from 'lucide-react'
import { useInView } from '../hooks/useInView'

/**
 * AlgorithmLab — an interactive "live CS" section: real sorting algorithms and
 * A* pathfinding, animated step-by-step in the cyber palette (jade = scanning,
 * maroon = compare/swap, gold = sorted / final path). Pure React + theme tokens,
 * no external libs. Precomputes animation frames, then plays them on a timer so
 * the main thread never blocks.
 */

const JADE = 'rgb(var(--jade))'
const JADE_L = 'rgb(var(--jade-light))'
const MAROON = 'rgb(var(--accent-light))'
const GOLD = '#d4af37'

// Shared grid-search maze shape (cells are flat indices into a ROWS×COLS grid).
interface Maze { walls: Set<number>; start: number; end: number }
interface SearchResult { visited: number[]; path: number[] }

interface VizProps { speed?: number; active?: boolean }

/* ───────────────────────── Sorting ───────────────────────── */
const ALGOS: Record<string, string> = {
  bubble: 'Bubble Sort',
  insertion: 'Insertion Sort',
  selection: 'Selection Sort',
  quick: 'Quick Sort',
}
const COMPLEXITY: Record<string, string> = {
  bubble: 'O(n²) · stable',
  insertion: 'O(n²) · adaptive',
  selection: 'O(n²) · in-place',
  quick: 'O(n log n) avg',
}

interface SortFrame { arr: number[]; active: number[]; done: number[] }

function genSortFrames(input: number[], algo: string): SortFrame[] {
  const a = input.slice()
  const frames: SortFrame[] = []
  const snap = (active: number[] = [], done: number[] = []) => frames.push({ arr: a.slice(), active, done })
  const swap = (i: number, j: number) => { const t = a[i]; a[i] = a[j]; a[j] = t }

  if (algo === 'bubble') {
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length - 1 - i; j++) {
        snap([j, j + 1])
        if (a[j] > a[j + 1]) { swap(j, j + 1); snap([j, j + 1]) }
      }
    }
  } else if (algo === 'insertion') {
    for (let i = 1; i < a.length; i++) {
      let j = i
      while (j > 0 && a[j - 1] > a[j]) { snap([j, j - 1]); swap(j, j - 1); j-- }
      snap([j])
    }
  } else if (algo === 'selection') {
    for (let i = 0; i < a.length; i++) {
      let m = i
      for (let j = i + 1; j < a.length; j++) { snap([m, j]); if (a[j] < a[m]) m = j }
      swap(i, m); snap([i, m])
    }
  } else if (algo === 'quick') {
    const qs = (lo: number, hi: number) => {
      if (lo >= hi) return
      const pivot = a[hi]; let i = lo
      for (let j = lo; j < hi; j++) { snap([j, hi]); if (a[j] < pivot) { swap(i, j); snap([i, j]); i++ } }
      swap(i, hi); snap([i, hi]); qs(lo, i - 1); qs(i + 1, hi)
    }
    qs(0, a.length - 1)
  }
  snap([], a.map((_, i) => i))   // everything sorted
  return frames
}

function SortingViz({ speed = 1, active = true }: VizProps) {
  const N = 38
  const rand = () => Array.from({ length: N }, () => 8 + Math.floor(Math.random() * 92))
  const [base, setBase] = useState<number[]>(rand)
  const [algo, setAlgo] = useState('quick')
  const [frame, setFrame] = useState<SortFrame>({ arr: base, active: [], done: [] })
  const [running, setRunning] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => { setFrame({ arr: base, active: [], done: [] }) }, [base])
  useEffect(() => () => clearInterval(timer.current), [])
  // Stop the run if the Lab scrolls off-screen (no CPU spent while invisible).
  useEffect(() => { if (!active) { clearInterval(timer.current); setRunning(false) } }, [active])

  const run = () => {
    clearInterval(timer.current)
    const frames = genSortFrames(base, algo)
    let i = 0
    setRunning(true)
    timer.current = setInterval(() => {
      setFrame(frames[i])
      i++
      if (i >= frames.length) { clearInterval(timer.current); setRunning(false) }
    }, Math.max(2, 18 / speed))
  }
  const shuffle = () => { clearInterval(timer.current); setRunning(false); setBase(rand()) }

  const max = 100
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={algo} onChange={(e) => setAlgo(e.target.value)} disabled={running}
          className="rounded-lg border border-jade/30 bg-black/40 px-3 py-2 font-mono text-xs text-jade-light outline-none focus:border-jade/60 disabled:opacity-50">
          {Object.entries(ALGOS).map(([k, v]) => <option key={k} value={k} className="bg-black text-white">{v}</option>)}
        </select>
        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-gray-400">{COMPLEXITY[algo]}</span>
        <button onClick={run} disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs text-accent-light transition hover:bg-accent/20 disabled:opacity-50">
          <Play size={13} /> Run
        </button>
        <button onClick={shuffle}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs text-gray-300 transition hover:bg-white/10">
          <Shuffle size={13} /> Shuffle
        </button>
      </div>

      <div className="flex h-56 items-end justify-center gap-[3px] rounded-xl border border-white/10 bg-black/30 p-3">
        {frame.arr.map((v, i) => {
          const isActive = frame.active.includes(i)
          const isDone = frame.done.includes(i)
          const color = isDone ? GOLD : isActive ? MAROON : JADE
          return (
            <div key={i} className="w-full rounded-t-sm transition-[height] duration-75"
              style={{ height: `${(v / max) * 100}%`, background: color, boxShadow: isActive ? `0 0 10px ${MAROON}` : isDone ? `0 0 8px ${GOLD}66` : 'none' }} />
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] text-gray-400">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: JADE }} /> idle</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: MAROON }} /> comparing / swapping</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: GOLD }} /> sorted</span>
      </div>
    </div>
  )
}

/* ───────────────────────── A* Pathfinding ───────────────────────── */
const ROWS = 13
const COLS = 27
const idx = (r: number, c: number) => r * COLS + c

function genMaze(): Maze {
  const walls = new Set<number>()
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (Math.random() < 0.26) walls.add(idx(r, c))
  }
  const start = idx(Math.floor(ROWS / 2), 1)
  const end = idx(Math.floor(ROWS / 2), COLS - 2)
  walls.delete(start); walls.delete(end)
  return { walls, start, end }
}

function astar(walls: Set<number>, start: number, end: number): SearchResult {
  const h = (a: number, b: number) => Math.abs((a % COLS) - (b % COLS)) + Math.abs(Math.floor(a / COLS) - Math.floor(b / COLS))
  const open = new Set<number>([start])
  const came = new Map<number, number>()
  const g = new Map<number, number>([[start, 0]])
  const f = new Map<number, number>([[start, h(start, end)]])
  const visited: number[] = []
  const neighbors = (n: number) => {
    const r = Math.floor(n / COLS), c = n % COLS, out: number[] = []
    if (r > 0) out.push(idx(r - 1, c)); if (r < ROWS - 1) out.push(idx(r + 1, c))
    if (c > 0) out.push(idx(r, c - 1)); if (c < COLS - 1) out.push(idx(r, c + 1))
    return out.filter((x) => !walls.has(x))
  }
  while (open.size) {
    let cur: number | null = null, best = Infinity
    for (const n of open) { const fn = f.get(n) ?? Infinity; if (fn < best) { best = fn; cur = n } }
    if (cur === null) break
    if (cur === end) {
      const path = [cur]; let p = cur
      while (came.has(p)) { const next = came.get(p); if (next === undefined) break; p = next; path.push(p) }
      return { visited, path: path.reverse() }
    }
    open.delete(cur); visited.push(cur)
    for (const nb of neighbors(cur)) {
      const tentative = (g.get(cur) ?? Infinity) + 1
      if (tentative < (g.get(nb) ?? Infinity)) {
        came.set(nb, cur); g.set(nb, tentative); f.set(nb, tentative + h(nb, end)); open.add(nb)
      }
    }
  }
  return { visited, path: [] }
}

function PathViz({ speed = 1, active = true }: VizProps) {
  const [maze, setMaze] = useState<Maze>(genMaze)
  const [visited, setVisited] = useState<Set<number>>(new Set())
  const [path, setPath] = useState<Set<number>>(new Set())
  const [running, setRunning] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  useEffect(() => () => clearInterval(timer.current), [])
  useEffect(() => { if (!active) { clearInterval(timer.current); setRunning(false) } }, [active])

  const reset = (m: Maze = maze) => { clearInterval(timer.current); setRunning(false); setVisited(new Set()); setPath(new Set()); if (m !== maze) setMaze(m) }
  const regenerate = () => reset(genMaze())

  const run = () => {
    clearInterval(timer.current)
    setVisited(new Set()); setPath(new Set())
    const { visited: vOrder, path: pPath } = astar(maze.walls, maze.start, maze.end)
    let i = 0
    setRunning(true)
    const vAcc = new Set<number>()
    timer.current = setInterval(() => {
      const step = Math.ceil(vOrder.length / 90) || 1
      for (let k = 0; k < step && i < vOrder.length; k++, i++) vAcc.add(vOrder[i])
      setVisited(new Set(vAcc))
      if (i >= vOrder.length) {
        clearInterval(timer.current)
        // draw the path
        let j = 0
        const pAcc = new Set<number>()
        timer.current = setInterval(() => {
          pAcc.add(pPath[j]); setPath(new Set(pAcc)); j++
          if (j >= pPath.length) { clearInterval(timer.current); setRunning(false) }
        }, Math.max(4, 26 / speed))
      }
    }, Math.max(2, 16 / speed))
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={run} disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs text-accent-light transition hover:bg-accent/20 disabled:opacity-50">
          <Play size={13} /> Find Path
        </button>
        <button onClick={regenerate}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs text-gray-300 transition hover:bg-white/10">
          <Shuffle size={13} /> New Maze
        </button>
        <button onClick={() => reset()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs text-gray-300 transition hover:bg-white/10">
          <RotateCcw size={13} /> Clear
        </button>
        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-gray-400">A* · Manhattan heuristic</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const isWall = maze.walls.has(i)
            const isStart = i === maze.start, isEnd = i === maze.end
            const inPath = path.has(i), seen = visited.has(i)
            let bg = 'rgb(255 255 255 / 0.03)', glow = 'none'
            if (isWall) bg = 'rgb(255 255 255 / 0.10)'
            if (seen) { bg = `rgb(var(--jade) / 0.30)` }
            if (inPath) { bg = GOLD; glow = `0 0 8px ${GOLD}` }
            if (isStart) { bg = MAROON; glow = `0 0 8px ${MAROON}` }
            if (isEnd) { bg = JADE_L; glow = `0 0 8px ${JADE_L}` }
            return <div key={i} className="aspect-square rounded-[2px] transition-colors duration-150" style={{ background: bg, boxShadow: glow }} />
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] text-gray-400">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: MAROON }} /> start</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: JADE_L }} /> goal</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: 'rgba(26,200,132,0.4)' }} /> explored</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: GOLD }} /> shortest path</span>
      </div>
    </div>
  )
}

/* ───────────────────────── Binary Search Tree ───────────────────────── */
interface LayoutNode { val: number; x: number; depth: number }
interface BSTNode { val: number; left: BSTNode | null; right: BSTNode | null; __p?: LayoutNode }

function bstInsert(root: BSTNode | null, val: number): BSTNode {
  if (!root) return { val, left: null, right: null }
  if (val < root.val) root.left = bstInsert(root.left, val)
  else if (val > root.val) root.right = bstInsert(root.right, val)
  return root
}
function bstBuild(vals: number[]): BSTNode | null { let r: BSTNode | null = null; vals.forEach((v) => { r = bstInsert(r, v) }); return r }
function bstCount(n: BSTNode | null): number { return n ? 1 + bstCount(n.left) + bstCount(n.right) : 0 }

interface BSTLayout { nodes: LayoutNode[]; edges: [LayoutNode, LayoutNode][]; cols: number; maxDepth: number }

// In-order x index + depth y → tidy tree coordinates, plus parent→child edges.
function bstLayout(root: BSTNode | null): BSTLayout {
  const nodes: LayoutNode[] = [], edges: [LayoutNode, LayoutNode][] = []
  let i = 0, maxDepth = 0
  const walk = (n: BSTNode | null, depth: number) => {
    if (!n) return
    walk(n.left, depth + 1)
    const me: LayoutNode = { val: n.val, x: i++, depth }
    maxDepth = Math.max(maxDepth, depth)
    nodes.push(me); n.__p = me
    if (n.left && n.left.__p) edges.push([me, n.left.__p])
    walk(n.right, depth + 1)
    if (n.right && n.right.__p) edges.push([me, n.right.__p])
  }
  walk(root, 0)
  return { nodes, edges, cols: Math.max(i, 1), maxDepth }
}

function BSTViz({ speed = 1, active = true }: VizProps) {
  const [root, setRoot] = useState<BSTNode | null>(() => bstBuild([50, 30, 70, 20, 40, 60, 80, 35]))
  const [path, setPath] = useState<number[]>([])     // vals on the compare path (highlight)
  const [hot, setHot] = useState<number | null>(null)     // just-inserted value (gold)
  const [input, setInput] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => { if (!active) { timers.current.forEach(clearTimeout); timers.current = []; setPath([]); setHot(null) } }, [active])

  const insert = (raw: string | number) => {
    const v = typeof raw === 'number' ? raw : parseInt(raw, 10)
    if (Number.isNaN(v) || v < 1 || v > 99 || bstCount(root) >= 15) return
    timers.current.forEach(clearTimeout); timers.current = []
    // compare path from root to insertion point
    const p: number[] = []; let cur: BSTNode | null = root
    while (cur) { p.push(cur.val); if (v === cur.val) return; cur = v < cur.val ? cur.left : cur.right }
    setPath([]); setHot(null)
    const D = Math.max(60, 230 / speed)
    p.forEach((_, k) => timers.current.push(setTimeout(() => setPath(p.slice(0, k + 1)), D * (k + 1))))
    timers.current.push(setTimeout(() => {
      setRoot((r) => bstInsert(structuredClone(r), v)); setHot(v); setPath([])
    }, D * (p.length + 1)))
    timers.current.push(setTimeout(() => setHot(null), D * (p.length + 1) + 900))
  }

  const { nodes, edges, cols, maxDepth } = bstLayout(root)
  const W = cols * 56, H = (maxDepth + 1) * 70
  const px = (x: number) => (x + 0.5) * (W / cols)
  const py = (d: number) => (d + 0.5) * (H / (maxDepth + 1))

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} type="number" min="1" max="99" placeholder="1–99"
          onKeyDown={(e) => { if (e.key === 'Enter') { insert(input); setInput('') } }}
          className="w-24 rounded-lg border border-jade/30 bg-black/40 px-3 py-2 font-mono text-xs text-jade-light outline-none focus:border-jade/60" />
        <button onClick={() => { insert(input); setInput('') }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs text-accent-light transition hover:bg-accent/20">
          <Plus size={13} /> Insert
        </button>
        <button onClick={() => insert(1 + Math.floor(Math.random() * 99))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs text-gray-300 transition hover:bg-white/10">
          <Shuffle size={13} /> Random
        </button>
        <button onClick={() => { timers.current.forEach(clearTimeout); setPath([]); setHot(null); setRoot(bstBuild([50, 30, 70])) }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs text-gray-300 transition hover:bg-white/10">
          <RotateCcw size={13} /> Reset
        </button>
        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-gray-400">insert O(log n) avg · {bstCount(root)}/15 nodes</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto" style={{ width: '100%', minWidth: Math.min(W, 520) }}>
          <g stroke="rgb(255 255 255 / 0.18)" strokeWidth="1.4">
            {edges.map(([a, b], k) => <line key={k} x1={px(a.x)} y1={py(a.depth)} x2={px(b.x)} y2={py(b.depth)} />)}
          </g>
          {nodes.map((n) => {
            const onPath = path.includes(n.val)
            const isHot = hot === n.val
            const fill = isHot ? GOLD : onPath ? MAROON : 'rgb(var(--card))'
            const stroke = isHot ? GOLD : onPath ? MAROON : JADE
            return (
              <g key={n.val} style={{ filter: isHot ? `drop-shadow(0 0 8px ${GOLD})` : onPath ? `drop-shadow(0 0 6px ${MAROON})` : 'none' }}>
                <circle cx={px(n.x)} cy={py(n.depth)} r="17" fill={fill} stroke={stroke} strokeWidth="1.6" />
                <text x={px(n.x)} y={py(n.depth) + 4} textAnchor="middle" className="font-mono" fontSize="12"
                  fill={isHot || onPath ? '#0a0a0a' : '#e5e7eb'} fontWeight="700">{n.val}</text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] text-gray-400">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: MAROON }} /> compare path</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: GOLD }} /> just inserted</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: JADE }} /> node</span>
      </div>
    </div>
  )
}

/* ───────────────────────── Dijkstra vs A* race ───────────────────────── */
const RR = 11, RC = 19
const rIdx = (r: number, c: number) => r * RC + c

function rGenMaze(): Maze {
  const walls = new Set<number>()
  for (let r = 0; r < RR; r++) for (let c = 0; c < RC; c++) if (Math.random() < 0.24) walls.add(rIdx(r, c))
  const start = rIdx(Math.floor(RR / 2), 1)
  const end = rIdx(Math.floor(RR / 2), RC - 2)
  walls.delete(start); walls.delete(end)
  return { walls, start, end }
}

// One search, heuristic toggled: useH=false → Dijkstra (uniform cost),
// useH=true → A* (Manhattan). Same code path makes the comparison honest.
function rSearch(walls: Set<number>, start: number, end: number, useH: boolean): SearchResult {
  const h = (a: number, b: number) => useH ? Math.abs((a % RC) - (b % RC)) + Math.abs(Math.floor(a / RC) - Math.floor(b / RC)) : 0
  const open = new Set<number>([start]), came = new Map<number, number>()
  const g = new Map<number, number>([[start, 0]]), f = new Map<number, number>([[start, h(start, end)]])
  const visited: number[] = []
  const nbrs = (n: number) => {
    const r = Math.floor(n / RC), c = n % RC, o: number[] = []
    if (r > 0) o.push(rIdx(r - 1, c)); if (r < RR - 1) o.push(rIdx(r + 1, c))
    if (c > 0) o.push(rIdx(r, c - 1)); if (c < RC - 1) o.push(rIdx(r, c + 1))
    return o.filter((x) => !walls.has(x))
  }
  while (open.size) {
    let cur: number | null = null, best = Infinity
    for (const n of open) { const fn = f.get(n) ?? Infinity; if (fn < best) { best = fn; cur = n } }
    if (cur === null) break
    if (cur === end) {
      const path = [cur]; let p = cur
      while (came.has(p)) { const next = came.get(p); if (next === undefined) break; p = next; path.push(p) }
      return { visited, path: path.reverse() }
    }
    open.delete(cur); visited.push(cur)
    for (const nb of nbrs(cur)) {
      const t = (g.get(cur) ?? Infinity) + 1
      if (t < (g.get(nb) ?? Infinity)) { came.set(nb, cur); g.set(nb, t); f.set(nb, t + h(nb, end)); open.add(nb) }
    }
  }
  return { visited, path: [] }
}

function RaceGrid({ maze, visited, path, tint }: { maze: Maze; visited: Set<number>; path: Set<number>; tint: string }) {
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${RC}, minmax(0, 1fr))` }}>
      {Array.from({ length: RR * RC }, (_, i) => {
        const isWall = maze.walls.has(i), isStart = i === maze.start, isEnd = i === maze.end
        let bg = 'rgb(255 255 255 / 0.03)', glow = 'none'
        if (isWall) bg = 'rgb(255 255 255 / 0.10)'
        if (visited.has(i)) bg = tint
        if (path.has(i)) { bg = GOLD; glow = `0 0 7px ${GOLD}` }
        if (isStart) { bg = MAROON; glow = `0 0 7px ${MAROON}` }
        if (isEnd) { bg = JADE_L; glow = `0 0 7px ${JADE_L}` }
        return <div key={i} className="aspect-square rounded-[2px] transition-colors duration-150" style={{ background: bg, boxShadow: glow }} />
      })}
    </div>
  )
}

interface RaceStats { d: number; a: number }

function RaceViz({ speed = 1, active = true }: VizProps) {
  const [maze, setMaze] = useState<Maze>(rGenMaze)
  const [vD, setVD] = useState<Set<number>>(new Set()), [vA, setVA] = useState<Set<number>>(new Set())
  const [pD, setPD] = useState<Set<number>>(new Set()), [pA, setPA] = useState<Set<number>>(new Set())
  const [stats, setStats] = useState<RaceStats | null>(null)
  const [running, setRunning] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  useEffect(() => () => clearInterval(timer.current), [])
  useEffect(() => { if (!active) { clearInterval(timer.current); setRunning(false) } }, [active])

  const reset = (m: Maze = maze) => {
    clearInterval(timer.current); setRunning(false)
    setVD(new Set()); setVA(new Set()); setPD(new Set()); setPA(new Set()); setStats(null)
    if (m !== maze) setMaze(m)
  }

  const run = () => {
    clearInterval(timer.current)
    setVD(new Set()); setVA(new Set()); setPD(new Set()); setPA(new Set()); setStats(null)
    const d = rSearch(maze.walls, maze.start, maze.end, false)
    const a = rSearch(maze.walls, maze.start, maze.end, true)
    const FRAMES = 64
    const stepD = Math.max(1, Math.ceil(d.visited.length / FRAMES))
    const stepA = Math.max(1, Math.ceil(a.visited.length / FRAMES))
    let iD = 0, iA = 0; const accD = new Set<number>(), accA = new Set<number>()
    setRunning(true)
    timer.current = setInterval(() => {
      for (let k = 0; k < stepD && iD < d.visited.length; k++, iD++) accD.add(d.visited[iD])
      for (let k = 0; k < stepA && iA < a.visited.length; k++, iA++) accA.add(a.visited[iA])
      setVD(new Set(accD)); setVA(new Set(accA))
      if (iD >= d.visited.length && iA >= a.visited.length) {
        clearInterval(timer.current)
        let j = 0; const ppD = new Set<number>(), ppA = new Set<number>(); const maxLen = Math.max(d.path.length, a.path.length)
        timer.current = setInterval(() => {
          if (j < d.path.length) ppD.add(d.path[j]); if (j < a.path.length) ppA.add(a.path[j]); j++
          setPD(new Set(ppD)); setPA(new Set(ppA))
          if (j >= maxLen) { clearInterval(timer.current); setRunning(false); setStats({ d: d.visited.length, a: a.visited.length }) }
        }, Math.max(5, 30 / speed))
      }
    }, Math.max(2, 18 / speed))
  }

  const saved = stats && stats.d > 0 ? Math.round((1 - stats.a / stats.d) * 100) : 0

  const panels = [
    { title: 'Dijkstra', sub: 'no heuristic — explores everywhere', v: vD, p: pD, tint: 'rgb(var(--accent) / 0.22)', color: MAROON },
    { title: 'A*', sub: 'Manhattan heuristic — heads for the goal', v: vA, p: pA, tint: 'rgb(var(--jade) / 0.26)', color: JADE_L },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={run} disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs text-accent-light transition hover:bg-accent/20 disabled:opacity-50">
          <Play size={13} /> Race
        </button>
        <button onClick={() => reset(rGenMaze())}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs text-gray-300 transition hover:bg-white/10">
          <Shuffle size={13} /> New Maze
        </button>
        <button onClick={() => reset()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs text-gray-300 transition hover:bg-white/10">
          <RotateCcw size={13} /> Clear
        </button>
        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-gray-400">same maze · same start &amp; goal</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {panels.map((panel) => (
          <div key={panel.title} className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-sm font-semibold text-white">{panel.title}</span>
              <span className="hidden font-mono text-[10px] text-gray-500 sm:inline">{panel.sub}</span>
            </div>
            <RaceGrid maze={maze} visited={panel.v} path={panel.p} tint={panel.tint} />
            {/* LIVE counter — ticks up in real time as cells are explored */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-500">
                {running && <i className="h-1.5 w-1.5 animate-ping rounded-full" style={{ background: panel.color }} />}
                cells explored
              </span>
              <span className="font-mono text-xl font-bold tabular-nums transition-colors" style={{ color: panel.color }}>
                {panel.v.size}
              </span>
            </div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="mt-4 rounded-xl border border-jade/30 bg-jade/10 px-4 py-3 text-center font-mono text-xs text-jade-light">
          🏁 A* reached the goal exploring <b>{saved}% fewer</b> cells than Dijkstra ({stats.a} vs {stats.d}) — same shortest path, less work.
        </div>
      )}
    </div>
  )
}

interface LabTab { id: string; label: string; Icon: LucideIcon }

export default function AlgorithmLab() {
  const [tab, setTab] = useState('sort')
  const [speed, setSpeed] = useState(1)   // animation multiplier (applies on next run)
  const [viewRef, inView] = useInView({ threshold: 0.12 })
  const tabs = useMemo<LabTab[]>(() => ([
    { id: 'sort', label: 'Sorting Race', Icon: BarChart3 },
    { id: 'path', label: 'A* Pathfinding', Icon: Route },
    { id: 'race', label: 'Dijkstra vs A*', Icon: Swords },
    { id: 'bst', label: 'BST Builder', Icon: Binary },
  ]), [])

  return (
    <section id="lab" ref={viewRef} className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-jade">// ALGORITHM LAB</p>
        <h2 className="mt-4 flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl">
          <Cpu className="text-accent-light" size={30} /> Computer Science, <span className="text-accent-light">running live</span>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">
          Not screenshots — real algorithms executing in your browser, step by step. Watch classic sorts compete and
          A* search find the shortest path through a maze.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap rounded-xl border border-white/10 bg-black/40 p-1">
            {tabs.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs transition ${tab === id ? 'bg-accent/20 text-accent-light' : 'text-gray-400 hover:text-white'}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Speed slider — applies to the next run of any visualizer */}
          <label className="inline-flex items-center gap-2 font-mono text-[11px] text-gray-400" title="Animation speed (applies on next run)">
            <Gauge size={14} className="text-jade" /> speed
            <input type="range" min="0.5" max="4" step="0.5" value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="h-1 w-28 cursor-pointer" style={{ accentColor: 'rgb(var(--accent))' }} />
            <span className="w-9 text-right text-jade-light">{speed.toFixed(1)}×</span>
          </label>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7">
          {tab === 'sort' ? <SortingViz speed={speed} active={inView} /> : tab === 'path' ? <PathViz speed={speed} active={inView} /> : tab === 'race' ? <RaceViz speed={speed} active={inView} /> : <BSTViz speed={speed} active={inView} />}
        </div>
      </div>
    </section>
  )
}
