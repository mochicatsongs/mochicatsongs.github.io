import { useEffect, useRef } from 'react'
import { asset } from '../data/songs'

/** Full-screen background video that scrubs with horizontal mouse / finger movement. */
export default function ScrubVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current!
    const SENSITIVITY = 0.6 // whole width of the screen = 60% of the clip
    const EASE = 0.16 // lower = smoother / slower follow
    let prevX: number | null = null, target = 0, shown = 0, seeking = false, raf = 0
    const tick = () => {
      if (v.duration && !seeking && v.paused) {
        const diff = target - shown
        if (Math.abs(diff) > 0.004) {
          shown += diff * EASE
          seeking = true
          v.currentTime = shown
        }
      }
      raf = requestAnimationFrame(tick)
    }
    const onSeeked = () => { seeking = false }
    const move = (x: number) => {
      if (prevX === null) { prevX = x; return }
      const delta = x - prevX; prevX = x
      if (!v.duration) return
      target = Math.min(v.duration - 0.05, Math.max(0, target + (delta / window.innerWidth) * SENSITIVITY * v.duration))
    }
    const mm = (e: MouseEvent) => move(e.clientX)
    // Phones: only an actual drag takes over the clip; a tap (e.g. language switch) never stops it.
    // After the finger lifts, the loop resumes on its own.
    let resume = 0
    const ts = (e: TouchEvent) => { prevX = e.touches[0].clientX; clearTimeout(resume) }
    const tm = (e: TouchEvent) => {
      if (!v.paused) { v.pause(); target = shown = v.currentTime }
      move(e.touches[0].clientX)
    }
    const te = () => { clearTimeout(resume); if (isPhone) resume = window.setTimeout(() => { v.play().catch(() => {}) }, 1500) }
    const isPhone = !matchMedia('(hover: hover)').matches
    v.addEventListener('seeked', onSeeked)
    window.addEventListener('mousemove', mm)
    window.addEventListener('touchmove', tm, { passive: true })
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchend', te, { passive: true })
    // Portrait screens get a tall, sharp crop; picked here (not at render) so the prerendered HTML can't pin the wrong file.
    const portrait = window.innerHeight > window.innerWidth
    v.poster = asset(portrait ? 'media/mochi_hero_poster_m.jpg' : 'media/mochi_hero_poster.jpg')
    v.src = asset(portrait ? 'media/mochi_hero_m.mp4' : 'media/mochi_hero.mp4')
    if (portrait) v.classList.add('hero-portrait')
    v.load()
    raf = requestAnimationFrame(tick)
    // Phones have no hover: play slowly on a loop until the user touches.
    if (isPhone) { v.loop = true; v.playbackRate = 1; v.play().catch(() => {}) }
    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('seeked', onSeeked)
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('touchmove', tm)
      window.removeEventListener('touchstart', ts)
      window.removeEventListener('touchend', te)
      clearTimeout(resume)
    }
  }, [])
  return (
    <>
      <video ref={ref} muted playsInline preload="auto"
        className="fixed inset-0 z-0 h-full w-full object-cover object-[44%_center] md:object-[70%_center] [&.hero-portrait]:object-center" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent md:bg-gradient-to-r md:from-ink/80 md:via-ink/35 md:to-transparent" />
    </>
  )
}
