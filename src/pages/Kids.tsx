import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

/** Kids zone (/k): opened from the QR codes in the Mochi Cat kids coloring book.
 *  No navbar, no YouTube, no outside links except the book (marked for grown-ups), no analytics. */
const B = import.meta.env.BASE_URL
type Sec = { slug: string; emoji: string; title: string; ko: string; color: string; songs: [string, string][] }
export const KID_SECTIONS: Sec[] = [
  { slug: 'food', emoji: '🍕', title: 'Food & Sport', ko: '음식과 운동', color: '#ff8a5c', songs: [['the-chubby-super-cat', 'The Chubby Super Cat'], ['nom-nom-nom', 'Nom Nom Nom']] },
  { slug: 'music', emoji: '🎤', title: 'Music Star', ko: '뮤직 스타', color: '#ff5fa2', songs: [['shine-like-mochi', 'Shine Like Mochi'], ['mochi-dance', 'Mochi Dance']] },
  { slug: 'home', emoji: '🏠', title: 'Cozy Home', ko: '아늑한 집', color: '#7c6cff', songs: [['mochi-heart', 'Mochi Heart'], ['milkshake-shake', 'Milkshake Shake']] },
  { slug: 'travel', emoji: '✈️', title: 'Travel', ko: '여행', color: '#25b4e8', songs: [['meow-in-every-language', 'Meow in Every Language'], ['mochi-fiesta', 'Mochi Fiesta']] },
  { slug: 'dreams', emoji: '🚀', title: 'Dream Jobs', ko: '꿈의 직업', color: '#2ec27e', songs: [['catch-the-dot', 'Catch the Dot'], ['super-paw-rock', 'Super Paw Rock']] },
]
const BOOK_URL = '' // Amazon link goes here when the book is live

function useKidsPage(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title
    document.body.classList.add('kids-zone')
    return () => { document.title = prev; document.body.classList.remove('kids-zone') }
  }, [title])
}

function Song({ slug, title, color }: { slug: string; title: string; color: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const toggle = () => {
    const a = ref.current; if (!a) return
    document.querySelectorAll('audio').forEach(x => { if (x !== a) x.pause() })
    if (a.paused) { void a.play() } else a.pause()
  }
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-lg">
      <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-3xl text-white transition active:scale-95" style={{ background: color }}>{playing ? '❚❚' : '▶'}</button>
      <div className="min-w-0 flex-1">
        <div className="text-xl font-semibold text-[#2b2f6b]">{title}</div>
        <div className="text-sm text-[#2b2f6b]/70">Sing along with Mochi! ♫</div>
      </div>
      <audio ref={ref} src={`${B}audio/${slug}.mp3`} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7fd6ff] via-[#c9efff] to-[#fff6d6] pb-16 text-[#2b2f6b]">
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </div>
  )
}

function Book() {
  return (
    <div className="mt-10 flex flex-col items-center gap-5 rounded-3xl bg-white p-5 shadow-lg sm:flex-row">
      <img src={`${B}kids/book-cover.jpg`} alt="Mochi Cat Coloring Book cover" className="w-40 rounded-xl shadow" />
      <div>
        <div className="text-2xl font-bold">Mochi Cat Coloring Book</div>
        <p className="mt-1">44 bold &amp; easy pages, fun moves, Korean words and activities · ages 4–8</p>
        {BOOK_URL
          ? <a href={BOOK_URL} target="_blank" rel="noopener" className="mt-3 inline-block rounded-full bg-[#ff6b8b] px-6 py-2 font-semibold text-white">For grown-ups: get the book on Amazon</a>
          : <span className="mt-3 inline-block rounded-full bg-[#ffd23f] px-6 py-2 font-semibold">Coming soon on Amazon</span>}
      </div>
    </div>
  )
}

function Grownups() {
  return (
    <p className="mt-10 rounded-2xl bg-white/70 p-4 text-sm">
      <b>For grown-ups:</b> this kids page has no ads, no sign-up and no tracking. Songs play right here — no YouTube needed.
      <br />There is also a cozy coloring book for adults, <i>Cozy Cat</i>, on the main site.
    </p>
  )
}

export function KidsHome() {
  useKidsPage('Color with Mochi! 🐾 Kids zone')
  return (
    <Shell>
      <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-white/80 p-6 text-center shadow-xl sm:flex-row sm:text-left">
        <img src={`${B}kids/mochi.png`} alt="Mochi the cat" className="w-40 sm:w-48" />
        <div>
          <h1 className="font-heading text-5xl text-[#ff6b8b] sm:text-6xl">Color with Mochi!</h1>
          <p className="mt-2 text-lg">Hi! I’m Mochi 🐾 Pick your page, play my song and color with me!</p>
          <p className="text-base opacity-80">안녕! 나는 모치야. 노래를 틀고 같이 색칠하자!</p>
        </div>
      </div>
      <h2 className="mt-8 text-2xl font-bold">🎵 Which part of the book are you coloring?</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {KID_SECTIONS.map(s => (
          <Link key={s.slug} to={`/k/${s.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1">
            <img src={`${B}kids/${s.slug}.png`} alt="" className="aspect-square w-full object-cover" />
            <div className="p-3 text-center text-lg font-bold text-white" style={{ background: s.color }}>{s.emoji} {s.title}</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-2xl font-bold">🖨️ Free pages to print</h2>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <a key={i} href={`${B}kids/free-page-${i}.pdf`} target="_blank" rel="noopener" className="rounded-2xl bg-white p-2 shadow">
            <img src={`${B}kids/free-page-${i}.png`} alt={`Free coloring page ${i}`} className="w-full rounded-lg" />
            <div className="mt-1 text-center text-sm font-semibold">Print ⬇</div>
          </a>
        ))}
      </div>
      <Book />
      <Grownups />
    </Shell>
  )
}

export function KidsSection() {
  const { slug } = useParams()
  const s = KID_SECTIONS.find(x => x.slug === slug)
  useKidsPage(s ? `${s.title} — Color with Mochi!` : 'Color with Mochi!')
  if (!s) return <KidsHome />
  return (
    <Shell>
      <Link to="/k" className="inline-block rounded-full bg-white px-4 py-2 font-semibold shadow">← All pages</Link>
      <div className="mt-4 overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="p-5 text-center text-white" style={{ background: s.color }}>
          <div className="text-5xl">{s.emoji}</div>
          <h1 className="font-heading text-4xl sm:text-5xl">{s.title}</h1>
          <div className="opacity-90">{s.ko}</div>
        </div>
        <img src={`${B}kids/${s.slug}.png`} alt="" className="mx-auto w-64" />
      </div>
      <h2 className="mt-8 text-2xl font-bold">🎵 Press play and color!</h2>
      <div className="mt-4 grid gap-3">
        {s.songs.map(([sl, t]) => <Song key={sl} slug={sl} title={t} color={s.color} />)}
      </div>
      <p className="mt-4 text-center text-lg">★ Don’t forget your Mochi move on the page! ★</p>
      <h2 className="mt-10 text-xl font-bold">More from the book</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {KID_SECTIONS.filter(x => x.slug !== s.slug).map(x => (
          <Link key={x.slug} to={`/k/${x.slug}`} className="rounded-full px-4 py-2 font-semibold text-white shadow" style={{ background: x.color }}>{x.emoji} {x.title}</Link>
        ))}
      </div>
      <Book />
      <Grownups />
    </Shell>
  )
}
