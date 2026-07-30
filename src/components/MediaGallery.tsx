import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { ASSETS } from '../config/assets'

/**
 * MediaGallery — renders an article's media:
 *   - a video (HTML5 player) if a video item is present, or
 *   - a swipeable image carousel (with dots) for multiple images, or
 *   - a single image.
 */
export interface MediaItem { type: 'image' | 'video'; url: string; poster?: string }

interface MediaGalleryProps {
  media?: MediaItem[]
  images?: string[]
  videoUrl?: string
  alt?: string
  className?: string
}

export default function MediaGallery({ media, images, videoUrl, alt = '', className = '' }: MediaGalleryProps) {
  // Normalise inputs into a single media array
  const items: MediaItem[] = media ?? [
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
    ...(images || []).map((url): MediaItem => ({ type: 'image', url })),
  ]

  const [index, setIndex] = useState(0)
  const fallback = ASSETS.fallback

  if (items.length === 0) {
    return (
      <div className={`relative aspect-video w-full overflow-hidden bg-card ${className}`}>
        <img src={fallback} alt={alt} className="h-full w-full object-cover" />
      </div>
    )
  }

  const current = items[index]
  const go = (dir: number) => setIndex((i) => (i + dir + items.length) % items.length)

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
      {current.type === 'video' ? (
        <video
          src={current.url}
          poster={current.poster}
          controls
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={current.url}
          alt={alt}
          loading="lazy" decoding="async"
          onError={(e) => { e.currentTarget.src = fallback }}
          className="h-full w-full object-cover transition-transform duration-700"
        />
      )}

      {/* Carousel controls (only when there's more than one item) */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur transition-colors hover:bg-accent/80"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur transition-colors hover:bg-accent/80"
          >
            <ChevronRight size={18} />
          </button>

          {/* dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to item ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-accent-light' : 'w-1.5 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>

          {/* count badge */}
          <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
            {current.type === 'video' ? <Play size={11} className="mr-1 inline" /> : null}
            {index + 1}/{items.length}
          </span>
        </>
      )}
    </div>
  )
}
