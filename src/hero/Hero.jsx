import { useEffect, useRef } from 'react'
import { Hand } from 'lucide-react'
import { createCharacterPlayer } from './characterPlayer'
import './hero.css'

const frameSrc = (i) => `${import.meta.env.BASE_URL}frames/f${String(i).padStart(3, '0')}.webp`
const ZONES = ['left', 'center', 'right']

export default function Hero() {
  const heroRef = useRef(null)
  const canvasRef = useRef(null)
  const waveRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)')

    // frame-loading progress is broadcast for the loading screen (a sibling component)
    const onProgress = (p) => dispatchEvent(new CustomEvent('hero:progress', { detail: p }))
    const player = createCharacterPlayer({ canvas, src: frameSrc, reducedMotion: reduced, onProgress })

    // Cursor only picks a zone; the character never follows it. The center zone itself does nothing.
    let zone = null
    const onMove = (e) => {
      if (!desktop.matches) return
      const r = hero.getBoundingClientRect()
      const z = ZONES[Math.min(2, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * 3)))]
      if (z === zone) return
      zone = z
      if (z !== 'center') player.trigger(z)
    }
    const onLeave = () => (zone = null)

    // Hovering the character shows a "인사하기" label beside the cursor; clicking starts the greeting.
    const wave = waveRef.current
    const onCharMove = (e) => {
      if (!desktop.matches) return
      const r = hero.getBoundingClientRect()
      wave.style.transform = `translate(${e.clientX - r.left + 18}px, ${e.clientY - r.top + 18}px)` // direct DOM: no re-render
      wave.classList.add('is-on')
    }
    const onCharLeave = () => wave.classList.remove('is-on')
    const onCharClick = () => desktop.matches && player.trigger('center')
    const onCharKey = (e) => e.key === 'Enter' && player.trigger('center')

    // Touch / small screens: center experience only — tap to greet.
    const onTap = () => !desktop.matches && player.trigger('center')

    // Scroll-out parallax: publish how far the hero has scrolled away (0..1) as a CSS variable.
    let scrollRaf = 0
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf)
      scrollRaf = requestAnimationFrame(() =>
        hero.style.setProperty('--sp', Math.min(1, Math.max(0, scrollY / hero.offsetHeight)).toFixed(3)),
      )
    }
    if (!reduced) {
      onScroll()
      addEventListener('scroll', onScroll, { passive: true })
    }

    hero.addEventListener('pointermove', onMove)
    hero.addEventListener('pointerleave', onLeave)
    hero.addEventListener('click', onTap)
    canvas.addEventListener('pointermove', onCharMove)
    canvas.addEventListener('pointerleave', onCharLeave)
    canvas.addEventListener('click', onCharClick)
    canvas.addEventListener('keydown', onCharKey)
    return () => {
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      hero.removeEventListener('click', onTap)
      canvas.removeEventListener('pointermove', onCharMove)
      canvas.removeEventListener('pointerleave', onCharLeave)
      canvas.removeEventListener('click', onCharClick)
      canvas.removeEventListener('keydown', onCharKey)
      cancelAnimationFrame(scrollRaf)
      removeEventListener('scroll', onScroll)
      player.destroy()
    }
  }, [])

  return (
    <section className="hero" ref={heroRef} aria-label="Introduction">
      <div className="hero__intro">
        <h1 className="hero__title">
          <span className="hero__tagline">복잡한 기술도, 더 명확한 경험으로.</span>
          <span className="hero__greet">Clarity Over Complexity</span>
          <span className="hero__role">UI / UX DESIGNER</span>
        </h1>
        <p className="hero__hint">
          <span className="hero__cursor" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M5 3l14 7.2-6.1 1.7L10.2 18z" fill="currentColor" />
            </svg>
          </span>
          <span className="hero__hint-desktop">Move cursor to call me !</span>
          <span className="hero__hint-touch">Tap to call me !</span>
        </p>
      </div>

      <div className="hero__stage">
        <canvas
          ref={canvasRef}
          className="hero__character"
          width="720"
          height="640"
          role="button"
          tabIndex={0}
          aria-label="캐릭터에게 인사하기"
        />
      </div>
      <span className="hero__wave" ref={waveRef} aria-hidden="true">
        <Hand size={15} strokeWidth={2} /> 인사하기
      </span>
    </section>
  )
}
