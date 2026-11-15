import { ArrowUpRight } from 'lucide-react'
import { EMAIL } from '../site'
import './footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__contact">
        <p className="site-footer__label">Contact</p>
        <a href={`mailto:${EMAIL}`} className="site-footer__mail">
          {EMAIL} <ArrowUpRight size={14} strokeWidth={1.8} />
        </a>
      </div>
      <p className="site-footer__copy">© 2026 EUNJI NAM. All Rights Reserved.</p>
    </footer>
  )
}
