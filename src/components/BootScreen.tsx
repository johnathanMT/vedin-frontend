import { useEffect, useRef, useState } from 'react'

/**
 * BootScreen — a "System Booting…" hacker overlay shown once per browser session
 * before the site reveals. Types a boot log, fills a progress bar, then fades.
 * Skippable, and near-instant for prefers-reduced-motion.
 */
const LINES = [
  '> initializing MyoThantNaing.Operation System kernel ...........',
  '> ငုပ်မိသဲတိုင် တက်နိုင်ဖျားရောက်: . . . .',
  '> 改善 (Kaizen) , 七転び八起き...: initiating continuous_improvement_protocol ....... [OK]',
  '> contacting → ai@myothant.dev ...... [OK]',
  '>      ▲ ▲ ▲  ',
  '>     / O O \\   ',
  '>     \\ \\_/ /  ',
  '>      -----     ',
  '> WELCOME, OPERATOR.',
]

export default function BootScreen() {
  const [show, setShow] = useState<boolean>(() => {
    try { return sessionStorage.getItem('mtn_booted') !== '1' } catch { return true }
  })
  const [done, setDone] = useState(false)
  const [text, setText] = useState('')
  const bar = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!show) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    const full = LINES.join('\n')
    let n = 0
    let typeT: ReturnType<typeof setTimeout> | undefined
    let endT: ReturnType<typeof setTimeout> | undefined

    const finish = () => {
      endT = setTimeout(() => {
        try { sessionStorage.setItem('mtn_booted', '1') } catch { /* ignore */ }
        setDone(true)
        setTimeout(() => setShow(false), 650)   // unmount after fade
      }, reduce ? 150 : 550)
    }

    if (reduce) { setText(full); finish() }
    else {
      const tick = () => {
        setText(full.slice(0, n)); n++
        if (n <= full.length) typeT = setTimeout(tick, 11)
        else finish()
      }
      tick()
    }

    // progress bar
    requestAnimationFrame(() => {
      if (bar.current) {
        bar.current.style.transition = `width ${reduce ? 0.3 : 2.2}s ease`
        bar.current.style.width = '100%'
      }
    })

    return () => { clearTimeout(typeT); clearTimeout(endT) }
  }, [show])

  if (!show) return null

  const skip = () => {
    try { sessionStorage.setItem('mtn_booted', '1') } catch { /* ignore */ }
    setDone(true); setTimeout(() => setShow(false), 650)
  }

  return (
    <div className={`boot-screen ${done ? 'done' : ''}`} role="status" aria-live="polite">
      <div className="boot-title">MTN.OS</div>
      <pre className="boot-log">{text}<span className="term-cursor" /></pre>
      <div className="boot-bar"><i ref={bar} /></div>
      <button className="boot-skip" onClick={skip}>SKIP ▸</button>
    </div>
  )
}
