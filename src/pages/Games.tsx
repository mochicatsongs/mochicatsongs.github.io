import { useT } from '../i18n'
import { Link } from 'react-router-dom'
import { H1, Page } from '../components/Section'
import { cover } from '../data/songs'
import { GAME_LIST } from '../data/games'
import { FeedbackCard } from '../components/Feedback'

const BEST = (slug: string) => { try { return Number(localStorage.getItem(slug === 'catch-the-dot' ? 'ctd-best' : `game-best:${slug}`) || 0) } catch { return 0 } }
const GRAD = ['from-pink-500 to-violet-600', 'from-cyan-400 to-blue-600', 'from-lime-400 to-emerald-600', 'from-amber-400 to-orange-600', 'from-fuchsia-500 to-rose-600', 'from-violet-500 to-indigo-700']

export default function Games() {
  const t = useT()
  return (
    <Page>
      <H1 color="t3d-lime">{t('Games')}</H1>
      <p className="-mt-4 mb-8 text-white/70">{t('One game for every Mochi song — with the song playing. Beat your best score!')}</p>
      <a href="/pocha/" className="card3d group relative mb-6 flex flex-col items-center gap-4 overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-violet-700 p-4 sm:flex-row sm:p-6">
        <img src="/images/pocha_banner.webp" alt="" loading="lazy" className="aspect-video w-full rounded-2xl object-cover shadow-lg transition group-hover:scale-[1.02] sm:w-1/2" />
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <span className="mb-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-600">{t('New game')}</span>
          <div className="t3d text-[34px] leading-tight sm:text-[44px]">{t("Mochi's Pocha")}</div>
          <p className="mt-2 text-sm text-white/90 sm:text-base">{t('Merge food, serve the neighbours and decorate a cozy Seoul street-food tent — plus 8 mini-games with Mochi’s songs.')}</p>
          <span className="btn3d btn-yellow mt-4 text-[18px]">{t('🏮 Play free')}</span>
        </div>
      </a>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {GAME_LIST.map((g, i) => {
          const best = BEST(g.slug)
          return (
            <Link key={g.slug} to={`/games/${g.slug}`} className={`card3d group relative flex flex-col overflow-hidden bg-gradient-to-br ${GRAD[i % GRAD.length]} p-3 sm:p-4`}>
              <div className="relative">
                <img src={cover(g.song)} alt="" loading="lazy" className="aspect-square w-full rounded-2xl object-cover shadow-lg transition group-hover:scale-[1.03]" />
                <span className="absolute -bottom-3 -right-2 text-[38px] drop-shadow-lg transition group-hover:-translate-y-1 group-hover:rotate-12 sm:text-[46px]">{g.emoji}</span>
              </div>
              <div className="t3d-sm mt-3 text-[20px] leading-tight sm:text-[24px]">{g.name}</div>
              <div className="mt-1 line-clamp-2 text-[13px] text-white/80 sm:text-sm">{t(g.desc)}</div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="btn3d btn-yellow !px-3 !py-1.5 text-[14px]">{t('▶ Play')}</span>
                {best > 0 && <span className="text-xs text-white/80">🏆 {best}</span>}
              </div>
              <div className="mt-2 truncate text-[11px] text-white/60">🎵 {g.song.title}</div>
            </Link>
          )
        })}
      </div>
      <FeedbackCard text="Played a game? Tell us about bugs or ideas — we read every message." />
    </Page>
  )
}
