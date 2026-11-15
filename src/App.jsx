import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Header from './header/Header'
import Hero from './hero/Hero'
import Work from './work/Work'
import ProjectDetail from './detail/ProjectDetail'
import Footer from './footer/Footer'
import Skills from './skills/Skills'
import ToTop from './totop/ToTop'
import Loader from './loader/Loader'

// Hash routing: #/project/<slug> shows a detail page, anything else is the home page.
const readSlug = () => location.hash.match(/^#\/project\/([\w-]+)/)?.[1] ?? null

export default function App() {
  const [slug, setSlug] = useState(readSlug)
  const current = useRef(slug)
  const [firstOnHome] = useState(() => !slug) // the loader waits for hero frames only if we start on home
  const [fromDetail, setFromDetail] = useState(false) // home was reached via a detail page's back link

  useEffect(() => {
    const onHash = () => {
      const next = readSlug()
      if (next === current.current) return // anchor jumps within the same page
      const prev = current.current
      current.current = next
      const swap = () => {
        flushSync(() => {
          setFromDetail(prev !== null)
          setSlug(next)
        })
        // detail pages open at the top; home honours #work / #top anchors
        const anchor = !next && location.hash && document.getElementById(location.hash.slice(1))
        if (anchor) anchor.scrollIntoView({ behavior: 'instant' })
        else window.scrollTo({ top: 0, behavior: 'instant' })
      }
      // shared-element morph (card image <-> detail hero) where the browser supports it
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(swap)
      else swap()
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      <Loader waitForHero={firstOnHome} />
      <Header />
      {slug ? (
        <ProjectDetail key={slug} slug={slug} />
      ) : (
        <main id="top">
          <Hero />
          <Work id="work" instant={fromDetail} />
          <Skills />
          <Footer />
          <ToTop />
        </main>
      )}
    </>
  )
}
