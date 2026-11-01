import { useLocation } from 'react-router-dom'
import { useLang, useT } from '../i18n'

/** Same Google Form as the game; the info field is prefilled with where the visitor came from. */
const FORM = 'https://docs.google.com/forms/d/1qbwCVm2vLC923FES4ykFQ-4DyI-rseH6OnWPATk1ruI/viewform?usp=pp_url&entry.1287651229='
export function useFeedbackUrl() {
  const { pathname } = useLocation()
  const { lang } = useLang()
  return () => {
    const ua = navigator.userAgent, dev = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'other'
    const br = /CriOS|Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : /Firefox/.test(ua) ? 'Firefox' : 'other'
    const page = pathname.replace(import.meta.env.BASE_URL, '/') || '/'
    return FORM + encodeURIComponent(`site · ${page} · ${lang} · ${dev}/${br} ${window.innerWidth}x${window.innerHeight}`)
  }
}

/** Small link for page footers and the menu. */
export function FeedbackLink({ className = '' }: { className?: string }) {
  const t = useT(); const url = useFeedbackUrl()
  return <a href="#" onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(url(), '_blank', 'noopener') }} className={className}>💬 {t('Feedback & ideas')}</a>
}

/** Footer line shown at the bottom of every page. */
export function FeedbackFooter() {
  const t = useT()
  return (
    <div className="mt-16 break-keep border-t border-white/10 pt-6 text-center text-sm text-white/60">
      {t('Found a bug or have an idea for Mochi?')} <FeedbackLink className="ml-1 inline-block whitespace-nowrap font-semibold text-yellow-300 underline underline-offset-4 hover:text-yellow-200" />
    </div>
  )
}

/** Card for the Games page. */
export function FeedbackCard({ text }: { text: string }) {
  const t = useT(); const url = useFeedbackUrl()
  return (
    <div className="card3d mt-10 flex flex-col items-center gap-3 bg-gradient-to-br from-violet-600 to-pink-600 p-5 text-center sm:flex-row sm:text-left">
      <span className="text-[40px]">🐞</span>
      <div className="flex-1 break-keep text-white/90">{t(text)}</div>
      <button onClick={() => window.open(url(), '_blank', 'noopener')} className="btn3d btn-yellow text-[16px]">{t('Send feedback')}</button>
    </div>
  )
}
