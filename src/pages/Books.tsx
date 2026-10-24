import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { H1, Page } from '../components/Section'
import Reveal from '../components/Reveal'
import { asset } from '../data/songs'
import { useLang, useT } from '../i18n'

/** Coloring books: printable PDFs (Gumroad worldwide, Naver Smart Store in Korea); paperbacks coming soon. */
const NAVER_LIVE = false // Naver links hidden until the public (channel) product numbers are confirmed
type Book = { id: 'adult' | 'kids'; title: string; titleKo: string; sub: string; points: string[]; gumroad: string; naver: string }
const BOOKS: Book[] = [
  {
    id: 'adult', title: 'Cozy Cat: Mochi After Work in Korea', titleKo: '퇴근 후, 모치와 한국 여행',
    sub: 'A cozy coloring book for grown-ups',
    points: ['40 calm scenes of everyday Korea — street food, rainy bus stops, hanok villages, Jeju', 'One scene per page, easy to print on A4 or Letter', 'A Korean word and a tiny cultural fact on every page', 'Color along to Mochi’s music with the QR codes'],
    gumroad: 'https://mochicatsongs.gumroad.com/l/yuwhhq',
    naver: 'https://smartstore.naver.com/mochicatsongs/products/13829250208',
  },
  {
    id: 'kids', title: 'Mochi Cat Coloring Book for Kids', titleKo: '모치랑 색칠하고 영어 놀이!',
    sub: 'Bold, easy pages for ages 4–8',
    points: ['44 big, simple pictures with thick lines', 'A fun move to do on every page', 'Mazes, dot-to-dot, spot the difference and a bingo', 'Print your favorite pages again and again'],
    gumroad: 'https://mochicatsongs.gumroad.com/l/ggaofw',
    naver: 'https://smartstore.naver.com/mochicatsongs/products/13829264388',
  },
]

export default function Books() {
  const t = useT()
  const { lang } = useLang()
  useEffect(() => { document.title = 'Mochi Cat Coloring Books 🎨'; return () => { document.title = 'Mochi Cat 🐾 — the chubbiest pop star' } }, [])
  return (
    <Page>
      <H1 color="t3d-pink">{t('Coloring Books')}</H1>
      <p className="-mt-4 mb-10 max-w-2xl text-lg text-white/80">{t('Color with Mochi! Instant printable PDFs — download right after checkout and print your favorite pages as many times as you like.')}</p>
      <div className="mb-10"><Link to="/free-coloring-pages" className="btn3d btn-lime text-[17px]">{t('🎁 Try free pages first')}</Link></div>
      <div className="grid gap-8 md:grid-cols-2">
        {BOOKS.map((b, i) => (
          <Reveal key={b.id} delay={i * 90}>
            <article className="card3d flex h-full flex-col bg-white/[.07] p-5">
              <img src={asset(`books/${b.id}-${lang === 'ko' && NAVER_LIVE ? 'ko' : 'en'}.jpg`)} alt={lang === 'ko' ? b.titleKo : b.title} loading="lazy" className="mb-5 aspect-square w-full rounded-2xl object-cover" />
              <h2 className="font-heading text-[clamp(24px,3vw,32px)] leading-tight tracking-wide text-yellow-200">{lang === 'ko' ? b.titleKo : b.title}</h2>
              <div className="mb-3 mt-1 font-semibold text-cyan-200">{t(b.sub)}</div>
              <ul className="mb-6 space-y-1.5 text-white/85">{b.points.map(p => <li key={p}>✓ {t(p)}</li>)}</ul>
              <div className="mt-auto flex flex-wrap gap-3">
                {lang === 'ko' && NAVER_LIVE
                  ? <a href={b.naver} target="_blank" rel="noopener" className="btn3d btn-lime text-[17px]">{t('🖨️ PDF in Korean · Naver')}</a>
                  : null}
                <a href={b.gumroad} target="_blank" rel="noopener" className={`btn3d ${lang === 'ko' && NAVER_LIVE ? 'btn-white text-[15px]' : 'btn-pink text-[17px]'}`}>{lang === 'ko' ? t('English PDF') + ' · $4.99' : t('🖨️ Printable PDF · $4.99')}</a>
                {lang !== 'ko' && NAVER_LIVE
                  ? <a href={b.naver} target="_blank" rel="noopener" className="btn3d btn-white text-[15px]">{t('Korean edition')}</a>
                  : null}
              </div>
              <div className="mt-4 text-sm text-white/55">{!NAVER_LIVE && lang === 'ko' ? t('📖 Korean PDF & paperback: coming soon') : t('📖 Paperback: coming soon')}</div>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="mt-12 text-sm text-white/55">{t('Pictures were made with AI tools and edited for coloring. For personal and home use.')}</p>
    </Page>
  )
}
