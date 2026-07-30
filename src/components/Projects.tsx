import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/content'

interface SectionText { title: string; sub: string }
const T: Record<string, SectionText> = {
  en: { title: 'My Projects', sub: 'Things I\'ve built and continue to build.' },
  mm: { title: 'ကျွန်တော်၏ ပရောဂျက်များ', sub: 'တည်ဆောက်ထားသောနှင့် တည်ဆောက်ဆဲ ပရောဂျက်များ' },
  jp: { title: '私のプロジェクト',              sub: '作ったものと作り続けているもの。' },
  vn: { title: 'Dự án của tôi',             sub: 'Những gì tôi đã và đang xây dựng.' },
  ne: { title: 'मेरा परियोजनाहरू',          sub: 'मैले बनाएका र बनाउँदै गरेका कुराहरू।' },
  id: { title: 'Proyek Saya',               sub: 'Hal-hal yang telah dan sedang saya bangun.' },
}

// Mirrors a PROJECTS entry (src/data/content is still JS).
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

function ProjectLink({
  project,
  className,
  children,
}: {
  project: Project
  className: string
  children: ReactNode
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
  return <a href={project.url} className={className}>{children}</a>
}

export default function Projects({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en
  const sectionRef = useRef<HTMLElement>(null)
  const projects = PROJECTS as Project[]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 },
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="projects" ref={sectionRef} className="relative py-24 border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-space pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="reveal mb-14">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">Work</p>
          <h2 className="section-title">{t.title}</h2>
          <p className="section-subtitle">{t.sub}</p>
        </div>

        {/* Featured project */}
        {projects.filter((p) => p.featured).map((project) => (
          <div key={project.id} className="reveal mb-6">
            <ProjectLink
              project={project}
              className="block group rounded-2xl border border-white/10 bg-card hover:border-accent/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl flex-shrink-0"
                  style={{ background: `${project.color}15`, border: `1px solid ${project.color}30` }}>
                  <i className={`${project.icon} text-2xl`} style={{ color: project.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent-light">Featured</span>
                    {project.ext && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-muted">External</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accent-light transition-colors">{project.title}</h3>
                  <p className="text-muted text-sm">{project.desc}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="flex items-center gap-2 text-sm text-muted group-hover:text-accent-light transition-colors">
                    Visit <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </ProjectLink>
          </div>
        ))}

        {/* Grid of other projects */}
        <div className="reveal grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {projects.filter((p) => !p.featured).map((project) => (
            <ProjectLink
              key={project.id}
              project={project}
              className="group glass-card p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${project.color}15`, border: `1px solid ${project.color}25` }}
                >
                  <i className={`${project.icon} text-lg`} style={{ color: project.color }} />
                </div>
                <i className="fas fa-arrow-up-right-from-square text-muted group-hover:text-accent-light text-xs opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1 group-hover:text-accent-light transition-colors">{project.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{project.desc}</p>
              </div>
            </ProjectLink>
          ))}
        </div>
      </div>
    </section>
  )
}
