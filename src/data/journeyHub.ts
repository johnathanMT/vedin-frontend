import { BookOpen, BookMarked, Code2, type LucideIcon } from 'lucide-react'

/** The three connected “From Caring to Coding” sub-pages. */
export type JourneyPage = 'python' | 'studying' | 'bibliography'

export interface JourneyHubItem {
  id: JourneyPage
  path: `/${JourneyPage}`
  label: string
  short: string
  icon: LucideIcon
  accent: string
  blurb: string
}

export const JOURNEY_HUB: JourneyHubItem[] = [
  {
    id: 'bibliography',
    path: '/bibliography',
    label: 'Bibliography',
    short: 'Journey',
    icon: BookMarked,
    accent: '#06b6d4',
    blurb: 'Where I came from — a year-by-year chronology from Myanmar to Japan, caregiving to Computer Science.',
  },
  {
    id: 'studying',
    path: '/studying',
    label: 'Personal Studying',
    short: 'Studying',
    icon: BookOpen,
    accent: '#a855f7',
    blurb: 'What I am learning now — NCC Diploma modules, IBM AI certifications, and university coursework.',
  },
  {
    id: 'python',
    path: '/python',
    label: 'Python Automation',
    short: 'Python',
    icon: Code2,
    accent: '#22ff88',
    blurb: 'How I apply it — scripts that automate care reports, shift schedules, and daily workflows in Japan.',
  },
]

export const JOURNEY_INTRO =
  'Three chapters of one story: the timeline that brought me here, the curriculum I am building, and the Python tools I write to bridge healthcare and engineering.'
