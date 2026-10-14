import { RefObject, useEffect, useState } from 'react'

/** 0 → 1 while the element scrolls through the viewport (top hits top → bottom hits bottom). */
export function useScrollProgress(ref: RefObject<HTMLElement>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const calc = () => {
      raf = 0
      const el = ref.current; if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      setP(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(calc) }
    calc()
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [ref])
  return p
}
