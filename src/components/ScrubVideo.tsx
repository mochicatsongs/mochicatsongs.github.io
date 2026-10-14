import { useEffect, useRef } from 'react'
import { asset } from '../data/songs'

/** Full-screen background video that scrubs with horizontal mouse / finger movement. */
export default function ScrubVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current!
    const SENSITIVITY = 0.8
    let prevX: number | null = null, target = 0, seeking = false
    const seek = () => { if (!v.duration) return; seeking = true; v.currentTime = target }
    const onSeeked = () => { seeking = false; if (Math.abs(v.currentTime - target) > 0.01) seek() }
    const move = (x: number) => {
      if (prevX === null) { prevX = x; return }
      const delta = x - prevX; prevX = x
      if (!v.duration) return
      target = Math.min(v.duration, Math.max(0, target + (delta / window.innerWidth) * SENSITIVITY * v.duration))
      if (!seeking) seek()
    }
    const mm = (e: MouseEvent) => move(e.clientX)
    const tm = (e: TouchEvent) => move(e.touches[0].clientX)
    const ts = (e: TouchEvent) => { prevX = e.touches[0].clientX; if (!v.paused) { v.pause(); target = v.currentTime } }
    v.addEventListener('seeked', onSeeked)
    window.addEventListener('mousemove', mm)
    window.addEventListener('touchmove', tm, { passive: true })
    window.addEventListener('touchstart', ts, { passive: true })
    // Phones have no hover: gently autoplay until the user touches.
    if (!matchMedia('(hover: hover)').matches) { v.loop = true; v.play().catch(() => {}) }
    return () => {
      v.removeEventListener('seeked', onSeeked)
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('touchmove', tm)
      window.removeEventListener('touchstart', ts)
    }
  }, [])
  return (
    <>
      <video ref={ref} muted playsInline preload="auto" poster={asset('media/mochi_hero_poster.jpg')}
        className="fixed inset-0 z-0 h-full w-full object-cover object-[44%_center] md:object-[70%_center]">
        <source src={asset('media/mochi_hero.mp4')} type="video/mp4" />
      </video>
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent md:bg-gradient-to-r md:from-ink/80 md:via-ink/35 md:to-transparent" />
    </>
  )
}
