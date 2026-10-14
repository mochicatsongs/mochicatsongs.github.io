import { H1, Page } from '../components/Section'
export default function About() {
  return (
    <Page>
      <H1>About Mochi</H1>
      <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-white/85">
        <p>Mochi is a chubby grey cat in a red bandana who loves snacks — but always chooses the dance floor. He moved to Seoul, learned a new language, and never gives up: whatever Mochi starts, he finishes.</p>
        <p>Every song comes with a dance: catch the red dot, jump into a neon Halloween party, bounce your belly, or shine when the night gets dark. Feel-good vibes for everyone.</p>
        <p className="text-base text-white/55">Music and visuals are made with AI tools; characters, stories, lyrics and editing by the Mochi Cat team.</p>
      </div>
    </Page>
  )
}
