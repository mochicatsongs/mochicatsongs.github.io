import { useT } from '../i18n'
import { track } from '../analytics'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTIST, asset, songBySlug } from '../data/songs'
import { usePlayer } from '../player/PlayerContext'
import BackButton from '../components/BackButton'

const ROUND = 30 // seconds
const load = () => { try { return Number(localStorage.getItem('ctd-best') || 0) } catch { return 0 } }
const save = (n: number) => { try { localStorage.setItem('ctd-best', String(n)) } catch { /* ignore */ } }

type Dot = { x: number; y: number; vx: number; vy: number; r: number }

export default function CatchTheDot() {
  const cv = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<'ready' | 'play' | 'over'>('ready')
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(ROUND)
  const [best, setBest] = useState(load)
  const [msg, setMsg] = useState('')
  const dot = useRef<Dot>({ x: 0.5, y: 0.5, vx: 0, vy: 0, r: 0.045 })
  const sc = useRef(0)
  const paws = useRef<{ x: number; y: number; t: number; hit: boolean }[]>([])
  const img = useRef<HTMLImageElement>()
  const p = usePlayer()
  const t = useT()

  useEffect(() => { const i = new Image(); i.src = asset('media/avatar.jpg'); img.current = i }, [])

  const respawn = useCallback(() => {
    const speed = 0.25 + sc.current * 0.03
    const a = Math.random() * Math.PI * 2
    dot.current = { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.6, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: Math.max(0.022, 0.05 - sc.current * 0.0012) }
  }, [])

  const start = () => {
    track('game_start', { game: 'catch-the-dot' })
    sc.current = 0; setScore(0); setLeft(ROUND); setMsg(''); respawn(); setState('play')
    const song = songBySlug('catch-the-dot')
    if (song && p.current?.slug !== song.slug) p.play(song); else if (!p.playing) p.toggle()
  }

  // game loop
  useEffect(() => {
    const c = cv.current!; const g = c.getContext('2d')!
    let raf = 0, last = performance.now(), t0 = performance.now()
    const fit = () => { const r = c.getBoundingClientRect(); c.width = r.width * devicePixelRatio; c.height = r.height * devicePixelRatio }
    fit(); window.addEventListener('resize', fit)
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const W = c.width, H = c.height, d = dot.current
      if (state === 'play') {
        d.x += d.vx * dt; d.y += d.vy * dt
        if (Math.random() < dt * (1 + sc.current * 0.15)) { const a = Math.random() * Math.PI * 2, s = Math.hypot(d.vx, d.vy); d.vx = Math.cos(a) * s; d.vy = Math.sin(a) * s }
        if (d.x < d.r || d.x > 1 - d.r) d.vx *= -1
        if (d.y < d.r || d.y > 0.82) d.vy *= -1
        d.x = Math.min(1 - d.r, Math.max(d.r, d.x)); d.y = Math.min(0.82, Math.max(d.r, d.y))
        const remain = Math.max(0, ROUND - (now - t0) / 1000)
        setLeft(Math.ceil(remain))
        if (remain <= 0) {
          setState('over')
          const s = sc.current
          setBest(b => { if (s > b) { save(s); return s } return b })
          setMsg(s >= 25 ? 'LEGENDARY! Agent Mochi is impressed 😼' : s >= 15 ? 'Gotcha! Super-fast paws 🐾' : s >= 8 ? 'Nice! One more try?' : 'The dot escaped… try again!')
        }
      } else t0 = now
      // draw
      g.clearRect(0, 0, W, H)
      const grd = g.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W)
      grd.addColorStop(0, '#3b1a6e'); grd.addColorStop(1, '#0b0718'); g.fillStyle = grd; g.fillRect(0, 0, W, H)
      // laser grid
      g.strokeStyle = 'rgba(255,60,90,.12)'; g.lineWidth = 1 * devicePixelRatio
      for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo((i / 10) * W, 0); g.lineTo((i / 10) * W, H); g.stroke() }
      // Mochi at the bottom
      const m = img.current, ms = Math.min(W, H) * 0.22
      if (m?.complete) { g.save(); g.beginPath(); g.arc(W / 2, H - ms * 0.55, ms / 2, 0, Math.PI * 2); g.clip(); g.drawImage(m, W / 2 - ms / 2, H - ms * 1.05, ms, ms); g.restore() }
      // the dot
      if (state !== 'ready') {
        const R = d.r * Math.min(W, H) * 1.6
        const glow = g.createRadialGradient(d.x * W, d.y * H, 0, d.x * W, d.y * H, R * 2.4)
        glow.addColorStop(0, 'rgba(255,40,60,.9)'); glow.addColorStop(1, 'rgba(255,40,60,0)')
        g.fillStyle = glow; g.beginPath(); g.arc(d.x * W, d.y * H, R * 2.4, 0, Math.PI * 2); g.fill()
        g.fillStyle = '#ff2a3c'; g.beginPath(); g.arc(d.x * W, d.y * H, R, 0, Math.PI * 2); g.fill()
      }
      // paw taps
      paws.current = paws.current.filter(q => now - q.t < 500)
      for (const q of paws.current) {
        const a = 1 - (now - q.t) / 500; g.globalAlpha = a; g.font = `${32 * devicePixelRatio}px serif`; g.textAlign = 'center'
        g.fillText(q.hit ? '🐾' : '·', q.x * W, q.y * H); g.globalAlpha = 1
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', fit) }
  }, [state])

  const tap = (e: React.PointerEvent) => {
    if (state !== 'play') return
    const r = cv.current!.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    const d = dot.current, ar = r.width / r.height
    const dist = Math.hypot((x - d.x) * ar, y - d.y)
    const hit = dist < d.r * 2.2 * Math.min(1, ar)
    paws.current.push({ x, y, t: performance.now(), hit })
    if (hit) { sc.current += 1; setScore(sc.current); respawn(); navigator.vibrate?.(15) }
  }

  const share = async () => {
    const text = `I caught the red dot ${score} times in 30 seconds! 🔴🐾 Can you beat me? #MochiCat`
    const url = location.href
    try { if (navigator.share) await navigator.share({ title: 'Catch the Dot — Mochi Cat', text, url }); else { await navigator.clipboard.writeText(`${text} ${url}`); setMsg('Copied! Paste it anywhere 📋') } } catch { /* cancelled */ }
  }

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-4 pb-36 pt-24">
      <div className="mb-3 flex items-end justify-between">
        <div><BackButton className="!mb-3" /><h1 className="t3d t3d-cyan text-4xl sm:text-5xl">Catch the Dot</h1></div>
        <div className="text-right text-sm text-white/70"><div>{t('Score')} <b className="text-2xl text-white">{score}</b></div><div>{t('Best')} {best} · ⏱ {left}s</div></div>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <canvas ref={cv} onPointerDown={tap} className="block h-[62vh] w-full touch-none select-none" />
        {state !== 'play' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/45 p-6 text-center backdrop-blur-sm">
            {state === 'over' ? (<>
              <div className="t3d text-7xl">{score}</div>
              <div className="text-lg">{msg}</div>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="pulse-wrap"><button onClick={start} className="btn3d btn-yellow text-[18px]">{t('🔁 Play again')}</button></span>
                <button onClick={share} className="btn3d btn-cyan text-[18px]">{t('📤 Share score')}</button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <Link to="/music/catch-the-dot" className="underline">{t('Lyrics & song')}</Link>·
                <a href={ARTIST.spotify} target="_blank" rel="noopener" className="underline">Spotify</a>·
                <a href={ARTIST.subscribe} target="_blank" rel="noopener" className="underline">Subscribe</a>
              </div>
            </>) : (<>
              <div className="max-w-sm text-lg">{t('Agent Mochi needs your help! Tap the red dot as many times as you can in 30 seconds. It gets faster and smaller…')}</div>
              <span className="pulse-wrap"><button onClick={start} className="btn3d btn-pink text-[24px]">{t('▶ Start 🔴')}</button></span>
              <div className="text-sm text-white/55">{t('🎵 with the song “Catch the Dot”')}</div>
            </>)}
          </div>
        )}
      </div>
    </main>
  )
}
