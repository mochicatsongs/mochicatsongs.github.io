import { useEffect, useRef, useState } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress'
import LoopVideo from './LoopVideo'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'

const PREMIERE = new Date('2026-10-30T00:00:00+09:00').getTime()
const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)))
const END = new Date('2026-11-03T00:00:00+09:00').getTime()

/** Seasonal Halloween block for "Neon Jump": shows until Nov 2, with a live countdown to the premiere. */
export default function HalloweenBanner() {
  const t = useT()
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i) }, [])
  if (now > END) return null
  const left = Math.max(0, PREMIERE - now)
  const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60
  const live = left === 0
  const g = seg(p, 0, 0.55), tv = seg(p, 0.45, 0.75)
  return (
    <section ref={ref} className="relative z-10 h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div className="absolute left-0 right-0 top-[12vh] text-center" style={{ opacity: 1 - g * 1.4, transform: `translateY(${-g * 60}px)` }}>
          <div className="t3d t3d-yellow text-[clamp(40px,8vw,96px)]">🎃 {t('Halloween special')}</div>
        </div>
        <div className="relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,.6)]"
          style={{ width: `${62 + g * 38}vw`, height: `${42 + g * 58}svh`, borderRadius: `${36 - g * 36}px`, transform: `translateY(${(1 - g) * 12}vh)` }}>
          <LoopVideo name="neon" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" style={{ opacity: tv }} />
          <div className="absolute bottom-[8%] left-0 right-0 flex flex-col items-center px-6 text-center" style={{ opacity: tv, transform: `translateY(${(1 - tv) * 50}px) scale(${0.9 + tv * 0.1})` }}>
            <div className="t3d t3d-yellow text-[clamp(38px,7.5vw,104px)] leading-[1.02]">{t('Neon Halloween Party')}</div>
            <p className="mt-3 max-w-xl text-[clamp(15px,1.8vw,19px)] leading-relaxed text-white/85">{t('Glowing pumpkins, lasers and a very chubby dancer. Learn the Neon Jump moves now and freeze on “FREEZE!”')}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 font-heading text-white">
              {live ? <span className="text-2xl text-lime-300">🎬 {t('The music video is out now!')}</span> : (
                <>
                  <span className="mr-1 w-full text-sm text-white/70 sm:w-auto">{t('Video premiere in')}</span>
                  {[[d, t('d')], [h, t('h')], [m, t('m')], [s, t('s')]].map(([v, u], i) => (
                    <span key={i} className="min-w-[56px] rounded-xl bg-white/15 px-2 py-1 text-center text-2xl tabular-nums backdrop-blur">{String(v).padStart(2, '0')}<span className="ml-0.5 text-xs text-white/60">{u}</span></span>
                  ))}
                </>
              )}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/music/neon-jump" className="btn3d btn-pink text-[clamp(17px,2.2vw,22px)]">🎵 {t('Song & lyrics')}</Link>
              <Link to="/games/neon-jump" className="btn3d btn-yellow text-[clamp(17px,2.2vw,22px)]">🎮 {t('Play Neon Jump')}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
