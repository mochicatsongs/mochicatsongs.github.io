import { blob, clamp, emo, GameDef, lerp, mochi, pick, rnd, rrect, text } from './engine'

/* helpers shared by catcher-style games */
const ctrlX = (a: { ptr: { x: number; used: boolean }; keys: Set<string>; dt: number; U: number; W: number }, cur: number, speed = 90) => {
  if (a.keys.has('ArrowLeft')) return clamp(cur - speed * a.U * a.dt, 0, a.W)
  if (a.keys.has('ArrowRight')) return clamp(cur + speed * a.U * a.dt, 0, a.W)
  return a.ptr.used ? lerp(cur, a.ptr.x, Math.min(1, a.dt * 14)) : cur
}
const stars = (g: CanvasRenderingContext2D, W: number, H: number, t: number, n = 40) => {
  for (let i = 0; i < n; i++) {
    const x = (i * 97.3) % W, y = (i * 53.7) % (H * 0.8), a = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i))
    g.globalAlpha = a; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 1.4, 0, 7); g.fill()
  }
  g.globalAlpha = 1
}

/* 1 ─ Shine Like Mochi: catch the falling stars, dodge the lightning */
type Fall = { x: number; y: number; v: number; k: string; r: number }
const shine: GameDef<{ x: number; items: Fall[]; next: number; glow: number }> = {
  slug: 'shine-like-mochi', name: 'Star Catcher', emoji: '⭐', mode: 'lives', lives: 3, bg: ['#1b1050', '#05030f'],
  desc: 'Catch the falling stars and light up the night.',
  how: 'Move Mochi left and right. Catch ⭐ stars, dodge ⚡ storm clouds!',
  init: a => ({ x: a.W / 2, items: [], next: 0.5, glow: 0 }),
  update(s, a) {
    s.x = ctrlX(a, s.x); s.glow = Math.max(0, s.glow - a.dt * 2)
    s.next -= a.dt
    if (s.next <= 0) {
      s.next = Math.max(0.28, 0.75 - a.t * 0.008)
      const r = Math.random(), k = r < 0.22 + Math.min(0.15, a.t * 0.003) ? '⚡' : r < 0.3 ? '🌟' : '⭐'
      s.items.push({ x: rnd(a.U * 8, a.W - a.U * 8), y: -a.U * 8, v: a.U * rnd(28, 40) * (1 + a.t * 0.015), k, r: 0 })
    }
    const my = a.H - a.U * 16
    for (const it of s.items) {
      it.y += it.v * a.dt; it.r += a.dt * 2
      if (Math.abs(it.y - my) < a.U * 9 && Math.abs(it.x - s.x) < a.U * 12) {
        it.y = 1e9
        if (it.k === '⚡') a.miss(s.x, my - a.U * 10, 'ZAP!')
        else { a.add(it.k === '🌟' ? 3 : 1, it.x, my - a.U * 12); s.glow = 1; a.burst(it.x, my - a.U * 6, '#ffd84a', 8) }
      }
    }
    s.items = s.items.filter(i => i.y < a.H + a.U * 10)
  },
  draw(s, g, a) {
    stars(g, a.W, a.H, a.t)
    g.fillStyle = '#120a33'; g.fillRect(0, a.H - a.U * 5, a.W, a.U * 5)
    for (const it of s.items) {
      if (it.k === '⚡') { emo(g, '🌩️', it.x, it.y, a.U * 13) } else emo(g, it.k, it.x, it.y, a.U * (it.k === '🌟' ? 12 : 9), Math.sin(it.r) * 0.3)
    }
    if (s.glow) { const gr = g.createRadialGradient(s.x, a.H - a.U * 16, 0, s.x, a.H - a.U * 16, a.U * 25); gr.addColorStop(0, `rgba(255,220,90,${0.5 * s.glow})`); gr.addColorStop(1, 'rgba(255,220,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, a.W, a.H) }
    mochi(g, s.glow > 0.3 ? a.sp.happy : a.sp.idle, s.x, a.H - a.U * 16, a.U * 22)
  },
}

/* 2 ─ Neon Jump: bounce up neon platforms */
type Plat = { x: number; y: number; w: number; vx: number; pump: boolean; c: string }
const NEON = ['#ff2bd6', '#2bf3ff', '#a6ff2b', '#ffb82b', '#a855f7']
const neon: GameDef<{ x: number; y: number; vy: number; plats: Plat[]; cam: number; top: number; face: number }> = {
  slug: 'neon-jump', name: 'Neon Jump', emoji: '🎃', mode: 'lives', lives: 1, bg: ['#2a0b4d', '#07021a'],
  desc: 'Bounce up the neon rooftops. How high can Mochi go?',
  how: 'Mochi bounces by himself — steer left and right. Grab 🎃 for bonus points. Don’t fall!',
  init(a) {
    const plats: Plat[] = [{ x: a.W / 2 - a.U * 14, y: a.H - a.U * 8, w: a.U * 28, vx: 0, pump: false, c: NEON[0] }]
    let y = a.H - a.U * 8
    while (y > -a.H) { y -= rnd(a.U * 12, a.U * 18); plats.push({ x: rnd(0, a.W - a.U * 22), y, w: a.U * 22, vx: 0, pump: Math.random() < 0.1, c: pick(NEON) }) }
    return { x: a.W / 2, y: a.H - a.U * 20, vy: -a.U * 100, plats, cam: 0, top: 0, face: 1 }
  },
  update(s, a) {
    const G = a.U * 260, nx = ctrlX(a, s.x, 110)
    if (Math.abs(nx - s.x) > 0.5) s.face = nx > s.x ? 1 : -1
    s.x = nx
    if (s.x < 0) s.x += a.W; if (s.x > a.W) s.x -= a.W
    const py = s.y; s.vy += G * a.dt; s.y += s.vy * a.dt
    for (const p of s.plats) {
      p.x += p.vx * a.dt; if (p.x < 0 || p.x + p.w > a.W) p.vx *= -1
      const feet = a.U * 9
      if (s.vy > 0 && py + feet <= p.y && s.y + feet >= p.y && s.x > p.x - a.U * 4 && s.x < p.x + p.w + a.U * 4) {
        s.vy = -a.U * 125; s.y = p.y - feet; a.sfx('hit', 500 + Math.random() * 200)
        if (p.pump) { p.pump = false; a.add(10, s.x, s.y - a.U * 10, '🎃 +10'); a.burst(s.x, p.y, '#ffb82b', 12) }
      }
    }
    // camera: keep Mochi in the upper 40%
    const lim = a.H * 0.4
    if (s.y < lim) {
      const d = lim - s.y; s.y = lim; for (const p of s.plats) p.y += d; s.cam += d
      const h = Math.floor(s.cam / (a.U * 5)); if (h > s.top) { a.add(h - s.top); s.top = h }
    }
    s.plats = s.plats.filter(p => p.y < a.H + a.U * 10)
    let minY = Math.min(...s.plats.map(p => p.y))
    const hard = Math.min(1, s.cam / (a.H * 20))
    while (minY > -a.U * 20) {
      minY -= rnd(a.U * (12 + hard * 6), a.U * (18 + hard * 8))
      const w = a.U * (22 - hard * 8)
      s.plats.push({ x: rnd(0, a.W - w), y: minY, w, vx: Math.random() < 0.15 + hard * 0.35 ? a.U * rnd(15, 30) : 0, pump: Math.random() < 0.1, c: pick(NEON) })
    }
    if (s.y > a.H + a.U * 10) a.over()
  },
  draw(s, g, a) {
    // city skyline parallax
    g.fillStyle = 'rgba(120,40,200,.25)'
    for (let i = 0; i < 8; i++) { const h = a.U * (20 + ((i * 37) % 30)); g.fillRect(i * a.W / 8, a.H - h + (s.cam * 0.05) % a.U, a.W / 8 - 2, h) }
    for (const p of s.plats) {
      blob(g, p.x, p.y, p.w, a.U * 3.2, p.c, a.U * 1.6, a.U * 4)
      if (p.pump) emo(g, '🎃', p.x + p.w / 2, p.y - a.U * 4, a.U * 7)
    }
    mochi(g, s.vy < 0 ? a.sp.jump : a.sp.happy, s.x, s.y, a.U * 18, { flip: s.face < 0, squash: s.vy < -a.U * 100 ? -0.08 : 0 })
  },
}

/* 3 ─ Meow in Every Language: memory pairs */
const MEOWS: [string, string][] = [['Meow', 'USA'], ['야옹', 'Korea'], ['にゃー', 'Japan'], ['Miaou', 'France'], ['Miao', 'Italy'], ['Miau', 'Spain'], ['Мяу', 'Russia'], ['喵', 'China'], ['Miau', 'Germany'], ['Miyav', 'Türkiye']]
type Card = { i: number; open: number; done: boolean; c: string }
const CARD_COLORS = ['#ff4fa3', '#22c3ee', '#a3e635', '#fbbf24', '#a855f7', '#fb923c', '#f43f5e', '#14b8a6', '#60a5fa', '#e879f9']
const meowMatch: GameDef<{ cards: Card[]; sel: number[]; wait: number; round: number }> = {
  slug: 'meow-in-every-language', name: 'Meow Match', emoji: '🌍', mode: 'time', seconds: 75, bg: ['#0f3d5c', '#081526'],
  desc: 'Match the meows from around the world.',
  how: 'Flip two cards. Find the same “meow” from the same country. Clear the board for a time bonus!',
  init: () => ({ cards: [], sel: [], wait: 0, round: 0 }),
  update(s, a) {
    if (!s.cards.length || s.cards.every(c => c.done)) {
      if (s.cards.length) { a.add(5, a.W / 2, a.H / 2, 'BOARD +5'); a.sfx('big') }
      s.round++
      const ids = [...Array(MEOWS.length).keys()].sort(() => Math.random() - 0.5).slice(0, 8)
      s.cards = [...ids, ...ids].sort(() => Math.random() - 0.5).map(i => ({ i, open: 0, done: false, c: CARD_COLORS[i] }))
    }
    for (const c of s.cards) c.open = lerp(c.open, c.done || s.sel.includes(s.cards.indexOf(c)) ? 1 : 0, Math.min(1, a.dt * 12))
    if (s.wait > 0) {
      s.wait -= a.dt
      if (s.wait <= 0) {
        const [p, q] = s.sel.map(i => s.cards[i])
        if (p.i === q.i) { p.done = q.done = true; a.add(2) } else a.sfx('miss')
        s.sel = []
      }
    }
  },
  tap(s, x, y, a) {
    if (s.wait > 0) return
    const L = layout(a), col = Math.floor((x - L.x0) / L.cw), row = Math.floor((y - L.y0) / L.ch)
    if (col < 0 || col > 3 || row < 0 || row > 3) return
    const i = row * 4 + col, c = s.cards[i]
    if (!c || c.done || s.sel.includes(i)) return
    s.sel.push(i); a.tone(500 + c.i * 60, 0.08)
    if (s.sel.length === 2) s.wait = 0.55
  },
  draw(s, g, a) {
    const L = layout(a)
    s.cards.forEach((c, i) => {
      const x = L.x0 + (i % 4) * L.cw + L.cw / 2, y = L.y0 + Math.floor(i / 4) * L.ch + L.ch / 2
      const w = (L.cw - a.U * 2) * Math.abs(Math.cos(c.open * Math.PI)), h = L.ch - a.U * 2
      const front = c.open > 0.5
      g.globalAlpha = c.done ? 0.55 : 1
      blob(g, x - w / 2, y - h / 2, w, h, front ? c.c : '#3b2a7a', a.U * 3)
      if (w > a.U * 4) {
        if (front) { text(g, MEOWS[c.i][0], x, y - a.U * 2, a.U * (MEOWS[c.i][0].length > 4 ? 4.5 : 6)); text(g, a.tr(MEOWS[c.i][1]), x, y + h * 0.3, a.U * 3, '#fff') }
        else emo(g, '🐾', x, y, a.U * 8)
      }
      g.globalAlpha = 1
    })
  },
}
const layout = (a: { W: number; H: number; U: number }) => {
  const size = Math.min(a.W - a.U * 6, a.H - a.U * 6), cw = size / 4
  return { x0: (a.W - size) / 2, y0: (a.H - size) / 2, cw, ch: cw }
}

/* 4 ─ The Chubby Super Cat: flappy flight between towers */
type Tower = { x: number; gap: number; passed: boolean; c: string }
const superCat: GameDef<{ y: number; vy: number; towers: Tower[]; dist: number; started: boolean }> = {
  slug: 'the-chubby-super-cat', name: 'Super Cat Flight', emoji: '🦸', mode: 'lives', lives: 1, bg: ['#3aa0ff', '#a5e4ff'],
  desc: 'Super Mochi flies between the towers. Snacks can wait!',
  how: 'Tap (or press space) to flap up. Fly through the gaps between the towers.',
  init: a => ({ y: a.H * 0.45, vy: 0, towers: [], dist: 0, started: false }),
  update(s, a) {
    const sp = a.U * (38 + Math.min(25, a.t * 0.6)), G = a.U * 190, gapH = a.U * Math.max(30, 40 - a.t * 0.25), x0 = a.W * 0.28, r = a.U * 6
    s.vy += G * a.dt; s.y += s.vy * a.dt
    s.dist += sp * a.dt
    const last = s.towers[s.towers.length - 1]
    if (!last || last.x < a.W - a.U * 50) s.towers.push({ x: a.W + a.U * 10, gap: rnd(a.H * 0.25, a.H * 0.75), passed: false, c: pick(['#ff6fb5', '#ffd23f', '#7cf29c', '#b48cff']) })
    for (const t of s.towers) {
      t.x -= sp * a.dt
      if (!t.passed && t.x + a.U * 7 < x0) { t.passed = true; a.add(1, x0, s.y - a.U * 10); a.sfx('hit', 700) }
      if (Math.abs(t.x - x0) < a.U * 7 + r && Math.abs(s.y - t.gap) > gapH / 2 - r) { a.burst(x0, s.y, '#ff4a4a', 14); a.over() }
    }
    s.towers = s.towers.filter(t => t.x > -a.U * 20)
    if (s.y > a.H - a.U * 4 || s.y < 0) { a.burst(x0, s.y, '#ff4a4a', 14); a.over() }
  },
  tap(s, _x, _y, a) { s.vy = -a.U * 62; a.tone(660, 0.05, 'triangle') },
  key(s, k, a) { if (k === ' ' || k === 'ArrowUp') this.tap!(s, 0, 0, a) },
  draw(s, g, a) {
    // clouds
    for (let i = 0; i < 5; i++) emo(g, '☁️', ((i * 140 - s.dist * 0.3) % (a.W + 200) + a.W + 200) % (a.W + 200) - 100, a.U * (12 + i * 14), a.U * 14)
    const gapH = a.U * Math.max(30, 40 - a.t * 0.25)
    for (const t of s.towers) {
      blob(g, t.x - a.U * 7, -a.U * 5, a.U * 14, t.gap - gapH / 2 + a.U * 5, t.c, a.U * 3)
      blob(g, t.x - a.U * 7, t.gap + gapH / 2, a.U * 14, a.H, t.c, a.U * 3)
      for (let y = t.gap + gapH / 2 + a.U * 6; y < a.H; y += a.U * 8) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(t.x - a.U * 3, y, a.U * 6, a.U * 3) }
    }
    g.fillStyle = '#4ade80'; g.fillRect(0, a.H - a.U * 4, a.W, a.U * 4)
    const x0 = a.W * 0.28
    // cape
    g.fillStyle = '#e11d48'; g.beginPath(); g.moveTo(x0 - a.U * 2, s.y - a.U * 3); g.quadraticCurveTo(x0 - a.U * 14, s.y + Math.sin(a.t * 18) * a.U * 3, x0 - a.U * 12, s.y + a.U * 6); g.lineTo(x0 + a.U * 2, s.y + a.U * 2); g.fill()
    mochi(g, a.sp.jump, x0, s.y, a.U * 15, { rot: clamp(s.vy / (a.U * 300), -0.4, 0.6) + 0.15 })
  },
}

/* 5 ─ Mochi Dance: four-lane rhythm arrows */
type Note = { l: number; y: number; hit: boolean }
const ARROWS = ['←', '↓', '↑', '→'], LANE_C = ['#ff4fa3', '#22c3ee', '#a3e635', '#fbbf24']
const dance: GameDef<{ notes: Note[]; beat: number; flash: number[]; pose: number; combo: number }> = {
  slug: 'mochi-dance', name: 'Dance Arrows', emoji: '💃', mode: 'lives', lives: 5, bg: ['#4a0e4e', '#120320'],
  desc: 'Hit the arrows on the beat and dance with Mochi.',
  how: 'Tap the lane (or use arrow keys) when an arrow reaches the glowing line. Perfect timing = more points!',
  init: () => ({ notes: [], beat: 0.6, flash: [0, 0, 0, 0], pose: 0, combo: 0 }),
  update(s, a) {
    const B = 60 / 118, sp = a.U * (42 + Math.min(30, a.t * 0.5)), hitY = a.H - a.U * 16
    s.beat -= a.dt
    if (s.beat <= 0) {
      s.beat += B * (a.t < 15 ? 2 : Math.random() < 0.6 ? 1 : 2) / (a.t > 40 ? 1.5 : 1)
      s.notes.push({ l: Math.floor(Math.random() * 4), y: -a.U * 8, hit: false }); s.pose ^= 1
    }
    for (const n of s.notes) { n.y += sp * a.dt; if (!n.hit && n.y > hitY + a.U * 12) { n.hit = true; s.combo = 0; a.miss(laneX(a, n.l), hitY, 'MISS') } }
    s.notes = s.notes.filter(n => !n.hit && n.y < a.H + a.U * 10)
    s.flash = s.flash.map(f => Math.max(0, f - a.dt * 4))
  },
  tap(s, x, _y, a) { press(s, Math.floor(x / (a.W / 4)), a) },
  key(s, k, a) { const l = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'].indexOf(k); if (l >= 0) press(s, l, a) },
  draw(s, g, a) {
    const hitY = a.H - a.U * 16
    mochi(g, s.pose ? a.sp.happy : a.sp.jump, a.W / 2, a.H * 0.42, a.U * 45, { alpha: 0.35, rot: s.pose ? 0.08 : -0.08 })
    for (let l = 0; l < 4; l++) {
      const x = laneX(a, l)
      g.fillStyle = `rgba(255,255,255,${0.04 + s.flash[l] * 0.2})`; g.fillRect(l * a.W / 4 + 2, 0, a.W / 4 - 4, a.H)
      g.strokeStyle = LANE_C[l]; g.lineWidth = a.U * 0.8; g.globalAlpha = 0.8; g.beginPath(); g.arc(x, hitY, a.U * 7, 0, 7); g.stroke(); g.globalAlpha = 1
      text(g, ARROWS[l], x, hitY, a.U * 7, 'rgba(255,255,255,.35)')
    }
    for (const n of s.notes) { const x = laneX(a, n.l); blob(g, x - a.U * 6.5, n.y - a.U * 6.5, a.U * 13, a.U * 13, LANE_C[n.l], a.U * 6.5, a.U * 3); text(g, ARROWS[n.l], x, n.y, a.U * 8) }
    if (s.combo > 2) text(g, `${s.combo} COMBO`, a.W / 2, a.U * 10, a.U * 6, '#ffe14a')
  },
}
const laneX = (a: { W: number }, l: number) => (l + 0.5) * a.W / 4
function press(s: { notes: Note[]; flash: number[]; combo: number }, l: number, a: Parameters<NonNullable<GameDef['tap']>>[3]) {
  s.flash[l] = 1
  const hitY = a.H - a.U * 16
  let best: Note | undefined, bd = 1e9
  for (const n of s.notes) if (n.l === l && !n.hit) { const d = Math.abs(n.y - hitY); if (d < bd) { bd = d; best = n } }
  if (!best || bd > a.U * 13) { a.tone(180, 0.05, 'square'); return }
  best.hit = true; s.combo++
  const perfect = bd < a.U * 5
  a.add((perfect ? 3 : 1) + Math.floor(s.combo / 10), laneX(a, l), hitY - a.U * 10, perfect ? 'PERFECT!' : 'GOOD')
  a.burst(laneX(a, l), hitY, LANE_C[l], perfect ? 12 : 6); a.tone([523, 587, 659, 784][l], 0.08, 'triangle')
}

/* 6 ─ Meow Meow: Simon-says with four singing cats */
const PADS = [{ c: '#ff4fa3', f: 523 }, { c: '#22c3ee', f: 659 }, { c: '#a3e635', f: 784 }, { c: '#fbbf24', f: 988 }]
const simon: GameDef<{ seq: number[]; i: number; phase: 'show' | 'input' | 'pause'; timer: number; lit: number; litT: number }> = {
  slug: 'meow-meow-mochi-cat', name: 'Meow Says', emoji: '🎶', mode: 'lives', lives: 1, bg: ['#29124f', '#0c0620'],
  desc: 'Listen to the meows and sing them back.',
  how: 'Watch the cats meow in order, then tap them in the same order. Every round adds one more meow!',
  init: () => ({ seq: [Math.floor(Math.random() * 4)], i: 0, phase: 'pause', timer: 0.8, lit: -1, litT: 0 }),
  update(s, a) {
    s.litT -= a.dt; if (s.litT <= 0) s.lit = -1
    s.timer -= a.dt
    const step = Math.max(0.28, 0.6 - s.seq.length * 0.025)
    if (s.phase === 'pause' && s.timer <= 0) { s.phase = 'show'; s.i = 0; s.timer = 0 }
    if (s.phase === 'show' && s.timer <= 0) {
      if (s.i >= s.seq.length) { s.phase = 'input'; s.i = 0 } else { light(s, s.seq[s.i], a, step * 0.75); s.i++; s.timer = step }
    }
  },
  tap(s, x, y, a) {
    if (s.phase !== 'input') return
    const p = padAt(a, x, y); if (p < 0) return
    light(s, p, a, 0.25)
    if (p !== s.seq[s.i]) { a.tone(140, 0.4, 'sawtooth'); a.over(); return }
    s.i++
    if (s.i >= s.seq.length) { a.add(s.seq.length, a.W / 2, a.H / 2); s.seq.push(Math.floor(Math.random() * 4)); s.phase = 'pause'; s.timer = 0.9 }
  },
  key(s, k, a) { const p = ['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].indexOf(k); if (p >= 0) { const r = padRect(a, p); this.tap!(s, r.x + r.w / 2, r.y + r.h / 2, a) } },
  draw(s, g, a) {
    for (let p = 0; p < 4; p++) {
      const r = padRect(a, p), on = s.lit === p
      blob(g, r.x, r.y, r.w, r.h, PADS[p].c, a.U * 6, on ? a.U * 10 : 0)
      if (!on) { g.fillStyle = 'rgba(0,0,0,.35)'; rrect(g, r.x, r.y, r.w, r.h, a.U * 6); g.fill() }
      mochi(g, on ? a.sp.happy : a.sp.idle, r.x + r.w / 2, r.y + r.h / 2, r.h * 0.75, { squash: on ? 0.06 : 0 })
      if (on) text(g, 'MEOW!', r.x + r.w / 2, r.y + a.U * 5, a.U * 5)
    }
    text(g, a.tr(s.phase === 'input' ? 'Your turn!' : 'Watch…'), a.W / 2, a.H / 2, a.U * 6, s.phase === 'input' ? '#a3e635' : '#fff')
  },
}
function light(s: { lit: number; litT: number }, p: number, a: { tone: (f: number, d?: number, t?: OscillatorType) => void }, d: number) { s.lit = p; s.litT = d; a.tone(PADS[p].f, d * 0.9, 'triangle') }
const padRect = (a: { W: number; H: number; U: number }, p: number) => {
  const gap = a.U * 4, w = (a.W - gap * 3) / 2, h = (a.H - gap * 3) / 2
  return { x: gap + (p % 2) * (w + gap), y: gap + Math.floor(p / 2) * (h + gap), w, h }
}
const padAt = (a: { W: number; H: number; U: number }, x: number, y: number) => { for (let p = 0; p < 4; p++) { const r = padRect(a, p); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) return p } return -1 }

/* 7 ─ Mochi Mochi Challenge: three-lane country runner */
type Obj = { l: number; y: number; k: string }
const challenge: GameDef<{ lane: number; x: number; objs: Obj[]; next: number; road: number; inv: number }> = {
  slug: 'mochi-mochi-challenge', name: 'Rodeo Run', emoji: '🤠', mode: 'lives', lives: 3, bg: ['#f6c177', '#d9822b'],
  desc: 'Line-dance down the dusty road. Dodge the cacti!',
  how: 'Tap left or right (or use arrow keys) to switch lanes. Collect 🤠 hats, dodge 🌵 and 🪨.',
  init: a => ({ lane: 1, x: a.W / 2, objs: [], next: 1, road: 0, inv: 0 }),
  update(s, a) {
    const sp = a.U * (45 + Math.min(45, a.t * 1.1)), my = a.H - a.U * 16
    s.road += sp * a.dt; s.inv = Math.max(0, s.inv - a.dt)
    s.x = lerp(s.x, laneX3(a, s.lane), Math.min(1, a.dt * 16))
    s.next -= a.dt
    if (s.next <= 0) {
      s.next = Math.max(0.35, 0.9 - a.t * 0.01)
      const l = Math.floor(Math.random() * 3)
      s.objs.push({ l, y: -a.U * 10, k: Math.random() < 0.3 ? '🤠' : pick(['🌵', '🪨', '🌵']) })
      if (a.t > 20 && Math.random() < 0.35) s.objs.push({ l: (l + 1 + Math.floor(Math.random() * 2)) % 3, y: -a.U * 10, k: '🌵' })
    }
    for (const o of s.objs) {
      o.y += sp * a.dt
      if (o.l === s.lane && Math.abs(o.y - my) < a.U * 8) {
        if (o.k === '🤠') { a.add(5, s.x, my - a.U * 10, '+5'); a.sfx('hit', 880) } else if (!s.inv) { a.miss(s.x, my - a.U * 10, 'OUCH'); s.inv = 1.2 }
        o.y = 1e9
      }
    }
    for (const o of s.objs) if (o.k !== '🤠' && o.y > a.H + a.U * 10 && o.y < 1e8) a.add(1)
    s.objs = s.objs.filter(o => o.y < a.H + a.U * 10)
  },
  tap(s, x, _y, a) { s.lane = clamp(s.lane + (x < a.W / 2 ? -1 : 1), 0, 2); a.tone(440, 0.04) },
  key(s, k, a) { if (k === 'ArrowLeft') s.lane = Math.max(0, s.lane - 1); if (k === 'ArrowRight') s.lane = Math.min(2, s.lane + 1); a.tone(440, 0.04) },
  draw(s, g, a) {
    const rw = a.W * 0.84, rx = (a.W - rw) / 2
    g.fillStyle = '#b5651d'; g.fillRect(rx, 0, rw, a.H)
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = a.U; g.setLineDash([a.U * 5, a.U * 5]); g.lineDashOffset = -s.road
    for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(rx + rw * i / 3, 0); g.lineTo(rx + rw * i / 3, a.H); g.stroke() }
    g.setLineDash([])
    for (let i = 0; i < 6; i++) { const y = ((i * a.H / 5 + s.road * 0.9) % (a.H + 60)) - 30; emo(g, '🌾', rx / 2, y, a.U * 6); emo(g, '🌾', a.W - rx / 2, (y + a.H / 3) % a.H, a.U * 6) }
    for (const o of s.objs) emo(g, o.k, laneX3(a, o.l), o.y, a.U * 11)
    const my = a.H - a.U * 16
    mochi(g, a.sp.happy, s.x, my, a.U * 18, { alpha: s.inv && Math.floor(a.t * 12) % 2 ? 0.35 : 1, rot: Math.sin(a.t * 10) * 0.08 })
    emo(g, '🤠', s.x, my - a.U * 9.5, a.U * 9)
  },
}
const laneX3 = (a: { W: number }, l: number) => a.W / 2 + (l - 1) * a.W * 0.28

/* 8 ─ Milkshake Shake: stack the scoops */
type Layer = { x: number; w: number; c: string }
const SCOOP = ['#ffb3d1', '#fff1c1', '#c69c6d', '#b8f2c9', '#d6b4ff', '#ffd6a5', '#8fd3ff']
const milkshake: GameDef<{ stack: Layer[]; cur: Layer; dir: number; off: number; drop: number; perfect: number }> = {
  slug: 'milkshake-shake', name: 'Milkshake Tower', emoji: '🥤', mode: 'lives', lives: 1, bg: ['#ffd6ec', '#ff9ccc'],
  desc: 'Stack the tallest milkshake ever!',
  how: 'Tap to drop the sliding scoop. Whatever hangs over the edge falls off. Perfect drops keep it wide!',
  init(a) { const w = a.W * 0.55; return { stack: [{ x: (a.W - w) / 2, w, c: '#ffffff' }], cur: { x: 0, w, c: SCOOP[0] }, dir: 1, off: 0, drop: 0, perfect: 0 } },
  update(s, a) {
    const sp = a.U * (40 + s.stack.length * 3.5)
    s.cur.x += s.dir * sp * a.dt
    if (s.cur.x < -s.cur.w * 0.3) s.dir = 1
    if (s.cur.x + s.cur.w > a.W + s.cur.w * 0.3) s.dir = -1
    const th = a.U * 7, want = Math.max(0, (s.stack.length + 1) * th - a.H * 0.55)
    s.off = lerp(s.off, want, Math.min(1, a.dt * 6)); s.drop = Math.max(0, s.drop - a.dt * 3)
  },
  tap(s, _x, _y, a) {
    const top = s.stack[s.stack.length - 1]
    const l = Math.max(top.x, s.cur.x), r = Math.min(top.x + top.w, s.cur.x + s.cur.w)
    const yy = a.H - a.U * 6 - s.stack.length * a.U * 7 + s.off
    if (r - l <= a.U) { a.burst(s.cur.x + s.cur.w / 2, yy, s.cur.c, 16); a.over(); return }
    const perfect = Math.abs(s.cur.x - top.x) < a.U * 1.5
    const nl: Layer = perfect ? { x: top.x, w: top.w, c: s.cur.c } : { x: l, w: r - l, c: s.cur.c }
    s.stack.push(nl); s.drop = 1
    if (perfect) { s.perfect++; a.add(2, nl.x + nl.w / 2, yy - a.U * 8, 'PERFECT!'); a.tone(880 + s.perfect * 40, 0.1, 'triangle') } else { s.perfect = 0; a.add(1, nl.x + nl.w / 2, yy - a.U * 8); a.sfx('hit', 520) }
    s.cur = { x: Math.random() < 0.5 ? -nl.w * 0.2 : a.W - nl.w * 0.8, w: nl.w, c: SCOOP[s.stack.length % SCOOP.length] }
    s.dir = s.cur.x < 0 ? 1 : -1
  },
  key(s, k, a) { if (k === ' ' || k === 'ArrowDown') this.tap!(s, 0, 0, a) },
  draw(s, g, a) {
    const th = a.U * 7, base = a.H - a.U * 6 + s.off
    // glass
    const gw = s.stack[0].w + a.U * 6
    g.fillStyle = 'rgba(255,255,255,.35)'; rrect(g, (a.W - gw) / 2, base - a.U * 2, gw, a.U * 8, a.U * 2); g.fill()
    s.stack.forEach((L, i) => { if (i) blob(g, L.x, base - i * th - th, L.w, th, L.c, th / 2) })
    const y = base - s.stack.length * th - th - a.U * 3
    blob(g, s.cur.x, y, s.cur.w, th, s.cur.c, th / 2)
    emo(g, '🍒', s.cur.x + s.cur.w / 2, y - a.U * 3, a.U * 6)
    mochi(g, s.drop > 0.5 ? a.sp.happy : a.sp.idle, a.W - a.U * 12, a.H - a.U * 12, a.U * 20)
  },
}

/* 9 ─ Chonky Gym Cat: power-meter lifting */
const gym: GameDef<{ n: number; dir: number; speed: number; zone: number; zw: number; lift: number; reps: number }> = {
  slug: 'chonky-gym-cat', name: 'Power Lift', emoji: '🏋️', mode: 'lives', lives: 3, bg: ['#1f2937', '#0b0f19'],
  desc: 'Leg day? Every day. Help Mochi lift!',
  how: 'Tap (or space) when the needle is in the green zone. Center = PERFECT. The zone gets smaller!',
  init: () => ({ n: 0, dir: 1, speed: 0.9, zone: 0.5, zw: 0.26, lift: 0, reps: 0 }),
  update(s, a) {
    s.n += s.dir * s.speed * a.dt; if (s.n > 1) { s.n = 1; s.dir = -1 } if (s.n < 0) { s.n = 0; s.dir = 1 }
    s.lift = Math.max(0, s.lift - a.dt * 1.6)
  },
  tap(s, _x, _y, a) {
    const d = Math.abs(s.n - s.zone)
    if (d < s.zw / 2) {
      const perfect = d < s.zw * 0.15
      s.reps++; s.lift = 1; a.add(perfect ? 3 : 1, a.W / 2, a.H * 0.25, perfect ? 'PERFECT REP!' : 'REP!'); a.sfx('big')
      s.speed = Math.min(2.6, s.speed + 0.08); s.zw = Math.max(0.08, s.zw - 0.012); s.zone = rnd(0.15 + s.zw / 2, 0.85 - s.zw / 2)
    } else a.miss(a.W / 2, a.H * 0.25, 'OOF')
  },
  key(s, k, a) { if (k === ' ' || k === 'ArrowUp') this.tap!(s, 0, 0, a) },
  draw(s, g, a) {
    // floor + mirror
    g.fillStyle = '#374151'; g.fillRect(0, a.H * 0.78, a.W, a.H)
    const cy = a.H * 0.52, up = s.lift > 0.3
    mochi(g, up ? a.sp.jump : a.sp.idle, a.W / 2, cy, a.U * 38)
    // barbell
    const by = up ? cy - a.U * 20 : cy - a.U * 2, bw = a.U * 60
    g.fillStyle = '#d1d5db'; g.fillRect(a.W / 2 - bw / 2, by - a.U, bw, a.U * 2)
    for (const sx of [-1, 1]) { blob(g, a.W / 2 + sx * bw / 2 - a.U * 3.5, by - a.U * 8, a.U * 7, a.U * 16, '#111827', a.U * 2); blob(g, a.W / 2 + sx * (bw / 2 - a.U * 6) - a.U * 2.5, by - a.U * 6, a.U * 5, a.U * 12, '#ef4444', a.U * 2) }
    // meter
    const mx = a.U * 8, mw = a.W - a.U * 16, my = a.H - a.U * 14, mh = a.U * 7
    blob(g, mx, my, mw, mh, '#111827', mh / 2)
    g.fillStyle = '#22c55e'; rrect(g, mx + mw * (s.zone - s.zw / 2), my, mw * s.zw, mh, a.U * 2); g.fill()
    g.fillStyle = '#86efac'; g.fillRect(mx + mw * s.zone - a.U * 0.6, my, a.U * 1.2, mh)
    g.fillStyle = '#fff'; rrect(g, mx + mw * s.n - a.U, my - a.U * 2.5, a.U * 2, mh + a.U * 5, a.U); g.fill()
    text(g, `${s.reps} ${a.tr('reps')}`, a.W / 2, a.U * 8, a.U * 6, '#fbbf24')
  },
}

export const GAMES_A = [shine, neon, meowMatch, superCat, dance, simon, challenge, milkshake, gym]
