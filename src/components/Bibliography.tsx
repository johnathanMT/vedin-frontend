import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  GraduationCap, Building2, PlaneTakeoff, School, AwardIcon, Briefcase, Hotel, Utensils, University,
  type LucideIcon,
} from 'lucide-react'
import JourneyCrosslink from './JourneyCrosslink'

/**
 * Bibliography — a vertical chronological timeline of the journey, whose visual
 * language MORPHS from "Vintage" (sepia, serif, classic icons) at the top to
 * "Cyber-Modern" (neon glow, mono, tech icons) at the present day.
 *
 * Layout strategy:
 *   xs/sm: single-column list, all cards flush left, icon dot on the left edge.
 *   md+:   two-column alternating layout (left/right), icon dot centred on spine.
 */
type Era = 'vintage' | 'transition' | 'cyber'
interface TimelineEntry { year: string; era: Era; icon: LucideIcon; title: string; text: string }

const TIMELINE: TimelineEntry[] = [
  {
    year: '2019, December', era: 'vintage', icon: GraduationCap, title: 'Bachelor of Arts in International Relations',
    text: 'Graduated from Dagon University. Studied International Politics, Diplomacy, Law & Economics.'
  },
  {
    year: '2020, December', era: 'vintage', icon: Building2, title: 'Worked at MPT & KDDI Joint Operations',
    text: 'Worked with resilience during the COVID-19 pandemic, including remote work, before resigning in February 2022.'
  },
  {
    year: '2022, September', era: 'transition', icon: PlaneTakeoff, title: 'Relocated to Japan',
    text: 'A new adventure began. Exciting times ahead...'
  },
  {
    year: '2022, September', era: 'transition', icon: School, title: 'Enrolled at WELL Japanese Language School',
    text: 'Formal studies began — Japanese language, culture, and society.'
  },
  {
    year: '2022, November', era: 'cyber', icon: Hotel, title: 'Part-Time Role at Hotel Monterey Le Frere',
    text: 'Supported hotel operations and learned Japanese work culture firsthand.'
  },
  {
    year: '2023, July', era: 'cyber', icon: Utensils, title: 'Part-Time Role at Tendon Tenya Restaurant Namba',
    text: 'Worked as a cook and food prep in a busy tourist district.'
  },
  {
    year: '2023, July', era: 'cyber', icon: AwardIcon, title: 'Passed JLPT N3, JFT-Basic A2 & Care Worker Evaluation Tests',
    text: 'Fully qualified to commence a professional caregiving career in Japan.'
  },
  {
    year: '2024, May', era: 'cyber', icon: GraduationCap, title: 'Graduated from WELL Japanese Language School',
    text: 'Secured a position as a care worker in a hospital.'
  },
  {
    year: '2024, March', era: 'cyber', icon: Briefcase, title: 'Caregiver at Medical Corporation Shojinkai, Hirashima Hospital',
    text: 'Providing compassionate patient care whilst honing interpersonal and problem-solving skills.'
  },
  {
    year: '2025, May', era: 'cyber', icon: University, title: 'BSc Computer Science Student',
    text: 'Pursuing a Computer Science degree through self-paced online learning (University of Wolverhampton-UK via NCC Education).'
  },
]

interface EraStyle { accent: string; ring: string; card: string; border: string; font: string; filter: string; glow: string }
const ERA: Record<Era, EraStyle> = {
  vintage: {
    accent: '#c8a04a', ring: 'rgba(200,160,74,0.5)',
    card: 'linear-gradient(160deg, rgba(40,34,24,0.6), rgba(24,20,14,0.7))',
    border: 'rgba(200,160,74,0.28)', font: 'Georgia, "Times New Roman", serif',
    filter: 'sepia(0.35) saturate(0.9)', glow: 'none',
  },
  transition: {
    accent: '#9d8bd8', ring: 'rgba(157,139,216,0.55)',
    card: 'linear-gradient(160deg, rgba(34,30,46,0.6), rgba(18,16,26,0.7))',
    border: 'rgba(157,139,216,0.3)', font: 'system-ui, sans-serif',
    filter: 'none', glow: '0 0 18px rgba(157,139,216,0.25)',
  },
  cyber: {
    accent: '#d4af37', ring: 'rgba(212,175,55,0.6)',
    card: 'linear-gradient(160deg, rgba(10,22,30,0.6), rgba(6,12,18,0.72))',
    border: 'rgba(212,175,55,0.32)', font: '"Fira Code", ui-monospace, monospace',
    filter: 'none', glow: '0 0 22px rgba(212,175,55,0.35)',
  },
}

function Entry({ item, i }: { item: TimelineEntry; i: number }) {
  const e = ERA[item.era]
  const Icon = item.icon
  const left = i % 2 === 0

  return (
    <div className="relative flex items-start">
      {/*
        Icon dot:
        • xs/sm: absolute at left edge of the containing column (pl-10 offset on the card)
        • md+:   centred on the timeline spine (left-1/2)
        Width is 36px so the card gets pl-12 (48px) on mobile to avoid overlap.
      */}
      <span
        className={[
          'absolute top-5 z-10 grid h-9 w-9 shrink-0 -translate-x-1/2 place-items-center rounded-full',
          'left-[18px] md:left-1/2',
        ].join(' ')}
        style={{
          background: '#0a0c12',
          border: `2px solid ${e.ring}`,
          boxShadow: e.glow === 'none' ? undefined : e.glow,
          color: e.accent,
        }}
      >
        <Icon size={15} strokeWidth={item.era === 'vintage' ? 1.5 : 2} aria-hidden />
      </span>

      <motion.article
        initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
        /*
          Mobile: full width, left-padded to clear the icon dot (pl-12 = 48px > icon 18+9=27px)
          md+: 44% wide, alternating left/right
        */
        className={[
          'w-full rounded-2xl border p-5 backdrop-blur-md',
          'ml-12',                                               // mobile: card to the right of icon
          'md:ml-0 md:w-[44%] md:p-6',                         // md: constrained width
          left ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8', // md: alternate sides
        ].join(' ')}
        style={{
          background: e.card,
          borderColor: e.border,
          boxShadow:
            e.glow === 'none'
              ? '0 12px 32px rgba(0,0,0,0.4)'
              : `0 12px 32px rgba(0,0,0,0.4), ${e.glow}`,
        }}
      >
        <span
          className="mb-2 inline-block rounded px-2 py-0.5 text-[11px] font-semibold tracking-widest"
          style={{ color: e.accent, border: `1px solid ${e.border}`, fontFamily: e.font, filter: e.filter }}
        >
          {item.year}
        </span>
        <h3 className="mb-1.5 text-base font-semibold leading-snug text-white sm:text-lg" style={{ fontFamily: e.font }}>
          {item.title}
        </h3>
        <p className="text-sm leading-relaxed text-gray-300/80" style={{ filter: e.filter }}>
          {item.text}
        </p>
      </motion.article>
    </div>
  )
}

export default function Bibliography() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="bibliography" className="relative overflow-hidden bg-transparent py-16 sm:py-24">
      <div className="mb-14 px-4 text-center sm:px-6">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-light">// chronology</p>
        <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Bibliography</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          The "where" in my story — from International Relations in Myanmar to caregiving in Osaka,
          and now a BSc in Computer Science. This timeline connects to what I study in{' '}
          <Link to="/studying" className="text-accent-light underline-offset-2 hover:underline">Personal Studying</Link>
          {' '}and the scripts I build in{' '}
          <Link to="/python" className="text-accent-light underline-offset-2 hover:underline">Python Automation</Link>.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Static grey spine */}
        <div className="absolute left-[18px] top-0 h-full w-px -translate-x-1/2 bg-white/10 md:left-1/2" aria-hidden />

        {/* Animated coloured fill that travels down on scroll */}
        <motion.div
          aria-hidden
          className="absolute left-[18px] top-0 w-px -translate-x-1/2 origin-top md:left-1/2"
          style={{
            scaleY: lineScale,
            height: '100%',
            background: 'linear-gradient(180deg, #c8a04a 0%, #9d8bd8 45%, #d4af37 100%)',
            boxShadow: '0 0 14px rgba(212,175,55,0.4)',
          }}
        />

        <div className="space-y-10 sm:space-y-14">
          {TIMELINE.map((item, i) => <Entry key={i} item={item} i={i} />)}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <JourneyCrosslink current="bibliography" />
      </div>
    </section>
  )
}
