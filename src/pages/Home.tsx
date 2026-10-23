import { useT } from '../i18n'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ScrubVideo from '../components/ScrubVideo'
import HalloweenBanner from '../components/HalloweenBanner'
import { Everywhere, GameBanner, LatestVideo, Premieres, SongsRail, StickerParade } from '../components/HomeSections'
import { CopyIcon } from '../components/Icons'
import { ARTIST } from '../data/songs'
import { useTypewriter } from '../hooks/useTypewriter'

const TEXT = 'Glad you stopped by. I love snacks, but I always choose the dance floor. So — what are we doing today?'

export default function Home() {
  const t = useT()
  const { displayed, done } = useTypewriter(t(TEXT))
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sy, setSy] = useState(0)
  useEffect(() => { let r = 0; const f = () => { if (!r) r = requestAnimationFrame(() => { r = 0; setSy(window.scrollY) }) }; window.addEventListener('scroll', f, { passive: true }); return () => { window.removeEventListener('scroll', f); cancelAnimationFrame(r) } }, [])
  const hp = Math.min(1, sy / (typeof window === 'undefined' ? 800 : window.innerHeight))
  useEffect(() => { const t = setTimeout(() => setShow(true), 400); return () => clearTimeout(t) }, [])
  return (
    <>
      <ScrubVideo />
      <section className="relative z-10 flex h-[100svh] flex-col justify-end overflow-hidden px-5 pb-28 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl" style={{ opacity: 1 - hp * 1.2, transform: `translateY(${-hp * 120}px) scale(${1 - hp * 0.12})` }}>
          <div className="mb-1 text-[clamp(16px,3.2vw,22px)] font-semibold text-white/85">{t('Hey there, meet')}</div>
          <h1 className="anim-popin mb-2 select-none"><span className="wordmark anim-wobble text-[clamp(84px,19vw,190px)]">MOCHI</span></h1>
          <div className="mb-5 font-heading text-[clamp(20px,4.2vw,32px)] leading-tight tracking-wide text-cyan-200 [text-shadow:0_2px_0_#0e7490,0_3px_10px_rgba(0,0,0,.55)] sm:mb-6">{t('the chubbiest pop star on the internet')}</div>
          <p className="mb-6 min-h-[54px] text-[clamp(17px,3.6vw,22px)] font-medium leading-[1.4] text-white/90 sm:mb-7">
            {displayed}{!done && <span className="ml-[2px] inline-block h-[1.1em] w-[2px] animate-blink bg-white align-middle" />}
          </p>
          <div className={`flex flex-wrap gap-x-2.5 gap-y-4 transition-all duration-[400ms] ${show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            {[['🎵 Listen', '/music', 'btn-pink'], ['🎬 Watch', '/videos', 'btn-cyan'], ['🎮 Play', '/games', 'btn-yellow'], ['✨ Stickers', '/stickers', 'btn-lime']].map(([lbl, to, c]) => (
              <Link key={to} to={to} className={`btn3d ${c} text-[15px] sm:text-[18px]`}>{t(lbl)}</Link>
            ))}
            <button onClick={() => { navigator.clipboard?.writeText(ARTIST.handle); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
              className="btn3d btn-white text-[15px] sm:text-[18px]">
              <span>{copied ? t('Copied! 💖') : ARTIST.handle}</span><CopyIcon />
            </button>
          </div>
        </div>
      </section>

      <div className="bg-party relative z-10">
        <HalloweenBanner />
        <LatestVideo />
        <Premieres />
        <SongsRail />
        <GameBanner />
        <StickerParade />
        <Everywhere />
        <div className="mx-auto max-w-5xl px-5 pb-40 sm:px-8">
          <footer className="border-t border-white/10 pt-6 text-[13px] leading-relaxed text-white/50">
            {t('💃 Dance with Mochi and tag')} <b>#MochiCat</b> {t('— your video might get featured!')}<br />
            {t('Music and visuals are made with AI tools; characters, stories, lyrics and editing by the Mochi Cat team.')}<br />
            © 2026 Mochi Cat · 모치캣 · <Link to="/privacy" className="underline hover:text-white">{t('Privacy')}</Link>
          </footer>
        </div>
      </div>
    </>
  )
}
