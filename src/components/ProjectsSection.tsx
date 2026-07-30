import { Link } from 'react-router-dom'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { PROJECTS } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'

interface SectionText { title: string; sub: string }
const T: Record<string, SectionText> = {
  en: { title: 'My Projects', sub: "Things I've built and continue to build." },
  mm: { title: 'ကျွန်တော်၏ ပရောဂျက်များ', sub: 'တည်ဆောက်ထားသောနှင့် တည်ဆောက်ဆဲ ပရောဂျက်များ' },
  jp: { title: '私のプロジェクト', sub: '作ったものと作り続けているもの。' },
  vn: { title: 'Dự án của tôi', sub: 'Những gì tôi đã và đang xây dựng.' },
  ne: { title: 'मेरा परियोजनाहरू', sub: 'मैले बनाएका र बनाउँदै गरेका कुराहरू।' },
  id: { title: 'Proyek Saya', sub: 'Hal-hal yang telah dan sedang saya bangun.' },
  zh: { title: '我的项目', sub: '我已构建并持续打造的作品。' },
}

interface Project {
  id: string
  title: string
  desc: string
  icon: string
  color: string
  url: string
  ext: boolean
  featured?: boolean
}

/**
 * Resolve the correct link element for a project entry.
 *
 * Routing rules:
 *  • ext: true  → <a target="_blank"> (external site)
 *  • url starts with '/'  → React Router <Link> (internal SPA route)
 *  • anything else → plain <a> (should not occur with current data)
 *
 * Crucially, SITE.asset() paths like '/Myweb/foo.html' also start with '/'
 * but are NOT React routes — they're static files.  All project URLs in
 * content.js have been migrated to either a React route ('/python', '/github', …)
 * or marked ext:true, so this resolver is now unambiguous.
 */
function ProjectLink({
  project,
  className,
  children,
}: {
  project: Project
  className: string
  children: React.ReactNode
}) {
  if (project.ext) {
    return (
      <a href={project.url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  if (project.url.startsWith('/')) {
    return <Link to={project.url} className={className}>{children}</Link>
  }
  // Fallback: treat as external anchor (legacy safety net)
  return <a href={project.url} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
}

/**
 * ProjectLogo — a floating icon tile that shows:
 *   • Coloured icon with soft glow halo
 *   • Featured dot badge
 *   • Title + short description
 *   • A subtle arrow/external indicator so the user knows what clicking does
 */
function ProjectLogo({ project }: { project: Project }) {
  const c = project.color
  const isExternal = project.ext
  const tileClass =
    'group relative flex flex-col items-center gap-4 rounded-3xl p-5 text-center outline-none ' +
    'transition-all duration-300 hover:-translate-y-2 focus-visible:ring-2 focus-visible:ring-white/30 ' +
    'hover:bg-white/[0.04]'

  return (
    <ProjectLink project={project} className={tileClass}>
      {/* Icon orb */}
      <span className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
        <span
          className="absolute inset-0 rounded-full opacity-50 blur-2xl transition-all duration-300 group-hover:scale-110 group-hover:opacity-90"
          style={{ background: `radial-gradient(circle, ${c}77 0%, transparent 70%)` }}
        />
        <span className="absolute inset-2 rounded-full bg-white/[0.05] backdrop-blur-md" />
        <i
          className={`${project.icon} relative text-5xl transition-transform duration-300 group-hover:scale-110 sm:text-6xl`}
          style={{ color: c, filter: `drop-shadow(0 0 14px ${c}bb)` }}
          aria-hidden
        />
        {project.featured && (
          <span
            className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full"
            style={{ background: c, boxShadow: `0 0 10px ${c}` }}
            title="Featured"
          />
        )}
      </span>

      {/* Title + desc */}
      <div>
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="text-base font-bold text-white transition-colors group-hover:text-accent-light sm:text-lg">
            {project.title}
          </h3>
          {/* Micro arrow: ↗ for external, → for internal */}
          {isExternal
            ? <ExternalLink size={12} className="shrink-0 text-white/30 transition-colors group-hover:text-accent-light" />
            : <ArrowRight size={12} className="shrink-0 text-white/30 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-accent-light" />
          }
        </div>
        <p className="mx-auto mt-1.5 max-w-[20ch] text-xs leading-relaxed text-gray-500 sm:max-w-[22ch] sm:text-sm">
          {project.desc}
        </p>
      </div>
    </ProjectLink>
  )
}

export default function ProjectsSection({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()

  return (
    <section id="projects" ref={ref} className="relative overflow-hidden py-24 text-legible">
      <div className="pointer-events-none absolute -top-10 right-10 h-72 w-72 rounded-full bg-purple-700/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div data-reveal className="mb-12 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent-light">// work</p>
          <h2 className="glow-heading mt-2 text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-2 text-gray-300">{t.sub}</p>
        </div>

        <div
          data-reveal
          className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.045] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-10"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {PROJECTS.map((p) => <ProjectLogo key={p.id} project={p} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
