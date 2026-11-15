import './header.css'

import { EMAIL } from '../site'

export default function Header() {
  return (
    <header className="site-header">
      <a href="#top" className="site-header__logo" aria-label="eun 홈">
        <img src={`${import.meta.env.BASE_URL}logo-eun.png`} alt="eun" draggable="false" />
      </a>
      <nav className="site-header__nav" aria-label="주요 메뉴">
        <a href="#work">Portfolio</a>
        <a href="#skills">Skills</a>
        <a href={`mailto:${EMAIL}`} className="site-header__contact">Contact</a>
      </nav>
    </header>
  )
}
