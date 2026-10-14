import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ARTIST } from '../data/songs'

const LINKS: [string, string][] = [['Music', '/music'], ['Videos', '/videos'], ['Games', '/games'], ['Stickers', '/stickers']]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { const f = () => setScrolled(window.scrollY > 40); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])
  const solid = scrolled || pathname !== '/'
  return (
    <>
      <nav className={`fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-5 py-4 transition-colors duration-300 sm:px-8 sm:py-5 ${solid ? 'bg-ink/75 backdrop-blur-lg' : ''}`}>
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="font-heading text-[21px] font-medium tracking-tight sm:text-[26px]">Mochi Cat</span>
          <span className="select-none text-[25px] sm:text-[30px]" style={{ letterSpacing: '-0.02em' }}>✳︎</span>
        </Link>
        <div className="hidden text-[23px] md:flex">
          {LINKS.map(([t, to], i) => (
            <span key={to}>
              <NavLink to={to} className={({ isActive }) => `transition-opacity hover:opacity-60 ${isActive ? 'underline underline-offset-4' : ''}`}>{t}</NavLink>
              {i < LINKS.length - 1 && <span className="mr-[0.3em]">,</span>}
            </span>
          ))}
        </div>
        <a href={ARTIST.subscribe} target="_blank" rel="noopener" className="hidden text-[23px] underline underline-offset-2 transition-opacity hover:opacity-60 md:block">Subscribe</a>
        <button aria-label="Menu" onClick={() => setOpen(o => !o)} className="flex flex-col gap-[5px] p-1.5 md:hidden">
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </nav>
      <div onClick={() => setOpen(false)}
        className={`fixed inset-0 z-20 flex flex-col items-start justify-center gap-8 bg-black/90 px-8 backdrop-blur-md transition-opacity duration-300 md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {LINKS.map(([t, to]) => <Link key={to} to={to} className="text-[32px] font-medium">{t}</Link>)}
        <a href={ARTIST.subscribe} target="_blank" rel="noopener" className="text-[32px] font-medium underline">Subscribe</a>
      </div>
    </>
  )
}
