import { H1, Page, Pill } from '../components/Section'
import { ARTIST } from '../data/songs'
export default function Stickers() {
  return (
    <Page>
      <H1 color="t3d-yellow">Stickers</H1>
      <p className="mb-8 max-w-xl text-lg text-white/75">24 animated Mochi stickers — hi, love, fighting (화이팅!), hungry, workout, thanks, good night… Use them in Instagram Stories, TikTok and messengers: search <b>“Mochi Cat”</b> or <b>@mochicatsongs</b> in GIPHY.</p>
      <Pill href={ARTIST.giphy} i={3}>Open Mochi on GIPHY</Pill>
    </Page>
  )
}
