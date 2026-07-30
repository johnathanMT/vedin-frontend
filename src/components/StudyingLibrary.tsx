import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Landmark, BookOpen, Globe2, Feather, GraduationCap, ScrollText, Brain, Code2,
  Network, Database, type LucideIcon,
} from 'lucide-react'
import JourneyCrosslink from './JourneyCrosslink'

/**
 * StudyingLibrary — Dark Academia reading room for NCC, IBM AI, and self-study tracks.
 * Content ported from legacy myweb_PStudying.html with live progress indicators.
 */
const PARCHMENT = '#e8dcc0'
const GOLD = '#c8a04a'

interface Stat { value: string; label: string }
const STATS: Stat[] = [
  { value: 'L4', label: 'NCC Diploma Level' },
  { value: '3+', label: 'Certificates Earned' },
  { value: '500+', label: 'Coding Hours' },
]

type ModuleStatus = 'done' | 'active' | 'locked'

interface Curriculum {
  icon: LucideIcon; tag: string; title: string; school: string; progress: number
  accent: string; modules: { name: string; status: ModuleStatus }[]
}

const CURRICULUM: Curriculum[] = [
  {
    icon: GraduationCap, tag: 'University', title: 'NCC L4 Diploma in Computing',
    school: 'Strategy First / NCC Education UK → University of Wolverhampton',
    progress: 40, accent: '#3b82f6',
    modules: [
      { name: 'Skills for Computing', status: 'done' },
      { name: 'Computer Networks', status: 'active' },
      { name: 'Databases', status: 'active' },
      { name: 'Web Design', status: 'locked' },
    ],
  },
  {
    icon: Brain, tag: 'Professional Cert', title: 'IBM AI Developer Professional',
    school: 'Coursera Plus',
    progress: 65, accent: GOLD,
    modules: [
      { name: 'Python for AI', status: 'done' },
      { name: 'AI Fundamentals', status: 'done' },
      { name: 'Machine Learning', status: 'active' },
      { name: 'Deep Learning', status: 'locked' },
    ],
  },
  {
    icon: Code2, tag: 'Self-Study', title: 'Full Stack Development',
    school: 'Udemy & personal projects',
    progress: 50, accent: '#22c55e',
    modules: [
      { name: 'HTML5 / CSS3', status: 'done' },
      { name: 'JavaScript Basics', status: 'done' },
      { name: 'Python Automation', status: 'active' },
      { name: 'Django Framework', status: 'locked' },
    ],
  },
]

interface Assignment { icon: LucideIcon; title: string; desc: string; module: string }

const ASSIGNMENTS: Assignment[] = [
  {
    icon: Network, title: 'Network Design Proposal',
    desc: 'LAN/WAN design for a fictional company — Computer Networks module deliverable.',
    module: 'NCC · Networks',
  },
  {
    icon: Database, title: 'SQL Database System',
    desc: 'ERD and SQL queries for a Library Management System — Databases module.',
    module: 'NCC · Databases',
  },
]

interface Collection { icon: LucideIcon; title: string; meta: string; desc: string }

const COLLECTIONS: Collection[] = [
  { icon: Landmark, title: 'System Architecture', meta: 'OOSAD · DDOOCP',
    desc: 'Object-oriented analysis, design patterns, and disciplined software architecture.' },
  { icon: BookOpen, title: 'Algorithms & FE', meta: 'Fundamental Engineering',
    desc: 'Data structures, complexity, and the fundamentals behind the IT-passport track.' },
  { icon: Globe2, title: 'Languages', meta: 'Japanese N3+ · English',
    desc: 'Communication across cultures — the bridge from caregiving to engineering.' },
  { icon: Feather, title: 'Web Design Studies', meta: 'HTML · CSS · JS',
    desc: 'University assignments and hand-crafted web designs, including this portfolio.' },
  { icon: ScrollText, title: 'AI Fundamentals', meta: 'ML concepts',
    desc: 'The mathematics and intuition behind modern machine learning.' },
  { icon: GraduationCap, title: 'Coursework Archive', meta: 'Assignments',
    desc: 'A curated collection of university projects, notes, and submissions.' },
]

const STATUS_DOT: Record<ModuleStatus, string> = {
  done: 'bg-emerald-400',
  active: 'bg-amber-400 animate-pulse',
  locked: 'bg-gray-500/60',
}

function CurriculumCard({ item, i }: { item: Curriculum; i: number }) {
  const Icon = item.icon
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="flex flex-col rounded-2xl border p-6 backdrop-blur-md"
      style={{
        borderColor: `${item.accent}44`,
        background: 'linear-gradient(160deg, rgba(28,28,40,0.55), rgba(18,16,22,0.6))',
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: item.accent }}>{item.tag}</p>
          <h3 className="mt-1 text-lg text-[#f3ead6]" style={{ fontFamily: 'Georgia, serif' }}>{item.title}</h3>
          <p className="mt-1 text-xs text-[#cfc4ad]/60">{item.school}</p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ border: `1px solid ${item.accent}55`, color: item.accent }}>
          <Icon size={22} strokeWidth={1.4} />
        </span>
      </div>

      <ul className="mb-5 space-y-2">
        {item.modules.map((m) => (
          <li key={m.name} className="flex items-center gap-2 text-sm text-[#cfc4ad]/80">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[m.status]}`} />
            {m.name}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <div className="mb-1 flex justify-between text-xs text-[#cfc4ad]/70">
          <span>Progress</span>
          <span>{item.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-all" style={{ width: `${item.progress}%`, background: item.accent }} />
        </div>
      </div>
    </motion.article>
  )
}

function VolumeCard({ item, i }: { item: Collection; i: number }) {
  const Icon = item.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border p-7 backdrop-blur-md"
      style={{
        borderColor: 'rgba(200,160,74,0.22)',
        background: 'linear-gradient(160deg, rgba(28,28,40,0.55), rgba(18,16,22,0.6))',
      }}
    >
      <span className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-xl" style={{ border: `1px solid ${GOLD}55`, background: 'rgba(200,160,74,0.08)', color: PARCHMENT }}>
        <Icon size={26} strokeWidth={1.4} />
      </span>
      <p className="mb-1 text-[11px] uppercase tracking-[0.25em]" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>{item.meta}</p>
      <h3 className="mb-2 text-xl text-[#f3ead6]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{item.title}</h3>
      <p className="text-sm leading-relaxed text-[#cfc4ad]/75">{item.desc}</p>
    </motion.div>
  )
}

export default function StudyingLibrary() {
  return (
    <section
      id="studying"
      className="relative overflow-hidden py-16 sm:py-24"
      style={{ background: 'radial-gradient(70% 60% at 50% 0%, rgba(40,30,60,0.5), transparent 70%), #0c0a10' }}
    >
      <div className="pointer-events-none absolute inset-0"
           style={{ background: 'radial-gradient(120% 90% at 50% 120%, rgba(120,80,40,0.10), transparent 60%)' }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>
            Bibliotheca · Studii
          </p>
          <h2 className="mt-3 text-3xl text-[#f3ead6] sm:text-4xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            The Personal Library
          </h2>
          <div className="mx-auto mt-4 h-px w-24" style={{ background: GOLD }} />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#cfc4ad]/70 sm:text-base">
            The “what” in my story — NCC Diploma modules, IBM AI certifications, and self-study that
            followed the path laid out in my{' '}
            <Link to="/bibliography" className="text-[#e8dcc0] underline-offset-2 hover:underline">Bibliography</Link>
            {' '}and applied through{' '}
            <Link to="/python" className="text-[#e8dcc0] underline-offset-2 hover:underline">Python Automation</Link>.
          </p>
        </div>

        {/* Stats bar: 3 equal columns, compressed on xs */}
        <div className="mb-12 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm sm:gap-4 sm:p-6">
          {STATS.map((s) => (
            <div key={s.label} className="min-w-0">
              <p className="text-2xl font-bold text-[#f3ead6] sm:text-3xl" style={{ fontFamily: 'Georgia, serif' }}>{s.value}</p>
              <p className="mt-1 text-[10px] leading-tight text-[#cfc4ad]/60 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <h3 className="mb-5 text-center text-[11px] uppercase tracking-[0.25em] text-[#cfc4ad]/60 sm:mb-6 sm:text-sm">Current curriculum</h3>
        {/* Single col on xs, 2-col on sm, 3-col on lg */}
        <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CURRICULUM.map((c, i) => <CurriculumCard key={c.title} item={c} i={i} />)}
        </div>

        <h3 className="mb-5 text-center text-[11px] uppercase tracking-[0.25em] text-[#cfc4ad]/60 sm:mb-6 sm:text-sm">Reading room shelves</h3>
        <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c, i) => <VolumeCard key={c.title} item={c} i={i} />)}
        </div>

        <h3 className="mb-5 text-center text-[11px] uppercase tracking-[0.25em] text-[#cfc4ad]/60 sm:mb-6 sm:text-sm">Assignment showcase</h3>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {ASSIGNMENTS.map((a) => {
            const Icon = a.icon
            return (
              <div key={a.title} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[#c8a04a] sm:h-12 sm:w-12"
                  style={{ background: 'rgba(200,160,74,0.1)' }}
                >
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-[#c8a04a]/80">{a.module}</p>
                  <h4 className="mt-0.5 text-sm font-semibold text-[#f3ead6] sm:text-base">{a.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#cfc4ad]/70 sm:text-sm">{a.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <JourneyCrosslink current="studying" />
      </div>
    </section>
  )
}
