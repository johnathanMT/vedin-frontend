import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Lightbox — shared full-resolution image overlay (used by GallerySection and
 * GalleryPage). Dumb/presentational: the caller resolves caption/alt and passes
 * a plain item, so this component knows nothing about i18n or the glob.
 *
 * Behavior: scale-in/fade-in via AnimatePresence, dark blurred backdrop,
 * close button, click-outside, and Escape. Locks body scroll while open.
 */
export interface LightboxItem {
  url: string
  caption?: string
  alt?: string
}

interface LightboxProps {
  item: LightboxItem | null   // null = closed
  onClose: () => void
}

export default function Lightbox({ item, onClose }: LightboxProps) {
  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [item, onClose])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}                 // click backdrop → close
          role="dialog"
          aria-modal="true"
          aria-label={item.caption || 'Image'}
        >
          <motion.figure
            className="relative w-full max-w-4xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}  // clicks on the image don't close
          >
            {/* padded, bordered frame → moderate, gallery-like presentation */}
            <div className="rounded-2xl border border-white/10 bg-surface/40 p-2 shadow-2xl backdrop-blur-sm sm:p-3">
              <img
                src={item.url}
                alt={item.alt}
                className="mx-auto max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
            {item.caption && (
              <figcaption className="mt-3 text-center font-mono text-sm text-accent-light">
                {item.caption}
              </figcaption>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent-light sm:-right-4 sm:-top-4"
            >
              <X size={18} />
            </button>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
