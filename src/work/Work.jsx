import { useEffect, useRef } from 'react'
import { projects } from './projects'
import './work.css'

// instant: skip the reveal (coming back from a detail page lands here mid-morph)
export default function Work({ id, instant = false }) {
  const gridRef = useRef(null)

  // Section header and cards rise in as they enter the viewport, cards staggered per column.
  useEffect(() => {
    if (instant) return
    const grid = gridRef.current
    const items = [grid.previousElementSibling, ...grid.children] // section header + cards
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const i = items.indexOf(e.target) - 1 // -1 = header
          e.target.style.transitionDelay = i < 0 ? '0ms' : `${(i % 3) * 110}ms`
          e.target.classList.remove('is-pending')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((el) => {
      el.classList.add('is-pending')
      io.observe(el)
    })
    return () => {
      io.disconnect()
      items.forEach((el) => el.classList.remove('is-pending'))
    }
  }, [instant])

  return (
    <section className="work" id={id} aria-labelledby="work-title">
      <header className="work__head">
        <p className="work__eyebrow">Portfolio</p>
        <h2 className="work__title" id="work-title">
          Selected <em>Work</em>
        </h2>
      </header>

      <ul className="work__grid" ref={gridRef}>
        {projects.map((p, i) => {
          const href = p.slug ? `#/project/${p.slug}` : p.link
          const Card = href ? 'a' : 'div'
          const num = String(i + 1).padStart(2, '0')
          return (
            <li key={i}>
              <Card className="work-card" {...(href && { href })} {...(!p.slug && p.link && { target: '_blank', rel: 'noreferrer' })}>
                {/* shared view-transition name morphs this image into the detail hero */}
                <div className="work-card__media" style={p.slug ? { viewTransitionName: `work-${p.slug}` } : undefined}>
                  {p.image ? (
                    <img src={p.image} alt={p.title} loading="lazy" />
                  ) : (
                    <span className="work-card__placeholder" aria-hidden="true">{num}</span>
                  )}
                </div>
                <div className="work-card__body">
                  <div className="work-card__meta">
                    <span>{num}</span>
                    <span>{p.category}</span>
                  </div>
                  <h3 className="work-card__title">{p.title}</h3>
                  <p className="work-card__desc">{p.description}</p>
                  <ul className="work-card__tags">
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
