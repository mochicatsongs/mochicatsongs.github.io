import { blob, clamp, emo, GameDef, lerp, mochi, pick, rnd, rrect, text } from './engine'

/* Level-based games for the 2026 singles: no timer — every level has a goal, 3 hearts, 1–3 stars. */

const steer = (a: { ptr: { x: number; used: boolean }; keys: Set<string>; dt: number; U: number; W: number }, cur: number, lo: number, hi: number, speed = 95) => {
  if (a.keys.has('ArrowLeft')) return clamp(cur - speed * a.U * a.dt, lo, hi)
  if (a.keys.has('ArrowRight')) return clamp(cur + speed * a.U * a.dt, lo, hi)
  return a.ptr.used ? clamp(lerp(cur, a.ptr.x, Math.min(1, a.dt * 12)), lo, hi) : cur
}

/* ─ Seoul Is My Home: “Seoul Ride” — ride the mint scooter across Seoul, dodge traffic, catch the syllables to spell Korean words */
const SEOUL_LEVELS = [
  { en: 'Incheon Airport', ko: '인천공항', word: ['안', '녕'], mean: 'hello', sky: ['#ffd1e8', '#ff9ec7'], side: ['✈️', '🧳', '🚌'] },
  { en: 'Hongdae', ko: '홍대', word: ['서', '울'], mean: 'Seoul', sky: ['#c4b5fd', '#7c3aed'], side: ['🎸', '🎤', '🛍️'] },
  { en: 'Myeongdong', ko: '명동', word: ['김', '치'], mean: 'kimchi', sky: ['#fecaca', '#f472b6'], side: ['🍢', '💄', '🏮'] },
  { en: 'Namsan', ko: '남산', word: ['라', '면'], mean: 'ramyeon', sky: ['#fde68a', '#fb923c'], side: ['🌲', '🗼', '🌳'] },
  { en: 'Gwangjang Market', ko: '광장시장', word: ['친', '구'], mean: 'friend', sky: ['#fdba74', '#ea580c'], side: ['🥟', '🏮', '🥘'] },
  { en: 'Han River', ko: '한강', word: ['한', '강'], mean: 'Han River', sky: ['#a5f3fc', '#38bdf8'], side: ['🌸', '🚲', '🌸'] },
  { en: 'Gangnam', ko: '강남', word: ['사', '랑', '해'], mean: 'I love you', sky: ['#93c5fd', '#1d4ed8'], side: ['🏢', '☕', '🏙️'] },
  { en: 'Bukchon Hanok Village', ko: '북촌 한옥마을', word: ['감', '사', '해'], mean: 'thank you', sky: ['#fcd34d', '#b45309'], side: ['🏯', '🍁', '🏮'] },
  { en: 'Lotte Tower at night', ko: '롯데타워의 밤', word: ['행', '복', '해'], mean: 'I’m happy', sky: ['#312e81', '#0b0730'], side: ['🌃', '✨', '🎆'] },
  { en: 'Home sweet home', ko: '우리 집', word: ['우', '리', '집'], mean: 'our home', sky: ['#fbcfe8', '#a855f7'], side: ['🏠', '🌙', '💡'] },
]
const DECOYS = ['가', '나', '다', '마', '바', '소', '오', '조', '토', '포', '하', '고', '두', '루', '무', '비', '시', '이', '지', '키']
type Obj = { x: number; y: number; k: 'car' | 'bus' | 'cone' | 'syl' | 'star'; e: string; s?: string; w: number; vx: number }
type SeoulS = { x: number; objs: Obj[]; road: number; next: number; nextSyl: number; idx: number; done: number; need: number; inv: number; lean: number; flash: number; L: typeof SEOUL_LEVELS[0]; lv: number }

const seoul: GameDef<SeoulS> = {
  slug: 'seoul-is-my-home', name: 'Seoul Ride', emoji: '🛵', mode: 'levels', lives: 3, bg: ['#ffd1e8', '#ff9ec7'],
  levels: SEOUL_LEVELS.map(l => ({ en: l.en, ko: l.ko })),
  desc: 'Ride across Seoul on the mint scooter and learn Korean words on the way.',
  how: 'Steer the scooter. Catch the syllables in order to spell the word, dodge 🚕 🚌 🚧. 10 places from the airport to home!',
  init: a => {
    const lv = a.level, L = SEOUL_LEVELS[lv - 1], reps = 2 + Math.floor((lv - 1) / 3)
    a.goal(0, reps, '🔤')
    return { x: a.W / 2, objs: [], road: 0, next: 1.2, nextSyl: 0.6, idx: 0, done: 0, need: reps, inv: 0, lean: 0, flash: 0, L, lv }
  },
  update(s, a) {
    const lv = s.lv, U = a.U
    const roadL = a.W * 0.14, roadR = a.W * 0.86, lane = (roadR - roadL) / 3
    const speed = U * (34 + lv * 4.5)
    const nx = steer(a, s.x, roadL + U * 6, roadR - U * 6); s.lean = clamp((nx - s.x) / (U * 2), -1, 1) * 0.25; s.x = nx
    s.road = (s.road + speed * a.dt) % (U * 20); s.inv = Math.max(0, s.inv - a.dt); s.flash = Math.max(0, s.flash - a.dt * 2)
    // traffic
    s.next -= a.dt
    if (s.next <= 0) {
      s.next = Math.max(0.42, 1.25 - lv * 0.075) * rnd(0.8, 1.2)
      const r = Math.random(), li = Math.floor(rnd(0, 3)), cx = roadL + lane * (li + 0.5)
      if (lv >= 4 && r < 0.22) s.objs.push({ x: roadL + lane * (li < 2 ? li + 1 : 2), y: -U * 20, k: 'bus', e: '🚌', w: lane * 1.7, vx: 0 })
      else if (lv >= 6 && r < 0.42) { const l2 = (li + 1 + Math.floor(rnd(0, 2))) % 3; for (const l of [li, l2]) s.objs.push({ x: roadL + lane * (l + 0.5), y: -U * 10, k: 'cone', e: '🚧', w: lane * 0.6, vx: 0 }) }
      else s.objs.push({ x: cx, y: -U * 12, k: 'car', e: pick(['🚕', '🚗', '🚙', '🚓']), w: lane * 0.7, vx: lv >= 8 && Math.random() < 0.4 ? pick([-1, 1]) * U * 9 : 0 })
    }
    // syllables (mostly the next one you need)
    s.nextSyl -= a.dt
    if (s.nextSyl <= 0) {
      s.nextSyl = rnd(0.9, 1.4) - Math.min(0.3, lv * 0.02)
      const want = s.L.word[s.idx], sy = Math.random() < 0.6 ? want : Math.random() < 0.5 ? pick(s.L.word) : pick(DECOYS)
      const li = Math.floor(rnd(0, 3))
      if (Math.random() < 0.08) s.objs.push({ x: roadL + lane * (li + 0.5), y: -U * 8, k: 'star', e: '⭐', w: lane * 0.5, vx: 0 })
      else s.objs.push({ x: roadL + lane * (li + 0.5), y: -U * 8, k: 'syl', e: '', s: sy, w: lane * 0.55, vx: 0 })
    }
    const my = a.H - U * 18
    for (const o of s.objs) {
      const v = o.k === 'car' || o.k === 'bus' ? speed * 0.72 : speed
      o.y += v * a.dt
      if (o.vx) { o.x += o.vx * a.dt; if (o.x < roadL + lane * 0.5 || o.x > roadR - lane * 0.5) o.vx *= -1 }
      const hh = o.k === 'bus' ? U * 15 : U * 7
      if (Math.abs(o.y - my) < hh && Math.abs(o.x - s.x) < o.w / 2 + U * 4) {
        if (o.k === 'syl') {
          o.y = 1e9
          if (o.s === s.L.word[s.idx]) {
            s.idx++; a.add(1, o.x, my - U * 14, o.s); a.burst(o.x, my - U * 6, '#7ef0c8', 8); a.tone(520 + s.idx * 120, 0.09)
            if (s.idx >= s.L.word.length) {
              s.idx = 0; s.done++; s.flash = 1; a.goal(s.done, s.need, '🔤'); a.pop(a.W / 2, a.H * 0.35, `${s.L.word.join('')}!`, '#fff7a8'); a.sfx('big')
              if (s.done >= s.need) a.win()
            }
          } else a.pop(o.x, my - U * 12, '✗', '#ffd1d1')
        } else if (o.k === 'star') { o.y = 1e9; a.add(3, o.x, my - U * 14, '⭐ +3'); a.burst(o.x, my - U * 6, '#ffd84a', 10) }
        else if (!s.inv) { s.inv = 1.2; a.miss(s.x, my - U * 14, o.k === 'cone' ? 'Oops!' : 'BEEP!'); a.burst(s.x, my, '#ff6b6b', 10); o.y = 1e9 }
      }
    }
    s.objs = s.objs.filter(o => o.y < a.H + U * 25)
  },
  draw(s, g, a) {
    const U = a.U, roadL = a.W * 0.14, roadR = a.W * 0.86, lane = (roadR - roadL) / 3
    const sky = g.createLinearGradient(0, 0, 0, a.H); sky.addColorStop(0, s.L.sky[0]); sky.addColorStop(1, s.L.sky[1]); g.fillStyle = sky; g.fillRect(0, 0, a.W, a.H)
    // sidewalks with scenery
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 0, roadL, a.H); g.fillRect(roadR, 0, a.W - roadR, a.H)
    for (let i = -1; i < 7; i++) { const y = ((i * U * 26 + s.road * 1.3) % (U * 182)) - U * 10; emo(g, s.L.side[(i + 7) % 3], roadL / 2, y, U * 9); emo(g, s.L.side[(i + 8) % 3], roadR + (a.W - roadR) / 2, y + U * 13, U * 9) }
    // road
    g.fillStyle = s.lv >= 9 ? '#2b2850' : '#4b5563'; g.fillRect(roadL, 0, roadR - roadL, a.H)
    g.fillStyle = '#fbbf24'; g.fillRect(roadL, 0, U * 0.8, a.H); g.fillRect(roadR - U * 0.8, 0, U * 0.8, a.H)
    g.fillStyle = 'rgba(255,255,255,.75)'
    for (let l = 1; l < 3; l++) for (let y = -U * 20 + s.road; y < a.H; y += U * 20) g.fillRect(roadL + lane * l - U * 0.5, y, U, U * 9)
    // objects
    for (const o of s.objs) {
      if (o.k === 'syl') {
        const r = U * 6.2, want = o.s === s.L.word[s.idx]
        g.save(); g.shadowColor = want ? '#7ef0c8' : 'transparent'; g.shadowBlur = want ? U * 4 : 0
        g.fillStyle = want ? '#ffffff' : 'rgba(255,255,255,.82)'; g.beginPath(); g.arc(o.x, o.y, r, 0, 7); g.fill(); g.restore()
        g.lineWidth = U * 0.8; g.strokeStyle = want ? '#10b981' : '#f472b6'; g.beginPath(); g.arc(o.x, o.y, r, 0, 7); g.stroke()
        g.font = `${U * 6.4}px "Jua","Noto Sans KR",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1f2937'; g.fillText(o.s!, o.x, o.y + U * 0.4)
      } else if (o.k === 'bus') emo(g, o.e, o.x, o.y, U * 22)
      else emo(g, o.e, o.x, o.y, o.k === 'cone' ? U * 9 : U * 12)
    }
    // Mochi on the scooter
    const my = a.H - U * 18, blink = s.inv > 0 && Math.floor(s.inv * 10) % 2 === 0
    if (!blink) {
      g.save(); g.translate(s.x, my); g.rotate(s.lean)
      emo(g, '🛵', 0, U * 4, U * 15)
      mochi(g, s.flash > 0 ? a.sp.happy : a.sp.idle, 0, -U * 6, U * 15)
      g.restore()
    }
    // word banner
    const bw = Math.min(a.W - U * 8, U * 70), bx = (a.W - bw) / 2, by = U * 3
    blob(g, bx, by, bw, U * 15, 'rgba(20,10,40,.72)', U * 4)
    const n = s.L.word.length, cw = U * 10, sx = a.W / 2 - (n - 1) * cw / 2
    s.L.word.forEach((sy, i) => {
      const got = i < s.idx, cur = i === s.idx
      g.fillStyle = got ? '#34d399' : cur ? '#fff' : 'rgba(255,255,255,.18)'; rrect(g, sx + i * cw - U * 4.2, by + U * 2, U * 8.4, U * 8.4, U * 2); g.fill()
      g.font = `${U * 6}px "Jua","Noto Sans KR",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = got || cur ? '#1f2937' : 'rgba(255,255,255,.7)'; g.fillText(sy, sx + i * cw, by + U * 6.4)
    })
    text(g, `“${s.L.mean}”`, a.W / 2, by + U * 12.6, U * 3.2, '#fde68a')
    if (s.flash) { g.fillStyle = `rgba(255,255,255,${s.flash * 0.25})`; g.fillRect(0, 0, a.W, a.H) }
  },
}

export const GAMES_C: GameDef[] = [seoul]
