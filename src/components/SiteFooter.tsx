import { useT } from '../i18n'

export const KOFI_URL = 'https://ko-fi.com/edwardfuturepilot'

/** small "made by a real person" line with the Ko-fi support link (site only — never in the game-portal copy) */
export function MadeByLine({ className = '' }: { className?: string }) {
  const t = useT()
  return (
    <a href={KOFI_URL} target="_blank" rel="noopener" className={`inline-block hover:text-white ${className}`}>
      {t('Made by Edward — a real person & future pilot ✈️')} · <span className="underline">{t('Support the journey →')}</span>
    </a>
  )
}

/** footer for every site page except home (home has its own footer with the same line) */
export default function SiteFooter() {
  return (
    <footer className="mx-auto max-w-5xl px-5 pb-28 pt-6 text-center text-[12px] leading-relaxed text-white/45 sm:px-8">
      <div className="border-t border-white/10 pt-5"><MadeByLine /></div>
    </footer>
  )
}
