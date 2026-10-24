import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { H1, Page } from '../components/Section'
import Reveal from '../components/Reveal'
import { asset } from '../data/songs'
import { useT } from '../i18n'

/** Free printable coloring pages (SEO + Pinterest landing). Each card: preview + direct PDF. CTA to the full books. */
type Free = { file: string; title: string }
const ADULT: Free[] = [
  { file: 'adult-8', title: 'Giant Bibimbap in Jeonju' },
  { file: 'adult-29', title: 'Tteokbokki in the Street Tent' },
  { file: 'adult-33', title: 'Ride Along the Han River' },
]
const KIDS: Free[] = [
  { file: 'kids-1', title: 'Mochi Loves Snacks!' },
  { file: 'kids-2', title: 'Mochi Plays the Piano!' },
  { file: 'kids-3', title: 'Hello, Seoul!' },
]

function Grid({ items, cta, href }: { items: Free[]; cta: string; href: string }) {
  const t = useT()
  return (
    <>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {items.map((f, i) => (
          <Reveal key={f.file} delay={i * 70}>
            <a href={asset(`free/${f.file}.pdf`)} target="_blank" rel="noopener" className="card3d group flex h-full flex-col bg-white/[.07] p-3 text-center">
              <img src={asset(`free/${f.file}.jpg`)} alt={`Free printable coloring page: ${f.title}`} loading="lazy" className="mb-3 w-full rounded-xl bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
              <div className="mb-2 font-semibold text-white/90">{f.title}</div>
              <span className="btn3d btn-white mt-auto !px-3 !py-1 text-[14px]">⬇ {t('Free PDF')}</span>
            </a>
          </Reveal>
        ))}
      </div>
      <div className="mt-6"><a href={href} target="_blank" rel="noopener" className="btn3d btn-pink text-[17px]">{t(cta)}</a></div>
    </>
  )
}

export default function FreePages() {
  const t = useT()
  useEffect(() => { document.title = 'Free Cat Coloring Pages — printable PDF | Mochi Cat'; return () => { document.title = 'Mochi Cat 🐾 — the chubbiest pop star' } }, [])
  return (
    <Page>
      <H1 color="t3d-pink">{t('Free Coloring Pages')}</H1>
      <p className="-mt-4 mb-10 max-w-2xl text-lg text-white/80">{t('Print and color Mochi, the chubby grey cat, for free! Tap a page to open the PDF, then print it at “Actual size” on A4 or Letter.')}</p>
      <h2 className="t3d-sm t3d-cyan mb-6 text-[clamp(28px,4vw,40px)]">{t('Cozy Korea · for grown-ups')}</h2>
      <Grid items={ADULT} cta="40 more pages · Cozy Cat PDF $4.99" href="https://mochicatsongs.gumroad.com/l/yuwhhq" />
      <h2 className="t3d-sm t3d-lime mb-6 mt-16 text-[clamp(28px,4vw,40px)]">{t('Bold & easy · for kids 4–8')}</h2>
      <Grid items={KIDS} cta="44 more pages + activities · Kids PDF $4.99" href="https://mochicatsongs.gumroad.com/l/ggaofw" />
      <p className="mt-14 text-sm text-white/55">{t('Free for personal and classroom use. Please share a link to this page instead of the files.')} · <Link to="/books" className="underline hover:text-white">{t('All coloring books')}</Link></p>
    </Page>
  )
}
