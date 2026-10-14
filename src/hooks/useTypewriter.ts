import { useEffect, useState } from 'react'
export function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    let iv: number | undefined
    const t = window.setTimeout(() => {
      iv = window.setInterval(() => setN(v => { if (v >= text.length) { clearInterval(iv); return v } return v + 1 }), speed)
    }, startDelay)
    return () => { clearTimeout(t); if (iv) clearInterval(iv) }
  }, [text, speed, startDelay])
  return { displayed: text.slice(0, n), done: n >= text.length }
}
