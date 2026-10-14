import { useT } from '../i18n'
import { useLocation, useNavigate } from 'react-router-dom'

/** Goes back to the previous page (and its scroll position); if opened directly, goes one level up. */
export default function BackButton({ className = '' }: { className?: string }) {
  const nav = useNavigate()
  const t = useT()
  const { pathname } = useLocation()
  const up = pathname.split('/').filter(Boolean).slice(0, -1).join('/')
  const back = () => {
    const idx = (window.history.state && (window.history.state as { idx?: number }).idx) || 0
    if (idx > 0) nav(-1); else nav('/' + up)
  }
  return (
    <button onClick={back} aria-label="Back" className={`btn3d btn-white mb-6 !px-4 text-[15px] ${className}`}>
      <span className="text-lg leading-none">←</span> {t('Back')}
    </button>
  )
}
