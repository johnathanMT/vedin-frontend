import { MapPin, Heart, Code2, Quote, type LucideIcon } from 'lucide-react'

/**
 * AboutMe — homepage "My Story" section. Image-led card (image_1-inspired)
 * pairing the Wat Arun trip photo with the caregiver → coder narrative.
 *
 * Drop your photo at: public/Myweb_photo/wat-arun.jpg
 */
interface Stat { icon: LucideIcon; label: string; value: string }
const STATS: Stat[] = [
  { icon: Heart, label: 'Caregiving', value: 'Kaigo' },
  { icon: Code2, label: 'Building', value: 'Full-Stack' },
  { icon: MapPin, label: 'Based in', value: 'Japan 🇯🇵' },
]

export default function AboutMe({ photo = '/Myweb_photo/wat-arun.jpg' }: { photo?: string }) {
  return (
    <section id="about" className="relative bg-transparent py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent-light">// my story</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            From <span className="accent-gradient">Caregiver</span> to <span className="text-coral">Coder</span>
          </h2>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          {/* Photo card */}
          <div className="group relative overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl shadow-black/40">
            <img
              src={photo}
              alt="Myo Thant Naing — Wat Arun, Bangkok"
              loading="lazy" decoding="async"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1000&q=80' }}
              className="h-full min-h-[22rem] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <MapPin size={13} /> Wat Arun, Bangkok
              </span>
            </div>
          </div>

          {/* Story card */}
          <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-card p-8 sm:p-10">
            <Quote className="mb-4 text-accent-light/60" size={32} />
            <p className="text-lg leading-relaxed text-gray-300">
              I began my journey in <span className="text-white">healthcare as a caregiver (Kaigo)</span> in Japan —
              work that taught me patience, resilience, and a deep attention to people's needs.
              Those same instincts now drive how I build software.
            </p>
            <p className="mt-4 leading-relaxed text-gray-400">
              Today I'm an <span className="text-accent-light">Computer Science student</span> and aspiring
              <span className="text-accent-light"> AI Engineer</span>, teaching myself to ship real,
              full-stack products — from a React front end to a .NET API and a cloud database.
              <span className="italic text-coral"> Better late than never.</span>
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
                  <Icon className="mx-auto mb-2 text-accent-light" size={20} />
                  <p className="text-xs text-muted">{label}</p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
