import { useEffect, useRef } from 'react'
import { asset } from '../data/songs'

/** Silent looping clip that only plays while it is on screen (saves battery & data). */
export default function LoopVideo({ name, className = '', rate = 1 }: { name: string; className?: string; rate?: number }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current!
    v.playbackRate = rate
    if (!('IntersectionObserver' in window)) { v.play().catch(() => {}); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.05 })
    io.observe(v)
    return () => io.disconnect()
  }, [rate])
  return <video ref={ref} muted loop playsInline preload="metadata" poster={asset(`loops/${name}.jpg`)} src={asset(`loops/${name}.mp4`)} className={`h-full w-full object-cover ${className}`} />
}
