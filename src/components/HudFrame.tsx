import { useEffect, useState } from 'react'

/**
 * HudFrame — a non-interactive heads-up-display overlay: corner brackets and
 * four small readouts framing the viewport, with a live clock. pointer-events:none
 * so it never blocks the page.
 */
export default function HudFrame() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="hud" aria-hidden="true">
      <i className="c1" /><i className="c2" /><i className="c3" /><i className="c4" />
      <span className="tl">◢ MTN.OS // ONLINE</span>
      <span className="tr">v2.077 · {time}</span>
      <span className="bl">LAT 35.6°N · LON 139.6°E · TOKYO</span>
      <span className="br">● REC</span>
    </div>
  )
}
