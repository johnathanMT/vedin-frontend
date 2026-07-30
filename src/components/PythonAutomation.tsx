import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Bot, GitBranch, Database, Play, Newspaper, Calendar, FileSpreadsheet, type LucideIcon } from 'lucide-react'
import JourneyCrosslink from './JourneyCrosslink'

/**
 * PythonAutomation — "Cyber Python" terminal / hacker-IDE aesthetic.
 * Real scripts from the caregiving → coding transition (ported from legacy HTML).
 */
const NEON = '#22ff88'

interface Tool { icon: LucideIcon; name: string; file: string; cmd: string; desc: string; tags: string[]; github?: string }

const TOOLS: Tool[] = [
  {
    icon: FileSpreadsheet, name: 'Excel Report Auto-Filler', file: 'kaigo_report.py',
    cmd: 'python kaigo_report.py --month 06 --csv raw_shifts.csv',
    desc: 'Automatically fills monthly care reports at Hirashima Hospital using data exported from raw CSV files — born from real kaigo paperwork.',
    tags: ['pandas', 'openpyxl'],
  },
  {
    icon: Calendar, name: 'Shift Schedule Formatter', file: 'shift_maker.py',
    cmd: 'python shift_maker.py --inbox shifts@hospital.jp --cal gcal',
    desc: 'Parses messy shift-notification emails and converts them into a clean Google Calendar format for part-time and full-time rosters.',
    tags: ['automation', 'email'],
  },
  {
    icon: Newspaper, name: 'Daily News Scraper', file: 'news_bot.py',
    cmd: 'python news_bot.py --sources itmedia,nikkei --notify line',
    desc: 'Scrapes Japan IT news each morning and sends a concise summary to Line/Telegram — keeping study and work trends in one feed.',
    tags: ['selenium', 'beautifulsoup'],
  },
  {
    icon: Bot, name: 'Auto File Sorter', file: 'sort_files.py',
    cmd: 'python sort_files.py --watch ~/Downloads',
    desc: 'Watches a folder and auto-categorises downloads by type, date, and custom rules — coursework PDFs vs. hospital exports.',
    tags: ['os', 'watchdog'],
  },
  {
    icon: Database, name: 'Data Scraper', file: 'scrape.py',
    cmd: 'python scrape.py --site target --out data.csv',
    desc: 'Collects and cleans structured data from web pages into tidy CSVs for NCC assignments and side projects.',
    tags: ['requests', 'pandas'],
  },
  {
    icon: GitBranch, name: 'Git Batch Tools', file: 'repo_ops.py',
    cmd: 'python repo_ops.py --sync --all',
    desc: 'Batch-syncs and tags multiple portfolio repositories in one command — this site, coffee shop, and coursework repos.',
    tags: ['gitpython'],
  },
]

const STACK = ['Python 3.12', 'Pandas', 'OpenPyXL', 'Selenium', 'BeautifulSoup', 'Schedule', 'psutil']

function ToolCard({ tool, i }: { tool: Tool; i: number }) {
  const Icon = tool.icon
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: i * 0.06 }}
      whileHover={{ y: -6 }}
      className="group relative block overflow-hidden rounded-xl border border-emerald-500/20 bg-[#070d0a]/80 font-mono shadow-lg transition-colors hover:border-emerald-400/60"
      style={{ boxShadow: '0 0 0 1px rgba(34,255,136,0.04)' }}
    >
      <div className="flex items-center gap-2 border-b border-emerald-500/15 bg-[#0b1410] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 truncate text-xs text-emerald-300/60">~/automation/{tool.file}</span>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 transition-shadow group-hover:shadow-[0_0_18px_rgba(34,255,136,0.45)]">
            <Icon size={20} />
          </span>
          <h3 className="text-base font-semibold text-emerald-50">{tool.name}</h3>
        </div>

        <div className="mb-3 rounded-md border border-emerald-500/15 bg-black/50 px-3 py-2 text-[12.5px] leading-relaxed">
          <span className="text-emerald-400">$</span>{' '}
          <span className="text-emerald-200/90">{tool.cmd}</span>
          <span className="ml-0.5 inline-block w-2 animate-pulse bg-emerald-400" style={{ height: '1em', verticalAlign: '-2px' }} />
        </div>

        <p className="mb-4 text-sm leading-relaxed text-emerald-100/60" style={{ fontFamily: 'system-ui, sans-serif' }}>
          {tool.desc}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.map((t) => (
              <span key={t} className="rounded border border-emerald-500/25 px-2 py-0.5 text-[11px] text-emerald-300/80">
                {t}
              </span>
            ))}
          </div>
          <a
            href="https://github.com/johnathanMT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-emerald-300 opacity-70 transition-opacity hover:opacity-100"
          >
            <Play size={13} /> source
          </a>
        </div>
      </div>

      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px -translate-y-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent transition-transform duration-700 group-hover:translate-y-[200px]"
        style={{ boxShadow: `0 0 12px ${NEON}` }}
      />
    </motion.article>
  )
}

export default function PythonAutomation() {
  return (
    <section
      id="python-automation"
      className="relative overflow-hidden py-16 sm:py-24"
      style={{ background: 'radial-gradient(80% 60% at 50% 0%, rgba(212, 175, 55,0.08), transparent 70%), #04070a' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(34,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,255,136,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 80%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center font-mono">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">// python.automation</p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-50 sm:text-4xl">
            <span className="text-emerald-400">&gt;_</span> Cyber Python Tools
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100/50" style={{ fontFamily: 'system-ui' }}>
            Scripts I built while working as a caregiver in Japan — automating the boring parts of
            hospital reports, shift emails, and study research. The practical “how” after the{' '}
            <Link to="/bibliography" className="text-emerald-300 underline-offset-2 hover:underline">journey</Link>
            {' '}and alongside my{' '}
            <Link to="/studying" className="text-emerald-300 underline-offset-2 hover:underline">studying</Link>.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {STACK.map((lib) => (
            <span key={lib} className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-200/70">
              {lib}
            </span>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t, i) => <ToolCard key={t.file} tool={t} i={i} />)}
        </div>

        <div className="px-0">
          <JourneyCrosslink current="python" />
        </div>
      </div>
    </section>
  )
}
