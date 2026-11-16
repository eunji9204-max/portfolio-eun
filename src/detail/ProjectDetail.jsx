import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Eye, EyeOff, House, Moon, Sun } from 'lucide-react'
import { PROJECT_DETAILS } from './details'
import './detail.css'

const ORDER = Object.keys(PROJECT_DETAILS)
const pad = (n) => String(n).padStart(2, '0')
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ProjectDetail({ slug }) {
  const d = PROJECT_DETAILS[slug]
  const rootRef = useRef(null)
  const progressRef = useRef(null)
  const heroImgRef = useRef(null)
  const [toast, setToast] = useState('')

  // Reveal-on-scroll for every [data-reveal] element, plus scroll progress and a light hero parallax.
  useEffect(() => {
    const root = rootRef.current
    const items = root.querySelectorAll('[data-reveal]')
    if (reducedMotion()) {
      items.forEach((el) => el.classList.add('is-in'))
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    items.forEach((el) => io.observe(el))

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight
        progressRef.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`
        if (!reducedMotion() && heroImgRef.current) heroImgRef.current.style.translate = `0 ${Math.min(scrollY, 900) * -0.06}px`
      })
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      removeEventListener('scroll', onScroll)
    }
  }, [])

  const toastTimer = useRef(0)
  const copy = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex)
      setToast(`${hex} 복사됨`)
    } catch {
      setToast('복사할 수 없는 환경이에요')
    }
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1600)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  if (!d) {
    return (
      <main className="detail detail--missing">
        <p>프로젝트를 찾을 수 없어요.</p>
        <a href="#work" className="detail__back"><ArrowLeft size={16} /> All Work</a>
      </main>
    )
  }

  const nextSlug = d.next || ORDER[0]
  const next = PROJECT_DETAILS[nextSlug]
  const prevSlug = ORDER[(ORDER.indexOf(slug) - 1 + ORDER.length) % ORDER.length]
  const prev = PROJECT_DETAILS[prevSlug]
  const no = (n) => pad(d.screens ? n + 1 : n) // optional "More Screens" section shifts the numbering
  const theme = { '--p': d.theme.p, '--deep': d.theme.deep, '--bright': d.theme.bright, '--tint': d.theme.tint }

  return (
    <main className="detail" style={theme} ref={rootRef}>
      <div className="detail__progress" ref={progressRef} aria-hidden="true" />

      {/* ---- hero ---- */}
      <header className="detail-hero">
        <a href="#work" className="detail__back"><ArrowLeft size={16} /> All Work</a>
        <p className="detail-hero__eyebrow" data-reveal>
          <span>{d.no} / {pad(ORDER.length)}</span>
          {d.category}
        </p>
        <h1 className="detail-hero__title">
          {d.title.map((line, i) => (
            <span className="detail-hero__line" data-reveal key={line} style={{ '--i': i }}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <p className="detail-hero__lead" data-reveal>{d.lead}</p>
        {/* no data-reveal here: the image is the view-transition target and must stay visible */}
        <div className="detail-hero__visual" style={{ background: d.heroGradient }}>
          <div className="detail-hero__copy" data-reveal style={{ '--i': 3 }}>
            <span>{d.heroCopy.label}</span>
            <p>{d.heroCopy.text.map((t) => <span key={t}>{t}</span>)}</p>
          </div>
          <img ref={heroImgRef} src={d.image} alt={`${d.title.join(' ')} 메인 화면`} style={{ viewTransitionName: `work-${slug}` }} />
        </div>
        <dl className="detail-hero__meta" data-reveal>
          {d.meta.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <Section no="01" en="Overview" ko="프로젝트 개요">
        <Overview d={d} />
      </Section>

      <Section no="02" en="Key Screen" ko={d.mockup.title} desc={d.mockup.desc}>
        <Mockup d={d} />
      </Section>

      {d.screens && (
        <Section no="03" en="More Screens" ko={d.screens.title} desc={d.screens.desc}>
          <Screens items={d.screens.items} />
        </Section>
      )}

      <Section no={no(3)} en="Color System" ko="컬러 시스템" desc="스와치를 누르면 HEX 코드가 복사됩니다.">
        <Colors c={d.colors} onCopy={copy} />
      </Section>

      <Section no={no(4)} en="Typography" ko="타이포그래피">
        <ul className="type-list">
          {d.type.map((t) => (
            <li key={t.name} data-reveal>
              <div className="type-list__spec">
                <strong>{t.name}</strong>
                <span>{t.spec}</span>
              </div>
              <p style={t.style}>{t.sample}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section no={no(5)} en="Components" ko="UI 컴포넌트">
        <Components c={d.components} />
      </Section>

      <a href={`#/project/${nextSlug}`} className="detail-next" data-reveal>
        <span className="detail-next__text">
          <span className="detail-next__label">{d.next ? 'Next Project' : 'Back to First'}</span>
          <span className="detail-next__title">
            {next.title.join(' ')} <ArrowUpRight size={20} strokeWidth={1.8} />
          </span>
        </span>
        <span className="detail-next__img"><img src={next.image} alt="" loading="lazy" /></span>
      </a>

      <nav className="detail-rail" aria-label="프로젝트 이동">
        <a href="#top" data-tip="메인으로" aria-label="메인으로"><House size={18} strokeWidth={1.8} /></a>
        <a href={`#/project/${prevSlug}`} data-tip={`이전 · ${prev.title.join(' ')}`} aria-label={`이전 프로젝트: ${prev.title.join(' ')}`}>
          <ArrowLeft size={18} strokeWidth={1.8} />
        </a>
        <a href={`#/project/${nextSlug}`} data-tip={`다음 · ${next.title.join(' ')}`} aria-label={`다음 프로젝트: ${next.title.join(' ')}`}>
          <ArrowRight size={18} strokeWidth={1.8} />
        </a>
      </nav>

      <p className={`detail-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        {toast && <><Check size={14} /> {toast}</>}
      </p>
    </main>
  )
}

function Section({ no, en, ko, desc, children }) {
  return (
    <section className="detail-section">
      <header className="detail-section__head" data-reveal>
        <span className="detail-section__no">{no}</span>
        <p className="detail-section__en">{en}</p>
        <h2>{ko}</h2>
        {desc && <p className="detail-section__desc">{desc}</p>}
      </header>
      {children}
    </section>
  )
}

// Extra screens: web pages in a browser frame, phone screens in a scrollable phone frame.
// Two or more web pages share one frame and switch with tabs.
function Screens({ items }) {
  const [tab, setTab] = useState(0)
  const web = items.filter((s) => !s.mobile)
  const tabbed = web.length > 1
  const shown = tabbed ? [web[tab], ...items.filter((s) => s.mobile)] : items
  return (
    <>
      {tabbed && (
        <div className="comp-tabs screens__tabs" role="tablist" style={{ '--n': web.length, '--t': tab, '--r': '999px' }} data-reveal>
          <span className="comp-tabs__ink" aria-hidden="true" />
          {web.map((s, i) => (
            <button key={s.title} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)}>{s.title}</button>
          ))}
        </div>
      )}
      <ul className="screens">
        {shown.map((s, i) => (
          <li key={tabbed && i === 0 ? 'web' : s.title} className={s.mobile ? 'screens__item screens__item--mobile' : 'screens__item'} data-reveal>
            <div className={s.mobile ? 'screens__phone' : 'mockup__frame'}>
              {!s.mobile && <div className="mockup__bar" aria-hidden="true"><i /><i /><i /></div>}
              <div className="screens__scroll" tabIndex={s.mobile ? 0 : undefined} aria-label={s.mobile ? `${s.title} (스크롤)` : undefined}>
                <img src={s.src} alt={s.title} loading="lazy" />
              </div>
            </div>
            <p className="screens__cap"><strong>{s.title}</strong> {s.desc}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

function Overview({ d }) {
  const { cards, point, features } = d.overview
  return (
    <>
      <div className="ov-cards">
        {cards.map((c, i) => (
          <article key={c.tag} className="ov-card" data-reveal style={{ '--i': i }}>
            <span className="ov-card__tag">{pad(i + 1)} · {c.tag}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </article>
        ))}
      </div>
      <blockquote className="ov-point" data-reveal>
        <p className="ov-point__title">{point.title.map((t) => <span key={t}>{t}</span>)}</p>
        <p className="ov-point__body">{point.body}</p>
      </blockquote>
      <ul className="ov-features">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <li key={title} data-reveal style={{ '--i': i }}>
            <span className="ov-features__icon"><Icon size={20} strokeWidth={1.8} /></span>
            <h3>{title}</h3>
            <p>{desc}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

// Screenshot with numbered hotspots; a gentle auto-tour runs until the visitor takes over.
function Mockup({ d }) {
  const [active, setActive] = useState(0)
  const [pins, setPins] = useState(true)
  const [touched, setTouched] = useState(false)
  const [dark, setDark] = useState(false) // only used when the project ships a dark-mode screenshot
  const frameRef = useRef(null)

  useEffect(() => {
    if (touched || !pins || reducedMotion()) return
    let timer = 0
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer)
      if (e.isIntersecting) timer = setInterval(() => setActive((a) => (a + 1) % d.hotspots.length), 3200)
    }, { threshold: 0.5 })
    io.observe(frameRef.current)
    return () => {
      io.disconnect()
      clearInterval(timer)
    }
  }, [touched, pins, d.hotspots.length])

  const pick = (i) => {
    setTouched(true)
    setActive(i)
  }

  return (
    <div className="mockup">
      <div className="mockup__frame" ref={frameRef} data-reveal>
        <div className="mockup__bar" aria-hidden="true"><i /><i /><i /></div>
        <div className="mockup__screen">
          <img src={dark ? d.imageDark : d.image} alt={d.mockup.title} loading="lazy" />
          {pins && d.hotspots.map((h, i) => (
            <button
              key={h.title}
              type="button"
              className={`pin${i === active ? ' is-active' : ''}${h.x > 60 ? ' pin--left' : ''}`}
              style={{ left: `${h.x}%`, top: `${h.y}%`, '--i': i }}
              onClick={() => pick(i)}
              onMouseEnter={() => pick(i)}
              aria-label={`${i + 1}. ${h.title}`}
              aria-pressed={i === active}
            >
              <span className="pin__dot">{i + 1}</span>
              <span className="pin__tip" aria-hidden="true">
                <strong>{h.title}</strong>
                {h.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mockup__side">
        <button type="button" className="mockup__toggle" onClick={() => setPins((v) => !v)}>
          {pins ? <EyeOff size={15} /> : <Eye size={15} />} {pins ? '번호 숨기기' : '번호 보기'}
        </button>
        {d.imageDark && (
          <button type="button" className="mockup__toggle" onClick={() => setDark((v) => !v)} aria-pressed={dark}>
            {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? '라이트 모드 보기' : '다크 모드 보기'}
          </button>
        )}
        <ol className="mockup__list">
          {d.hotspots.map((h, i) => (
            <li key={h.title}>
              <button type="button" className={i === active ? 'is-active' : ''} onClick={() => pick(i)} onMouseEnter={() => pick(i)}>
                <span>{pad(i + 1)}</span>
                <strong>{h.title}</strong>
                <em>{h.desc}</em>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']

function Colors({ c, onCopy }) {
  return (
    <div className="colors">
      <div className="colors__primary">
        {c.primary.map((s, i) => (
          <button key={s.hex} type="button" className="swatch swatch--big" data-reveal style={{ '--i': i, background: s.hex, color: s.text || '#1f2937' }} onClick={() => onCopy(s.hex)}>
            <span className="swatch__name">{s.name}</span>
            <span className="swatch__hex">{s.hex} <Copy size={13} /></span>
            <span className="swatch__usage">{s.usage}</span>
          </button>
        ))}
      </div>
      <div className="colors__neutral">
        {c.neutral.map((s, i) => (
          <button key={s.hex} type="button" className="swatch" data-reveal style={{ '--i': i }} onClick={() => onCopy(s.hex)}>
            <span className="swatch__chip" style={{ background: s.hex }} />
            <span className="swatch__name">{s.name}</span>
            <span className="swatch__hex">{s.hex}</span>
            <span className="swatch__usage">{s.usage}</span>
          </button>
        ))}
      </div>
      <ul className="colors__semantic" data-reveal>
        {c.semantic.map((s) => (
          <li key={s.name}>
            <button type="button" style={{ background: s.tint, color: s.hex }} onClick={() => onCopy(s.hex)}>
              <i style={{ background: s.hex }} /> {s.name} <span>{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="colors__scale" data-reveal>
        <p>{c.scaleName}</p>
        <div>
          {c.scale.map((hex, i) => (
            <button key={hex} type="button" style={{ background: hex, '--i': i }} onClick={() => onCopy(hex)} aria-label={`${STEPS[i]} ${hex} 복사`}>
              <span style={{ color: i < 4 ? '#1f2937' : '#fff' }}>{STEPS[i]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Components({ c }) {
  const [tab, setTab] = useState(0)
  const P = c.primary.icon
  const O = c.outline.icon
  const states = c.stateLabels || ['정상', '주의']
  return (
    <div className="comp" style={{ '--r': c.radius }} data-reveal>
      <div className="comp__group">
        <p className="comp__label">Buttons</p>
        <div className="comp__row">
          <button type="button" className="comp-btn comp-btn--primary">
            {!c.primary.iconRight && <P size={16} />} {c.primary.label} {c.primary.iconRight && <P size={16} />}
          </button>
          <button type="button" className="comp-btn comp-btn--outline">
            {!c.outline.iconRight && <O size={16} />} {c.outline.label} {c.outline.iconRight && <O size={16} />}
          </button>
          <span className="comp-live"><i /> {c.live}</span>
        </div>
      </div>
      <div className="comp__group">
        <p className="comp__label">Badges</p>
        <div className="comp__row">
          {c.badges.map((b) => (
            <span key={b.label} className="comp-badge" style={{ color: b.color, background: b.tint }}>{b.label}</span>
          ))}
        </div>
      </div>
      <div className="comp__group">
        <p className="comp__label">Tabs</p>
        <div className="comp-tabs" role="tablist" style={{ '--n': c.tabs.length, '--t': tab }}>
          <span className="comp-tabs__ink" aria-hidden="true" />
          {c.tabs.map((t, i) => (
            <button key={t} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="comp__group comp__group--wide">
        <p className="comp__label">Progress</p>
        <ul className="comp-bars">
          {c.bars.map((b, i) => (
            <li key={b.label} style={{ '--v': `${b.value}%`, '--i': i }} className={b.state ? 'is-warn' : ''}>
              <div><span>{b.label}</span><span>{states[b.state]} · {b.value}%</span></div>
              <i />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
