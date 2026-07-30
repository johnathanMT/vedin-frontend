import { motion } from 'framer-motion'
import { Github, ExternalLink, Bot, Coffee, Globe, Cpu, Code2, Zap, Star, GitBranch, ArrowUpRight } from 'lucide-react'

/**
 * GitHubProjects — a proper React page replacing the broken static
 * myweb_github_project.html.  Each project card exposes:
 *   • Title + description
 *   • Tech-stack tags with language-specific colours
 *   • Category badge
 *   • Status pill (Live · In Progress · Archived)
 *   • Primary language indicator
 *   • GitHub source button  + optional Live-demo button
 */

const GITHUB_PROFILE = 'https://github.com/johnathanMT'

type Status = 'live' | 'in-progress' | 'archived'

interface Repo {
  id: string
  title: string
  desc: string
  longDesc: string
  icon: typeof Bot
  category: string
  status: Status
  lang: string
  langColor: string
  stack: { name: string; color: string }[]
  github: string | null
  demo: string | null
  featured?: boolean
  stars?: number
  forks?: number
}

const REPOS: Repo[] = [
  {
    id: 'portfolio',
    title: 'MTN.Digitosphere Portfolio',
    desc: 'This very site — a full-stack SPA with WebGL 3D, AI poetry, and an interactive farewell sanctuary.',
    longDesc:
      'React 18 SPA bundled with Vite, styled with Tailwind CSS, animated with Framer Motion and Three.js. Backend: C# / .NET 8 REST API on Render with Aiven MySQL. Deployed to Vercel with strict CSP headers.',
    icon: Globe,
    category: 'Full-Stack Web',
    status: 'live',
    lang: 'TypeScript',
    langColor: '#3178c6',
    stack: [
      { name: 'React 18', color: '#61dafb' },
      { name: 'TypeScript', color: '#3178c6' },
      { name: 'Three.js', color: '#ffffff' },
      { name: 'C# / .NET 8', color: '#9b4dca' },
      { name: 'Tailwind CSS', color: '#38bdf8' },
      { name: 'Vite', color: '#ffbd4f' },
    ],
    github: 'https://github.com/johnathanMT/Myweb',
    demo: 'https://myothant.dev',
    featured: true,
    stars: 12,
    forks: 3,
  },
  {
    id: 'linebot',
    title: 'Gemini AI LINE Bot',
    desc: 'Multilingual AI chatbot on LINE that answers questions, analyses images, and runs on a Python backend.',
    longDesc:
      'Integrates Google Gemini API with the LINE Messaging API. Supports text queries, image analysis via Gemini Vision, and multi-language responses. Hosted on a Python Flask server.',
    icon: Bot,
    category: 'AI / Chatbot',
    status: 'live',
    lang: 'Python',
    langColor: '#3b82f6',
    stack: [
      { name: 'Python', color: '#3b82f6' },
      { name: 'Google Gemini', color: '#4285f4' },
      { name: 'LINE API', color: '#06c755' },
      { name: 'Flask', color: '#ffffff' },
    ],
    github: null,
    demo: 'https://lin.ee/s72ayHD',
    featured: true,
  },
  {
    id: 'coffee',
    title: 'Bean Boutique Coffee Shop',
    desc: 'A modern frontend website showcasing premium coffee beans, brewing equipment, and an aesthetic shop UI.',
    longDesc:
      'Hand-crafted HTML/CSS/JS site with responsive grid layout, smooth scroll animations, and a cohesive brand identity. Zero-dependency design to demonstrate vanilla front-end skills.',
    icon: Coffee,
    category: 'Frontend Web',
    status: 'live',
    lang: 'JavaScript',
    langColor: '#eab308',
    stack: [
      { name: 'HTML5', color: '#e34c26' },
      { name: 'CSS3', color: '#1572b6' },
      { name: 'JavaScript', color: '#eab308' },
    ],
    github: 'https://github.com/johnathanMT/bean-boutique-coffee-shop',
    demo: 'https://johnathanmt.github.io/bean-boutique-coffee-shop/',
    stars: 4,
  },
  {
    id: 'm5stack',
    title: 'M5Stack CoreS3 IoT Controller',
    desc: 'Hardware automation and sensor dashboarding with the M5Stack CoreS3 using Python and C#.',
    longDesc:
      'Embedded Python scripts run on the M5Stack CoreS3 device, collecting sensor data. A C# companion app on Windows reads and visualises the data in real time over serial / BLE.',
    icon: Cpu,
    category: 'IoT / Embedded',
    status: 'in-progress',
    lang: 'C#',
    langColor: '#9b4dca',
    stack: [
      { name: 'C#', color: '#9b4dca' },
      { name: 'Python', color: '#3b82f6' },
      { name: 'M5Stack', color: '#ef4444' },
    ],
    github: GITHUB_PROFILE,
    demo: null,
  },
  {
    id: 'python-auto',
    title: 'Python Automation Lab',
    desc: 'Everyday scripts — care-report filler, shift formatter, news scraper — built while working as a caregiver.',
    longDesc:
      'A collection of scripts solving real hospital-workflow problems: auto-filling monthly Excel care reports (openpyxl + pandas), converting shift emails to Google Calendar format, and scraping Japan IT news for a LINE daily brief.',
    icon: Code2,
    category: 'Automation',
    status: 'in-progress',
    lang: 'Python',
    langColor: '#3b82f6',
    stack: [
      { name: 'Python 3.12', color: '#3b82f6' },
      { name: 'Pandas', color: '#e05e00' },
      { name: 'OpenPyXL', color: '#22c55e' },
      { name: 'Selenium', color: '#43b02a' },
      { name: 'Schedule', color: '#a78bfa' },
    ],
    github: GITHUB_PROFILE,
    demo: '/python',
    stars: 6,
  },
]

const STATUS_CONFIG: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
  live: {
    label: 'Live',
    dot: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
    text: 'text-emerald-300',
    bg: 'bg-emerald-400/10 border-emerald-400/25',
  },
  'in-progress': {
    label: 'In Progress',
    dot: 'bg-amber-400 animate-pulse',
    text: 'text-amber-300',
    bg: 'bg-amber-400/10 border-amber-400/25',
  },
  archived: {
    label: 'Archived',
    dot: 'bg-gray-500',
    text: 'text-gray-400',
    bg: 'bg-gray-500/10 border-gray-500/25',
  },
}

function RepoCard({ repo, i }: { repo: Repo; i: number }) {
  const Icon = repo.icon
  const s = STATUS_CONFIG[repo.status]

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300',
        'bg-white/[0.03] hover:bg-white/[0.055]',
        repo.featured
          ? 'border-white/15 hover:border-white/25 shadow-[0_0_40px_rgba(0,0,0,0.5)]'
          : 'border-white/[0.08] hover:border-white/15',
      ].join(' ')}
    >
      {/* Top accent bar — language colour */}
      <div
        className="h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${repo.langColor}cc, transparent)` }}
      />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Header row */}
        <div className="mb-4 flex items-start gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
            style={{ background: `${repo.langColor}15`, border: `1px solid ${repo.langColor}30`, color: repo.langColor }}
          >
            <Icon size={20} strokeWidth={1.6} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold leading-tight text-white">{repo.title}</h3>
              {repo.featured && (
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-light">
                  Featured
                </span>
              )}
            </div>

            {/* Category + Status on the same row */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/50">
                {repo.category}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.bg} ${s.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-white/55">{repo.desc}</p>

        {/* Long description — shown on md+ */}
        <p className="mb-5 hidden text-xs leading-relaxed text-white/35 sm:block">
          {repo.longDesc}
        </p>

        {/* Tech stack tags */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {repo.stack.map((t) => (
            <span
              key={t.name}
              className="rounded-md border px-2 py-0.5 text-[11px] font-medium"
              style={{
                color: t.color,
                borderColor: `${t.color}35`,
                background: `${t.color}0f`,
              }}
            >
              {t.name}
            </span>
          ))}
        </div>

        {/* Footer: language indicator + stats + action buttons */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <div className="flex items-center gap-3">
            {/* Primary language dot */}
            <span className="flex items-center gap-1.5 text-xs text-white/45">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: repo.langColor }} />
              {repo.lang}
            </span>
            {repo.stars != null && (
              <span className="flex items-center gap-1 text-xs text-white/35">
                <Star size={11} /> {repo.stars}
              </span>
            )}
            {repo.forks != null && (
              <span className="flex items-center gap-1 text-xs text-white/35">
                <GitBranch size={11} /> {repo.forks}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {repo.github && (
              <a
                href={repo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
              >
                <Github size={13} />
                Source
              </a>
            )}
            {repo.demo && (
              repo.demo.startsWith('/') ? (
                <a
                  href={repo.demo}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-light transition-all hover:bg-accent/20"
                >
                  <Zap size={13} />
                  View
                </a>
              ) : (
                <a
                  href={repo.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-light transition-all hover:bg-accent/20"
                >
                  <ExternalLink size={13} />
                  Live Demo
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function GitHubProjects() {
  const liveCount = REPOS.filter((r) => r.status === 'live').length
  const inProgressCount = REPOS.filter((r) => r.status === 'in-progress').length
  const totalStack = [...new Set(REPOS.flatMap((r) => r.stack.map((s) => s.name)))].length

  return (
    <section
      id="github-projects"
      className="relative overflow-hidden py-16 sm:py-24"
      style={{ background: 'radial-gradient(70% 55% at 50% 0%, rgba(15,20,28,0.9), transparent 70%), #07090d' }}
    >
      {/* Subtle grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 20%, transparent 80%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Page header */}
        <div className="mb-10 text-center sm:mb-14">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-light">
            // open source
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            GitHub Projects
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
            A catalogue of repositories — from AI bots and IoT hardware to full-stack web apps and automation scripts.
          </p>

          {/* GitHub profile CTA */}
          <a
            href={GITHUB_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/35 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Github size={16} />
            @johnathanMT on GitHub
            <ArrowUpRight size={14} className="opacity-60" />
          </a>
        </div>

        {/* Stats strip */}
        <div className="mb-10 grid grid-cols-3 gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-center backdrop-blur-sm sm:mb-14 sm:p-6">
          <div>
            <p className="text-2xl font-bold text-white sm:text-3xl">{REPOS.length}</p>
            <p className="mt-1 text-[10px] text-white/40 sm:text-xs">Projects</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400 sm:text-3xl">{liveCount}</p>
            <p className="mt-1 text-[10px] text-white/40 sm:text-xs">Live</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400 sm:text-3xl">{inProgressCount}</p>
            <p className="mt-1 text-[10px] text-white/40 sm:text-xs">In Progress</p>
          </div>
        </div>

        {/* Project grid: 1-col on xs, 2-col on lg */}
        <div className="grid gap-5 sm:grid-cols-2">
          {REPOS.map((repo, i) => (
            <RepoCard key={repo.id} repo={repo} i={i} />
          ))}
        </div>

        {/* Bottom strip: stack count + open-source note */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm text-white/60">
              <span className="font-semibold text-white">{totalStack} technologies</span> across all projects.
            </p>
            <p className="mt-0.5 text-xs text-white/35">
              More repositories and experiments on GitHub.
            </p>
          </div>
          <a
            href={GITHUB_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <Github size={15} />
            View all on GitHub
            <ArrowUpRight size={13} className="opacity-50" />
          </a>
        </div>
      </div>
    </section>
  )
}
