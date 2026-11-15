import { useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import './totop.css'

// Floating "back to top" button; shows once the hero has mostly scrolled away.
export default function ToTop() {
  const ref = useRef(null)

  useEffect(() => {
    const btn = ref.current
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => btn.classList.toggle('is-on', scrollY > innerHeight * 0.6)) // class toggle: no re-render
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', onScroll)
    }
  }, [])

  const toTop = () => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <button type="button" className="to-top" ref={ref} onClick={toTop} aria-label="맨 위로">
      <ArrowUp size={18} strokeWidth={1.8} />
    </button>
  )
}
