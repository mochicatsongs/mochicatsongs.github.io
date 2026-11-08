import { useState } from 'react'
import { useLang, useT } from '../i18n'
import SongCard from '../components/SongCard'
import { H1, Page, Pill } from '../components/Section'
import { ARTIST, SONGS } from '../data/songs'
import { usePlayer } from '../player/PlayerContext'
import PlayButton from '../components/PlayButton'

/** mood playlists: the same songs grouped by when you'd listen to them */
const MOODS: { id: string; ko: string; en: string; slugs: string[] }[] = [
  { id: 'commute', ko: '🚇 퇴근길', en: '🚇 After work', slugs: ['last-train', 'just-tired', 'friday-mode', 'payday', 'its-okay-to-say-no', 'small-wins', 'rainy-day-smile', 'still-dreaming', 'good-morning-seoul', 'seoul-is-my-home'] },
  { id: 'comfort', ko: '🫂 위로가 필요할 때', en: '🫂 When you need comfort', slugs: ['not-your-fault', 'breathe', 'just-tired', 'brave-enough', 'never-too-late', 'call-home', 'we-made-it-through', 'all-the-way', 'small-wins', 'hwaiting', 'shine-like-mochi'] },
  { id: 'love', ko: '💗 설렘', en: '💗 Love', slugs: ['saranghae', 'first-snow', 'mochi-heart', 'call-home', 'meow-in-every-language'] },
  { id: 'party', ko: '🎉 신나게', en: '🎉 Party', slugs: ['friday-mode', 'neon-jump', 'mochi-dance', 'mochi-fiesta', 'mochi-mode', 'milkshake-shake', 'super-paw-rock', 'belly-bounce', 'mochi-new-year', 'mochi-christmas'] },
  { id: 'winter', ko: '❄️ 겨울', en: '❄️ Winter', slugs: ['first-snow', 'mochi-christmas', 'mochi-new-year', 'we-made-it-through', 'call-home'] },
  { id: 'cat', ko: '🐱 고양이 송', en: '🐱 Cat songs', slugs: ['the-chubby-super-cat', 'meow-meow-mochi-cat', 'catch-the-dot', 'nom-nom-nom', 'chonky-gym-cat', 'mochi-mochi-challenge', 'mochi-obby', 'mochi-farm'] },
]

export default function Music() {
  const t = useT()
  const { lang } = useLang()
  const p = usePlayer()
  const [mood, setMood] = useState<string>(() => { try { return new URLSearchParams(location.search).get('mood') ?? '' } catch { return '' } })
  const M = MOODS.find(m => m.id === mood)
  const list = M ? M.slugs.map(s => SONGS.find(x => x.slug === s)!).filter(Boolean) : SONGS
  const pick = (id: string) => { setMood(id); try { const u = new URL(location.href); if (id) u.searchParams.set('mood', id); else u.searchParams.delete('mood'); history.replaceState(history.state, '', u) } catch { /* ignore */ } }
  const inList = !!p.current && list.some(s => s.slug === p.current!.slug)
  return (
    <Page>
      <H1>{t('Music')}</H1>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <PlayButton playing={p.playing && inList} onClick={() => (inList ? p.toggle() : p.play(list[0], M ? list : []))} label={p.playing && inList ? t('Playing') : M ? (lang === 'ko' ? `${list.length}곡 재생` : `Play ${list.length} songs`) : t('Play all')} size="text-[20px]" />
        <Pill href={ARTIST.spotify}>Spotify</Pill>
        <Pill href={ARTIST.ytMusic} i={1}>YouTube Music</Pill>
      </div>
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Moods">
        <button type="button" onClick={() => pick('')} className={`rounded-full border px-4 py-2 text-[15px] ${!M ? 'border-yellow-300 bg-yellow-300 font-medium text-[#2b2f6b]' : 'border-white/20 text-white/80 hover:bg-white/10'}`}>{lang === 'ko' ? `전체 ${SONGS.length}곡` : `All ${SONGS.length}`}</button>
        {MOODS.map(m => (
          <button key={m.id} type="button" onClick={() => pick(m.id)} className={`rounded-full border px-4 py-2 text-[15px] ${mood === m.id ? 'border-yellow-300 bg-yellow-300 font-medium text-[#2b2f6b]' : 'border-white/20 text-white/80 hover:bg-white/10'}`}>{lang === 'ko' ? m.ko : m.en}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">{list.map(s => <SongCard key={s.slug} song={s} list={M ? list : undefined} />)}</div>
    </Page>
  )
}
