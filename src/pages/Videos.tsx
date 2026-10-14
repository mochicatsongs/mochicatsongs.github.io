import { Link } from 'react-router-dom'
import { H1, Page, Pill } from '../components/Section'
import { ARTIST, SONGS, fmtDate, isLive } from '../data/songs'

export default function Videos() {
  const vids = SONGS.filter(s => s.youtube)
  const live = vids.filter(s => isLive(s.premiere))
  const soon = vids.filter(s => !isLive(s.premiere)).sort((a, b) => a.premiere!.localeCompare(b.premiere!))
  return (
    <Page>
      <H1>Music videos</H1>
      <p className="-mt-4 mb-8 text-lg text-white/70">A new Mochi music video every Friday at 00:00 KST.</p>
      <div className="grid gap-6 md:grid-cols-2">
        {live.map(s => (
          <div key={s.slug}>
            <div className="relative overflow-hidden rounded-2xl bg-black pt-[56.25%]">
              <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${s.youtube}`} title={s.title} loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
            <Link to={`/music/${s.slug}`} className="mt-2 block text-lg hover:underline">{s.title}</Link>
          </div>
        ))}
      </div>
      {soon.length > 0 && (<>
        <h2 className="mb-4 mt-14 text-2xl font-medium">Coming soon</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {soon.map(s => (
            <a key={s.slug} href={`https://youtu.be/${s.youtube}`} target="_blank" rel="noopener" className="rounded-2xl border border-white/15 p-5 hover:bg-white/5">
              <div className="text-xl">{s.title}</div>
              <div className="text-white/55">Premiere · {fmtDate(s.premiere!)} · 00:00 KST · set a reminder 🔔</div>
            </a>
          ))}
        </div>
      </>)}
      <div className="mt-12"><Pill href={ARTIST.subscribe} solid>Subscribe on YouTube</Pill></div>
    </Page>
  )
}
