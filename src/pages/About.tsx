import { H1, Page } from '../components/Section'
import { useLang, useT } from '../i18n'

export default function About() {
  const t = useT()
  const { lang } = useLang()
  return (
    <Page>
      <H1>{t('About Mochi')}</H1>
      {lang === 'ko' ? (
        <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-white/85">
          <p>모치는 빨간 반다나를 두른 통통한 회색 고양이예요. 간식을 정말 좋아하지만, 언제나 댄스 플로어를 선택하죠. 서울로 이사 와서 새로운 언어를 배우고, 한 번 시작한 일은 끝까지 해내요.</p>
          <p>모치의 노래와 이야기는 서울의 진짜 일상, 실제 있었던 일에서 시작됐어요 — 출퇴근길, 퇴근 후 카페, 비 오는 버스 정류장, 커가는 가족, 그리고 하루를 조금 더 낫게 만드는 작은 성취들.</p>
          <p>모든 노래에는 춤이 있어요: 빨간 점을 잡고, 네온 할로윈 파티에서 점프하고, 배를 통통 튕기고, 밤이 어두워지면 반짝반짝 빛나요. 모두를 위한 기분 좋은 음악!</p>
          <p className="text-base text-white/55">{t('Music and visuals are made with AI tools; characters, stories, lyrics and editing by the Mochi Cat team.')}</p>
        </div>
      ) : (
        <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-white/85">
          <p>Mochi is a chubby grey cat in a red bandana who loves snacks — but always chooses the dance floor. He moved to Seoul, learned a new language, and never gives up: whatever Mochi starts, he finishes.</p>
          <p>Mochi's songs and stories are based on real events from everyday life in Seoul: commutes, after-work cafés, rainy bus stops, a growing family and the small wins that make a day better.</p>
          <p>Every song comes with a dance: catch the red dot, jump into a neon Halloween party, bounce your belly, or shine when the night gets dark. Feel-good vibes for everyone.</p>
          <p className="text-base text-white/55">{t('Music and visuals are made with AI tools; characters, stories, lyrics and editing by the Mochi Cat team.')}</p>
        </div>
      )}
    </Page>
  )
}
