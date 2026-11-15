import { useEffect, useRef } from 'react'
import './skills.css'

const GROUPS = [
  { name: 'Design', desc: 'UI 설계 · 디자인 시스템 · 그래픽 작업', tools: ['Figma', 'Photoshop', 'Illustrator'] },
  { name: 'AI', desc: 'AI로 디자인 · 퍼블리싱 · 기획 리서치까지', tools: ['ChatGPT', 'Claude'] },
]

export default function Skills() {
  const ref = useRef(null)

  // Header, then each group's chips, rise in one by one when the section scrolls into view.
  useEffect(() => {
    const el = ref.current
    let t = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        el.classList.add('is-entering')
        el.classList.remove('is-pending')
        t = setTimeout(() => el.classList.remove('is-entering'), 1600) // drop stagger delays once in
        io.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    el.classList.add('is-pending')
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(t)
      el.classList.remove('is-pending', 'is-entering')
    }
  }, [])

  let n = 0 // running index for the stagger across both groups
  return (
    <section className="skills" id="skills" ref={ref} aria-labelledby="skills-title">
      <header className="skills__head">
        <p className="skills__eyebrow">Skills</p>
        <h2 className="skills__title" id="skills-title">
          Tools I <em>Use</em>
        </h2>
      </header>
      <div className="skills__groups">
        {GROUPS.map((g) => (
          <div className="skills__group" key={g.name}>
            <div className="skills__meta" style={{ '--i': n++ }}>
              <h3>{g.name}</h3>
              <p>{g.desc}</p>
            </div>
            <ul className="skills__chips">
              {g.tools.map((t) => (
                <li key={t} style={{ '--i': n++ }}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
