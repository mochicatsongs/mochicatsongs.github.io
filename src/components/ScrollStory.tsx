import { useRef } from 'react'
import { SONGS, cover } from '../data/songs'
import { useScrollProgress } from '../hooks/useScrollProgress'

const clamp = (x: number) => Math.min(1, Math.max(0, x))
/** progress of a sub-range [a,b] of the overall 0..1 scroll */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))

const LINES: [string, string, string][] = [
  [`${SONGS.length} songs.`, 't3d', 'Dance-pop, K-pop and pure snack energy.'],
  ['New video every Friday.', 't3d t3d-cyan', 'Premieres on YouTube at 09:00 KST.'],
  ['One very chubby cat.', 't3d t3d-yellow', 'Grey, fluffy, red bandana. Always chooses the dance floor.'],
]

/** Apple-style pinned section: big lines zoom in one after another while covers fly around. */
export default function ScrollStory() {
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  const covers = SONGS.slice(0, 12)
  return (
    <section ref={ref} className="relative z-10 h-[340vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* flying cover wall */}
        <div className="absolute inset-0 grid grid-cols-4 gap-3 p-3 md:grid-cols-6"
          style={{ transform: `perspective(900px) rotateX(${18 - p * 18}deg) scale(${1.5 - p * 0.45}) translateY(${(0.5 - p) * 18}%)`, opacity: 0.18 + p * 0.22 }}>
          {[...covers, ...covers].map((s, i) => (
            <img key={i} src={cover(s)} alt="" loading="lazy" className="aspect-square w-full rounded-2xl object-cover"
              style={{ transform: `translateY(${(i % 2 ? -1 : 1) * (p * 60 - 30)}px)` }} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgba(11,7,24,.55),rgba(11,7,24,.95))]" />
        {LINES.map(([t, cls, sub], i) => {
          const a = i / LINES.length, b = (i + 1) / LINES.length
          const inP = seg(p, a, a + 0.12), outP = i === LINES.length - 1 ? 0 : seg(p, b - 0.08, b)
          const o = inP * (1 - outP)
          return (
            <div key={i} className="absolute px-6 text-center" style={{ opacity: o, transform: `scale(${0.7 + inP * 0.3 + outP * 0.4}) translateY(${(1 - inP) * 40}px)`, filter: `blur(${outP * 10}px)` }}>
              <div className={`${cls} text-[clamp(48px,11vw,140px)]`}>{t}</div>
              <div className="mx-auto mt-6 max-w-md text-[clamp(16px,2.6vw,22px)] font-medium text-white/80">{sub}</div>
            </div>
          )
        })}
        <div className="absolute bottom-8 left-1/2 h-1.5 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300" style={{ width: `${p * 100}%` }} />
        </div>
      </div>
    </section>
  )
}
