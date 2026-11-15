import { useEffect, useState } from 'react'
import './loader.css'

const MIN_SHOW_MS = 900 // avoid a flash on fast connections
const MAX_WAIT_MS = 10000 // never trap the visitor behind a stalled download
const EXIT_MS = 700

// First-visit loading screen. On the home page it tracks the hero's character frames;
// on a detail page there is nothing heavy to wait for, so it only shows briefly.
export default function Loader({ waitForHero }) {
  const [progress, setProgress] = useState(waitForHero ? 0 : 1)
  const [minElapsed, setMinElapsed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [gone, setGone] = useState(false)
  const leaving = minElapsed && (progress >= 1 || timedOut)

  useEffect(() => {
    const onProgress = (e) => setProgress(e.detail)
    addEventListener('hero:progress', onProgress)
    const t1 = setTimeout(() => setMinElapsed(true), MIN_SHOW_MS)
    const t2 = setTimeout(() => setTimedOut(true), MAX_WAIT_MS)
    return () => {
      removeEventListener('hero:progress', onProgress)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  useEffect(() => {
    if (!leaving) return
    document.documentElement.classList.add('is-ready') // starts the page's entrance animations (CSS)
    const t = setTimeout(() => setGone(true), EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving])

  // lock scrolling while the screen covers the page
  useEffect(() => {
    if (gone) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    return () => (html.style.overflow = prev)
  }, [gone])

  if (gone) return null
  const pct = Math.round((timedOut ? 1 : progress) * 100)

  return (
    <div className={`loader${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite" aria-label={`로딩 중 ${pct}%`}>
      <div className="loader__inner">
        <img className="loader__logo" src={`${import.meta.env.BASE_URL}logo-eun.png`} alt="eun" draggable="false" />
        <p className="loader__text">복잡한 기술도, 더 명확한 경험으로.</p>
        <div className="loader__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <span className="loader__pct" aria-hidden="true">{String(pct).padStart(3, '0')}%</span>
      </div>
    </div>
  )
}
