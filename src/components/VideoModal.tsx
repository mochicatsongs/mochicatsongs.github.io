import { useEffect } from 'react'

export default function VideoModal({ id, title, onClose }: { id: string | null; title?: string; onClose: () => void }) {
  useEffect(() => {
    if (!id) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [id, onClose])
  if (!id) return null
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md anim-popin">
      <div onClick={e => e.stopPropagation()} className="card3d relative w-full max-w-5xl overflow-hidden bg-black pt-[56.25%] hover:transform-none">
        <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={title}
          allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
      <button onClick={onClose} className="btn3d btn-white absolute right-4 top-4 text-[16px]">✕ Close</button>
    </div>
  )
}
