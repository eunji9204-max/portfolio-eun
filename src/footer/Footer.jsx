import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { EMAIL } from '../site'
import './footer.css'

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  // Copy the address instead of opening a mail app (many PCs have none set up); mailto stays as the fallback.
  const onClick = async (e) => {
    if (!navigator.clipboard) return
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__contact">
        <p className="site-footer__label">Contact</p>
        <a href={`mailto:${EMAIL}`} className="site-footer__mail" onClick={onClick} aria-label={`${EMAIL} 이메일 주소 복사`}>
          {EMAIL} {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.8} />}
        </a>
        <span className={`site-footer__copied${copied ? ' is-on' : ''}`} role="status" aria-live="polite">
          {copied && '복사됐어요'}
        </span>
      </div>
      <p className="site-footer__copy">© 2026 EUNJI NAM. All Rights Reserved.</p>
    </footer>
  )
}
