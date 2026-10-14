import { H1, Page, Pill } from '../components/Section'
import Reveal from '../components/Reveal'
import { ARTIST, asset } from '../data/songs'
import { STICKERS_EN, STICKERS_KO, Sticker } from '../data/stickers'
import { useLang, useT } from '../i18n'

function Grid({ items, lang }: { items: Sticker[]; lang: string }) {
  const t = useT()
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
      {items.map((s, i) => {
        const src = asset(`stickers/${lang}/${s.id}.webp`)
        return (
          <Reveal key={s.id} delay={(i % 4) * 70}>
            <div className="group card3d relative bg-white/[.06] p-3 text-center">
              <img src={src} alt={`Mochi Cat sticker — ${s.label}`} loading="lazy" className="mx-auto aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
              <a href={src} download={`MochiCat_${s.id}.webp`} className="btn3d btn-white mt-2 !px-3 !py-1 text-[13px]">⬇ {t('Download')}</a>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

export default function Stickers() {
  const t = useT()
  const { lang } = useLang()
  const list = lang === 'ko' ? STICKERS_KO : STICKERS_EN
  return (
    <Page>
      <H1 color="t3d-yellow">{t('Stickers')}</H1>
      <p className="-mt-4 mb-3 text-[clamp(20px,3vw,28px)] font-heading tracking-wide text-yellow-200">{t('Animated 3D Mochi stickers')}</p>
      <p className="mb-8 max-w-2xl text-lg text-white/75">{t('Tap a sticker to save it, or find them on GIPHY — search')} <b>“Mochi Cat”</b> / <b>@mochicatsongs</b> {t('in Instagram Stories, TikTok and messengers.')}</p>
      <div className="mb-12"><Pill href={lang==='ko'?ARTIST.giphyKo:ARTIST.giphyEn} i={3}>{t('Open Mochi on GIPHY')}</Pill></div>
      <h2 className="t3d-sm t3d-cyan mb-6 text-[clamp(28px,4vw,40px)]">{t('Everyday')}</h2>
      <Grid items={list.filter(s => s.group === 'everyday')} lang={lang} />
      <h2 className="t3d-sm t3d-lime mb-6 mt-14 text-[clamp(28px,4vw,40px)]">{t('Holidays')}</h2>
      <Grid items={list.filter(s => s.group === 'holiday')} lang={lang} />
    </Page>
  )
}
