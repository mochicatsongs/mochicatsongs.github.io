import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { asset } from '../data/songs'

const PREMIERE = new Date('2026-10-30T00:00:00+09:00').getTime()
const END = new Date('2026-11-03T00:00:00+09:00').getTime()

/** Seasonal Halloween block for "Neon Jump": shows until Nov 2, with a live countdown to the premiere. */
export default function HalloweenBanner() {
  const t = useT()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i) }, [])
  if (now > END) return null
  const left = Math.max(0, PREMIERE - now)
  const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60
  const live = left === 0
  return (
    <section className="mx-auto max-w-5xl px-5 pt-14 sm:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-fuchsia-400/40 shadow-[0_0_60px_rgba(217,70,239,.35)]">
        <video className="absolute inset-0 h-full w-full object-cover" src={asset('loops/neon.mp4')} poster={asset('loops/neon.jpg')} autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0633]/95 via-[#1a0633]/75 to-transparent" />
        <div className="relative p-6 sm:p-10 md:max-w-[62%]">
          <div className="mb-2 inline-block rounded-full bg-orange-500/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">🎃 {t('Halloween special')}</div>
          <h2 className="t3d text-[clamp(32px,5.5vw,54px)] leading-[1.05]">{t('Neon Halloween Party')}</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-white/85">{t('Glowing pumpkins, lasers and a very chubby dancer. Learn the Neon Jump moves now and freeze on “FREEZE!”')}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2 font-heading text-white">
            {live ? <span className="text-xl text-lime-300">🎬 {t('The music video is out now!')}</span> : (
              <>
                <span className="mr-1 w-full text-sm text-white/70 sm:w-auto">{t('Video premiere in')}</span>
                {[[d, t('d')], [h, t('h')], [m, t('m')], [s, t('s')]].map(([v, u], i) => (
                  <span key={i} className="min-w-[52px] rounded-xl bg-white/10 px-2 py-1 text-center text-2xl tabular-nums shadow-inner">{String(v).padStart(2, '0')}<span className="ml-0.5 text-xs text-white/60">{u}</span></span>
                ))}
              </>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/music/neon-jump" className="btn3d btn-pink text-[17px]">🎵 {t('Song & lyrics')}</Link>
            <Link to="/games/neon-jump" className="btn3d btn-yellow text-[17px]">🎮 {t('Play Neon Jump')}</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
