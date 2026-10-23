import { useLang, useT } from '../i18n'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ARTIST } from '../data/songs'

const LINKS: [string, string][] = [['Music', '/music'], ['Videos', '/videos'], ['Games', '/games'], ['Stickers', '/stickers'], ['Books', '/books']]

export default function Navbar() {
  const t = useT()
  const { lang, setLang } = useLang()
  const toggle = <button onClick={() => setLang(lang === 'en' ? 'ko' : 'en')} aria-label="Language" className="btn3d btn-purple !px-3 !py-1.5 text-[14px]"><span className={lang === 'en' ? 'text-yellow-300' : 'opacity-60'}>EN</span><span className="opacity-50">/</span><span className={lang === 'ko' ? 'text-yellow-300' : 'opacity-60'}>한국어</span></button>
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { const f = () => setScrolled(window.scrollY > 40); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])
  const solid = scrolled || pathname !== '/'
  return (
    <>
      <nav className={`fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-5 py-4 transition-colors duration-300 sm:px-8 sm:py-5 ${solid ? 'bg-ink/75 backdrop-blur-lg' : ''}`}>
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="t3d-sm text-[26px] sm:text-[32px]">Mochi Cat</span>
          <span className="anim-wobble select-none text-[24px] sm:text-[28px]">🐾</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {LINKS.map(([lbl, to]) => (
            <span key={to}>
              <NavLink to={to} className={({ isActive }) => `rounded-full px-4 py-1.5 font-heading text-[20px] tracking-wide transition-all hover:-translate-y-0.5 hover:bg-white/10 ${isActive ? 'bg-white/15 text-yellow-300' : ''}`}>{t(lbl)}</NavLink>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {toggle}
          <a href={ARTIST.subscribe} target="_blank" rel="noopener" className="btn3d btn-pink hidden text-[17px] md:inline-flex">{t('▶ Subscribe')}</a>

        <button aria-label="Menu" onClick={() => setOpen(o => !o)} className="flex flex-col gap-[5px] p-1.5 md:hidden">
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
        </div>
      </nav>
      <div onClick={() => setOpen(false)}
        className={`fixed inset-0 z-20 flex flex-col items-start justify-center gap-8 bg-black/90 px-8 backdrop-blur-md transition-opacity duration-300 md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {LINKS.map(([lbl, to]) => <Link key={to} to={to} className="t3d text-[48px]">{t(lbl)}</Link>)}
        <a href={ARTIST.subscribe} target="_blank" rel="noopener" className="btn3d btn-pink text-[24px]">{t('▶ Subscribe')}</a>
      </div>
    </>
  )
}
