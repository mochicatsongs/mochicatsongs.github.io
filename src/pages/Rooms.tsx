import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { H1, Page, Pill } from '../components/Section'
import { ARTIST, asset } from '../data/songs'
import { useLang } from '../i18n'

/** Mochi's Rooms: long lofi mixes (study / work / café & coloring / sleep) in one player. */
type Room = {
  id: 'study' | 'work' | 'color' | 'sleep'; icon: string; yt: string; live: string // live = public time, KST
  en: { name: string; len: string; text: string }; ko: { name: string; len: string; text: string }
  btn: string
}
const ROOMS: Room[] = [
  { id: 'study', icon: '📚', yt: '46AKRg__gT0', live: '2026-10-26T00:00', btn: 'btn-yellow',
    en: { name: 'Study', len: '3 hours · Pomodoro 50/10', text: 'A cozy autumn café in Seoul. 50 minutes of focus, 10 minutes of break — a soft bell tells you when.' },
    ko: { name: '공부', len: '3시간 · 뽀모도로 50/10', text: '서울의 가을 카페에서 50분 집중, 10분 휴식. 은은한 종소리가 시간을 알려줘요.' } },
  { id: 'work', icon: '💻', yt: 's96HtlPhU4c', live: '2026-10-28T08:30', btn: 'btn-cyan',
    en: { name: 'Work', len: '3 hours · no lyrics', text: 'A sunny office with a view of the city. Calm lofi, soft typing and a cup of coffee.' },
    ko: { name: '일', len: '3시간 · 가사 없음', text: '도시가 보이는 햇살 가득한 사무실. 잔잔한 로파이와 타자 소리, 커피 한 잔.' } },
  { id: 'color', icon: '🎨', yt: 'RZcD367VPqM', live: '2026-10-29T13:00', btn: 'btn-pink',
    en: { name: 'Café & Coloring', len: '2 hours · café lofi & bossa', text: 'A snowy café in Seoul. Grab your pencils (or a book) and slow down with Mochi.' },
    ko: { name: '카페 · 컬러링', len: '2시간 · 카페 로파이 & 보사노바', text: '눈 내리는 서울 카페. 색연필이나 책을 들고 모치와 천천히 쉬어 가요.' } },
  { id: 'sleep', icon: '🌙', yt: 'hFAMXAOTg6A', live: '2026-10-27T21:00', btn: 'btn-purple',
    en: { name: 'Sleep', len: '8 hours · soft piano', text: 'A quiet summer night over the Han River. Lights off — Mochi is already yawning.' },
    ko: { name: '수면', len: '8시간 · 잔잔한 피아노', text: '한강이 보이는 고요한 여름밤. 불 끄고, 모치랑 꿀잠 자요.' } },
]
const isOpen = (r: Room) => new Date(`${r.live}:00+09:00`).getTime() <= Date.now()
const when = (r: Room, ko: boolean) => {
  const d = new Date(`${r.live}:00+09:00`)
  const md = d.toLocaleDateString(ko ? 'ko-KR' : 'en-US', { month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' })
  const hm = d.toLocaleTimeString(ko ? 'ko-KR' : 'en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' })
  return ko ? `${md} ${hm} 공개` : `Opens ${md}, ${hm} KST`
}

export default function Rooms() {
  const { lang } = useLang(); const ko = lang === 'ko'
  const [sp, setSp] = useSearchParams()
  const cur = ROOMS.find(r => r.id === sp.get('room')) ?? ROOMS[0]
  const [play, setPlay] = useState(false)
  useEffect(() => { setPlay(false) }, [cur.id])
  useEffect(() => { document.title = ko ? '모치의 방 🐾 공부·일·카페·수면 음악' : 'Mochi’s Rooms 🐾 Study · Work · Café · Sleep'; return () => { document.title = 'Mochi Cat 🐾 — the chubbiest pop star' } }, [ko])
  const t = ko ? cur.ko : cur.en
  return (
    <Page>
      <H1 color="t3d-yellow">{ko ? '모치의 방' : 'Mochi’s Rooms'}</H1>
      <p className="-mt-4 mb-8 max-w-2xl text-lg text-white/80">
        {ko ? '공부할 때, 일할 때, 색칠할 때, 잠들 때. 지금 필요한 방을 골라 모치와 함께 있어요.' : 'Studying, working, coloring or falling asleep — pick a room and stay a while with Mochi.'}
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROOMS.map(r => (
          <button key={r.id} onClick={() => setSp({ room: r.id }, { replace: true })}
            className={`btn3d ${r.btn} justify-center !py-3 text-[18px] ${cur.id === r.id ? 'ring-4 ring-white/70' : 'opacity-80'}`} aria-pressed={cur.id === r.id}>
            <span className="mr-1.5">{r.icon}</span>{ko ? r.ko.name : r.en.name}
          </button>
        ))}
      </div>

      <div className="card3d overflow-hidden bg-white/[.07]">
        <div className="relative bg-black pt-[56.25%]">
          {play && isOpen(cur) ? (
            <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${cur.yt}?autoplay=1&rel=0`} title={t.name}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <button onClick={() => isOpen(cur) && setPlay(true)} className="group absolute inset-0 h-full w-full" aria-label={ko ? '재생' : 'Play'}>
              <img src={asset(`rooms/${cur.id}.jpg`)} alt={t.name} className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/10">
                {isOpen(cur)
                  ? <span className="btn3d btn-pink text-[22px]">▶ {ko ? '틀기' : 'Play'}</span>
                  : <span className="rounded-full bg-black/70 px-5 py-2 text-lg">🔔 {when(cur, ko)}</span>}
              </span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 p-5">
          <div className="min-w-0">
            <h2 className="font-heading text-[clamp(26px,3.5vw,36px)] leading-tight text-yellow-200">{cur.icon} {t.name}</h2>
            <div className="mt-1 font-semibold text-cyan-200">{t.len}</div>
            <p className="mt-2 max-w-xl text-white/80">{t.text}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {cur.id === 'color' && (ko
              ? <a href="https://bookk.co.kr/bookStore/6adf2a7810737740c801cbbc" target="_blank" rel="noopener" className="btn3d btn-yellow text-[15px]">📖 모치 컬러링북 · 부크크</a>
              : <a href="https://www.amazon.com/author/mochicatsongs" target="_blank" rel="noopener" className="btn3d btn-yellow text-[15px]">📖 Mochi coloring books · Amazon</a>)}
            <a href={`https://youtu.be/${cur.yt}`} target="_blank" rel="noopener" className="btn3d btn-white text-[15px]">{ko ? 'YouTube에서 보기 ↗' : 'Open on YouTube ↗'}</a>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-white/55">{ko ? '음악과 그림은 AI 도구로 만들고 직접 다듬었어요.' : 'Music and visuals were made with AI tools and edited by hand.'}</p>
      <div className="mt-8"><Pill href={ARTIST.subscribe} i={0}>{ko ? 'YouTube 구독하기' : 'Subscribe on YouTube'}</Pill></div>
    </Page>
  )
}
