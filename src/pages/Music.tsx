import SongCard from '../components/SongCard'
import { H1, Page, Pill } from '../components/Section'
import { ARTIST, SONGS } from '../data/songs'
import { usePlayer } from '../player/PlayerContext'
import { PlayIcon } from '../components/Icons'

export default function Music() {
  const p = usePlayer()
  return (
    <Page>
      <H1>Music</H1>
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <button onClick={() => p.play(SONGS[0])} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-medium text-black hover:bg-white/85">
          <PlayIcon /> Play all
        </button>
        <Pill href={ARTIST.spotify}>Spotify</Pill>
        <Pill href={ARTIST.ytMusic} i={1}>YouTube Music</Pill>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">{SONGS.map(s => <SongCard key={s.slug} song={s} />)}</div>
    </Page>
  )
}
