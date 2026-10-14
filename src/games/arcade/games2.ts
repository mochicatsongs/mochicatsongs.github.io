import { blob, clamp, emo, GameDef, lerp, mochi, pick, rnd, text } from './engine'

const grid3 = (a: { W: number; H: number; U: number }, top = 0.14) => {
  const size = Math.min(a.W - a.U * 6, a.H * (1 - top) - a.U * 4), c = size / 3
  return { x0: (a.W - size) / 2, y0: a.H * top + (a.H * (1 - top) - size) / 2, c }
}
const cellAt = (a: { W: number; H: number; U: number }, x: number, y: number, top?: number) => {
  const L = grid3(a, top), cx = Math.floor((x - L.x0) / L.c), cy = Math.floor((y - L.y0) / L.c)
  return cx < 0 || cx > 2 || cy < 0 || cy > 2 ? -1 : cy * 3 + cx
}
const cellC = (a: { W: number; H: number; U: number }, i: number, top?: number) => { const L = grid3(a, top); return { x: L.x0 + (i % 3 + 0.5) * L.c, y: L.y0 + (Math.floor(i / 3) + 0.5) * L.c, r: L.c / 2 } }

/* 10 ─ Nom Nom Nom: tap the cat-safe snacks, never the unsafe ones */
const GOOD = ['🐟', '🍗', '🍤', '🥚', '🦐'], BAD = ['🧅', '🍫', '🍇', '🧄']
type Pop = { k: string; t: number; life: number; good: boolean } | null
const nom: GameDef<{ holes: Pop[]; next: number; chew: number }> = {
  slug: 'nom-nom-nom', name: 'Nom Nom Snack Time', emoji: '🐟', mode: 'time', seconds: 40, bg: ['#fde68a', '#f59e0b'],
  desc: 'Feed Mochi — but only cat-safe snacks!',
  how: 'Tap 🐟 🍗 🍤 🥚 fast! Never tap 🧅 🍫 🍇 🧄 — they are not for cats.',
  init: () => ({ holes: Array(9).fill(null), next: 0.4, chew: 0 }),
  update(s, a) {
    s.chew = Math.max(0, s.chew - a.dt * 3)
    s.next -= a.dt
    if (s.next <= 0) {
      s.next = Math.max(0.25, 0.7 - a.t * 0.012)
      const free = s.holes.map((h, i) => h ? -1 : i).filter(i => i >= 0)
      if (free.length) { const good = Math.random() > 0.3; s.holes[pick(free)] = { k: good ? pick(GOOD) : pick(BAD), t: 0, life: Math.max(0.65, 1.3 - a.t * 0.015), good } }
    }
    s.holes = s.holes.map(h => { if (!h) return h; h.t += a.dt; return h.t > h.life ? null : h })
  },
  tap(s, x, y, a) {
    const i = cellAt(a, x, y); if (i < 0) return
    const h = s.holes[i]; if (!h) return
    const c = cellC(a, i)
    if (h.good) { a.add(1, c.x, c.y - c.r * 0.6, 'NOM!'); a.burst(c.x, c.y, '#fff7d6', 8); s.chew = 1 } else a.miss(c.x, c.y - c.r * 0.6, a.tr('Not for cats!'))
    s.holes[i] = null
  },
  draw(s, g, a) {
    for (let i = 0; i < 9; i++) {
      const c = cellC(a, i)
      g.fillStyle = 'rgba(120,53,15,.35)'; g.beginPath(); g.ellipse(c.x, c.y + c.r * 0.45, c.r * 0.8, c.r * 0.28, 0, 0, 7); g.fill()
      const h = s.holes[i]
      if (h) { const up = Math.min(1, h.t * 8, (h.life - h.t) * 8); emo(g, h.k, c.x, c.y + c.r * 0.45 - up * c.r * 0.8, c.r * 1.0) }
      // bowl
      g.fillStyle = '#ef4444'; g.beginPath(); g.ellipse(c.x, c.y + c.r * 0.45, c.r * 0.85, c.r * 0.5, 0, 0, Math.PI); g.fill()
      g.fillStyle = '#f87171'; g.beginPath(); g.ellipse(c.x, c.y + c.r * 0.45, c.r * 0.85, c.r * 0.14, 0, 0, Math.PI * 2); g.fill()
      g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(c.x - c.r * 0.4, c.y + c.r * 0.65, c.r * 0.18, c.r * 0.07, -0.4, 0, 7); g.fill()
      text(g, '🐾', c.x, c.y + c.r * 0.72, c.r * 0.22, '#fff')
    }
    mochi(g, s.chew > 0.3 ? a.sp.happy : a.sp.idle, a.W / 2, a.U * 9, a.U * 16)
  },
}

/* 11 ─ Super Paw Rock: drum pads lighting up */
const DRUM = [{ c: '#ef4444', f: 110 }, { c: '#3b82f6', f: 165 }, { c: '#22c55e', f: 220 }, { c: '#eab308', f: 330 }]
type Hitpad = { p: number; t: number; life: number }
const drum: GameDef<{ act: Hitpad[]; next: number; flash: number[] }> = {
  slug: 'super-paw-rock', name: 'Paw Drums', emoji: '🥁', mode: 'lives', lives: 3, bg: ['#3f0d12', '#0d0204'],
  desc: 'Rock out! Hit the drums before the ring closes.',
  how: 'When a drum lights up, tap it before its ring shrinks to nothing. It gets faster — rock on!',
  init: () => ({ act: [], next: 0.6, flash: [0, 0, 0, 0] }),
  update(s, a) {
    s.flash = s.flash.map(f => Math.max(0, f - a.dt * 5))
    s.next -= a.dt
    const max = a.score > 25 ? 2 : 1
    if (s.next <= 0 && s.act.length < max) {
      const free = [0, 1, 2, 3].filter(p => !s.act.some(h => h.p === p))
      s.act.push({ p: pick(free), t: 0, life: Math.max(0.55, 1.4 - a.score * 0.02) }); s.next = Math.max(0.12, 0.45 - a.score * 0.008)
    }
    for (const h of s.act) { h.t += a.dt; if (h.t > h.life) { const r = drumRect(a, h.p); a.miss(r.x + r.w / 2, r.y + r.h / 2, 'MISS'); h.t = 1e9 } }
    s.act = s.act.filter(h => h.t < 1e8)
  },
  tap(s, x, y, a) {
    let p = -1; for (let i = 0; i < 4; i++) { const r = drumRect(a, i); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) p = i }
    if (p < 0) return
    s.flash[p] = 1; a.tone(DRUM[p].f, 0.12, 'square')
    const h = s.act.find(q => q.p === p), r = drumRect(a, p)
    if (h) { const early = h.t / h.life; a.add(early < 0.5 ? 2 : 1, r.x + r.w / 2, r.y + a.U * 4, early < 0.5 ? 'FAST!' : 'ROCK!'); a.burst(r.x + r.w / 2, r.y + r.h / 2, DRUM[p].c, 10); s.act = s.act.filter(q => q !== h) }
    else a.tone(90, 0.08, 'sawtooth')
  },
  key(s, k, a) { const p = ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'].indexOf(k); if (p >= 0) { const r = drumRect(a, p); this.tap!(s, r.x + r.w / 2, r.y + r.h / 2, a) } },
  draw(s, g, a) {
    mochi(g, s.flash.some(f => f > 0.5) ? a.sp.jump : a.sp.happy, a.W / 2, a.H / 2, a.U * 26, { rot: Math.sin(a.t * 8) * 0.1 })
    for (let p = 0; p < 4; p++) {
      const r = drumRect(a, p), h = s.act.find(q => q.p === p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = Math.min(r.w, r.h) / 2
      g.save(); g.shadowColor = DRUM[p].c; g.shadowBlur = h ? a.U * 8 : 0
      g.fillStyle = '#1f1f1f'; g.beginPath(); g.ellipse(cx, cy + rad * 0.12, rad, rad * 0.8, 0, 0, 7); g.fill()
      g.fillStyle = h || s.flash[p] ? DRUM[p].c : '#4b5563'; g.beginPath(); g.ellipse(cx, cy, rad * 0.92, rad * 0.72, 0, 0, 7); g.fill(); g.restore()
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(cx - rad * 0.2, cy - rad * 0.25, rad * 0.4, rad * 0.18, -0.3, 0, 7); g.fill()
      if (h) { g.strokeStyle = '#fff'; g.lineWidth = a.U * 1.2; g.beginPath(); g.ellipse(cx, cy, rad * (1 - h.t / h.life) + a.U * 2, (rad * (1 - h.t / h.life) + a.U * 2) * 0.78, 0, 0, 7); g.stroke() }
    }
  },
}
const drumRect = (a: { W: number; H: number; U: number }, p: number) => {
  const w = a.W * 0.42, h = a.H * 0.3, pos = [[0.04, 0.06], [0.54, 0.06], [0.04, 0.62], [0.54, 0.62]][p]
  return { x: a.W * pos[0], y: a.H * pos[1], w, h }
}

/* 12 ─ Belly Bounce: keep Mochi bouncing on the trampoline */
const bounce: GameDef<{ px: number; x: number; y: number; vx: number; vy: number; rot: number; stars: { x: number; y: number }[]; wait: number }> = {
  slug: 'belly-bounce', name: 'Belly Bounce', emoji: '🤸', mode: 'lives', lives: 3, bg: ['#a7f3d0', '#34d399'],
  desc: 'Keep Mochi bouncing with the trampoline!',
  how: 'Move the trampoline under Mochi. Every bounce = 1 point, every ⭐ = 3. Don’t let him drop!',
  init: a => ({ px: a.W / 2, x: a.W / 2, y: a.H * 0.25, vx: a.U * 18, vy: 0, rot: 0, stars: [], wait: 0.6 }),
  update(s, a) {
    if (a.keys.has('ArrowLeft')) s.px -= a.U * 110 * a.dt; else if (a.keys.has('ArrowRight')) s.px += a.U * 110 * a.dt; else if (a.ptr.used) s.px = lerp(s.px, a.ptr.x, Math.min(1, a.dt * 18))
    s.px = clamp(s.px, a.U * 12, a.W - a.U * 12)
    if (s.wait > 0) { s.wait -= a.dt; return }
    const G = a.U * (150 + Math.min(120, a.t * 2)), r = a.U * 8, ty = a.H - a.U * 12
    s.vy += G * a.dt; s.x += s.vx * a.dt; s.y += s.vy * a.dt; s.rot += s.vx * a.dt * 0.02
    if (s.x < r || s.x > a.W - r) { s.vx *= -1; s.x = clamp(s.x, r, a.W - r) }
    if (s.vy > 0 && s.y + r > ty && s.y + r < ty + a.U * 6 && Math.abs(s.x - s.px) < a.U * 16) {
      s.vy = -Math.sqrt(2 * G * a.H * 0.62); s.vx = (s.x - s.px) * 5 + rnd(-8, 8) * a.U; s.y = ty - r
      a.add(1, s.x, ty - a.U * 14, 'BOING!'); a.tone(300 + Math.random() * 100, 0.1, 'sine')
    }
    if (s.stars.length < 2 && Math.random() < a.dt) s.stars.push({ x: rnd(a.U * 10, a.W - a.U * 10), y: rnd(a.H * 0.1, a.H * 0.5) })
    s.stars = s.stars.filter(st => { if (Math.hypot(st.x - s.x, st.y - s.y) < r + a.U * 5) { a.add(3, st.x, st.y, '⭐ +3'); a.burst(st.x, st.y, '#fde047', 10); return false } return true })
    if (s.y > a.H + r) { a.miss(s.px, a.H - a.U * 20, 'OOPS'); s.x = a.W / 2; s.y = a.H * 0.2; s.vy = 0; s.vx = a.U * rnd(-20, 20); s.wait = 0.8 }
  },
  draw(s, g, a) {
    for (const st of s.stars) emo(g, '⭐', st.x, st.y, a.U * 9, Math.sin(a.t * 3) * 0.3)
    const ty = a.H - a.U * 12
    g.strokeStyle = '#1f2937'; g.lineWidth = a.U * 1.5
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(s.px + sx * a.U * 14, ty); g.lineTo(s.px + sx * a.U * 16, a.H); g.stroke() }
    blob(g, s.px - a.U * 16, ty - a.U * 1.5, a.U * 32, a.U * 4, '#2563eb', a.U * 2)
    mochi(g, s.vy < 0 ? a.sp.jump : a.sp.happy, s.x, s.y, a.U * 18, { rot: s.rot, alpha: s.wait > 0 && Math.floor(a.t * 10) % 2 ? 0.4 : 1 })
  },
}

/* 13 ─ Mochi Mode: tap the numbers in order (focus!) */
const mode: GameDef<{ n: number; nums: { v: number; x: number; y: number; c: string; done: boolean }[]; want: number; shake: number }> = {
  slug: 'mochi-mode', name: 'Focus Mode', emoji: '🔢', mode: 'time', seconds: 60, bg: ['#0e7490', '#082f49'],
  desc: 'Switch on Mochi Mode: focus and tap in order.',
  how: 'Tap the numbers in order: 1, 2, 3… as fast as you can. Each board gets bigger!',
  init: () => ({ n: 0, nums: [], want: 1, shake: 0 }),
  update(s, a) {
    s.shake = Math.max(0, s.shake - a.dt * 4)
    if (!s.nums.length || s.want > s.nums.length) {
      if (s.nums.length) { a.add(5, a.W / 2, a.H / 2, 'MOCHI MODE +5'); a.sfx('big') }
      s.n = Math.min(5, s.n ? s.n + 1 : 3)
      const vals = [...Array(s.n * s.n).keys()].map(i => i + 1).sort(() => Math.random() - 0.5)
      s.nums = vals.map((v, i) => ({ v, x: i % s.n, y: Math.floor(i / s.n), c: pick(['#f472b6', '#38bdf8', '#a3e635', '#facc15', '#c084fc', '#fb923c']), done: false }))
      s.want = 1
    }
  },
  tap(s, x, y, a) {
    const L = modeL(a, s.n), cx = Math.floor((x - L.x0) / L.c), cy = Math.floor((y - L.y0) / L.c)
    const it = s.nums.find(q => q.x === cx && q.y === cy && !q.done); if (!it) return
    if (it.v === s.want) { it.done = true; s.want++; a.add(1); a.tone(400 + it.v * 25, 0.06, 'triangle') } else { s.shake = 1; a.miss(x, y, `→ ${s.want}`) }
  },
  draw(s, g, a) {
    const L = modeL(a, s.n), sh = Math.sin(a.t * 60) * s.shake * a.U
    for (const q of s.nums) {
      const x = L.x0 + q.x * L.c + sh, y = L.y0 + q.y * L.c
      g.globalAlpha = q.done ? 0.18 : 1
      blob(g, x + a.U, y + a.U, L.c - a.U * 2, L.c - a.U * 2, q.c, a.U * 3)
      text(g, String(q.v), x + L.c / 2, y + L.c / 2, L.c * 0.45)
      g.globalAlpha = 1
    }
    text(g, `${a.tr('Next')}: ${s.want}`, a.W / 2, a.U * 6, a.U * 5.5, '#fde047')
  },
}
const modeL = (a: { W: number; H: number; U: number }, n: number) => { const size = Math.min(a.W - a.U * 6, a.H - a.U * 16), c = size / Math.max(1, n); return { x0: (a.W - size) / 2, y0: a.U * 12 + (a.H - a.U * 12 - size) / 2, c } }

/* 14 ─ Mochi Obby: obstacle-course runner */
type Ob = { x: number; w: number; h: number; k: 'block' | 'fish' | 'gap'; fy?: number; c: string }
const obby: GameDef<{ y: number; vy: number; jumps: number; obs: Ob[]; d: number; inv: number; meter: number }> = {
  slug: 'mochi-obby', name: 'Mochi Obby', emoji: '🧱', mode: 'lives', lives: 3, bg: ['#60a5fa', '#bfdbfe'],
  desc: 'Jump, dodge, respawn — the Mochi obstacle course!',
  how: 'Tap (or space) to jump — tap again in the air for a double jump. Grab 🐟, avoid blocks and lava!',
  init: a => ({ y: a.H * 0.75, vy: 0, jumps: 0, obs: [], d: 0, inv: 0, meter: 0 }),
  update(s, a) {
    const ground = a.H * 0.78, sp = a.U * (50 + Math.min(50, a.t * 1.2)), x0 = a.W * 0.22, G = a.U * 330
    s.d += sp * a.dt; s.inv = Math.max(0, s.inv - a.dt)
    s.meter += sp * a.dt; while (s.meter > a.U * 20) { s.meter -= a.U * 20; a.add(1) }
    const last = s.obs[s.obs.length - 1]
    if (!last || last.x < a.W - rnd(a.U * 45, a.U * 75)) {
      const r = Math.random()
      if (r < 0.2) s.obs.push({ x: a.W + a.U * 10, w: a.U * 8, h: 0, k: 'fish', fy: ground - rnd(a.U * 18, a.U * 38), c: '' })
      else if (r < 0.4 && a.t > 8) s.obs.push({ x: a.W + a.U * 10, w: a.U * rnd(14, 20), h: 0, k: 'gap', c: '#f97316' })
      else s.obs.push({ x: a.W + a.U * 10, w: a.U * rnd(8, 12), h: a.U * rnd(9, a.t > 20 ? 20 : 14), k: 'block', c: pick(['#ef4444', '#22c55e', '#eab308', '#a855f7', '#3b82f6']) })
    }
    // physics
    let floor = ground
    for (const o of s.obs) if (o.k === 'gap' && x0 > o.x + a.U * 2 && x0 < o.x + o.w - a.U * 2) floor = a.H * 2
    s.vy += G * a.dt; s.y += s.vy * a.dt
    if (s.y > floor && s.y < ground + a.U * 4) { s.y = floor; s.vy = 0; s.jumps = 0 }
    for (const o of s.obs) {
      o.x -= sp * a.dt
      if (o.k === 'block' && !s.inv && x0 + a.U * 5 > o.x && x0 - a.U * 5 < o.x + o.w && s.y > ground - o.h) { a.miss(x0, s.y - a.U * 15, 'BONK'); s.inv = 1.3 }
      if (o.k === 'fish' && Math.abs(o.x - x0) < a.U * 8 && Math.abs((o.fy ?? 0) - (s.y - a.U * 8)) < a.U * 10) { a.add(5, o.x, (o.fy ?? 0) - a.U * 6, '🐟 +5'); o.x = -1e4 }
    }
    if (s.y > a.H + a.U * 10) { a.miss(x0, a.H * 0.5, 'LAVA!'); s.y = ground - a.U * 30; s.vy = 0; s.inv = 1.3; s.obs = s.obs.filter(o => o.x > a.W * 0.5) }
    s.obs = s.obs.filter(o => o.x + o.w > -a.U * 10)
  },
  tap(s, _x, _y, a) { if (s.jumps < 2) { s.vy = -a.U * (s.jumps ? 95 : 110); s.jumps++; a.tone(s.jumps === 1 ? 520 : 780, 0.06, 'square') } },
  key(s, k, a) { if (k === ' ' || k === 'ArrowUp') this.tap!(s, 0, 0, a) },
  draw(s, g, a) {
    const ground = a.H * 0.78, x0 = a.W * 0.22
    for (let i = 0; i < 4; i++) emo(g, '☁️', ((i * 160 - s.d * 0.2) % (a.W + 160) + a.W + 160) % (a.W + 160) - 80, a.U * (10 + i * 9), a.U * 12)
    // ground with gaps
    g.fillStyle = '#16a34a'; g.fillRect(0, ground, a.W, a.H - ground)
    for (let x = -((s.d) % (a.U * 10)); x < a.W; x += a.U * 10) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, ground, a.U * 5, a.H) }
    for (const o of s.obs) {
      if (o.k === 'gap') { const lg = g.createLinearGradient(0, ground, 0, a.H); lg.addColorStop(0, '#fde047'); lg.addColorStop(1, '#dc2626'); g.fillStyle = lg; g.fillRect(o.x, ground, o.w, a.H - ground) }
      if (o.k === 'block') { blob(g, o.x, ground - o.h, o.w, o.h, o.c, a.U * 1.5); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = a.U * 0.4; g.strokeRect(o.x + a.U, ground - o.h + a.U, o.w - a.U * 2, o.h - a.U * 2) }
      if (o.k === 'fish') emo(g, '🐟', o.x, o.fy ?? 0, a.U * 9, Math.sin(a.t * 6) * 0.2)
    }
    mochi(g, s.y < ground - 1 ? a.sp.jump : a.sp.happy, x0, s.y - a.U * 8, a.U * 17, { alpha: s.inv && Math.floor(a.t * 12) % 2 ? 0.35 : 1, rot: s.jumps === 2 ? (a.t * 12) % (Math.PI * 2) : Math.sin(a.t * 20) * 0.05 })
  },
}

/* 15 ─ Mochi Heart: pop the heart bubbles */
type Bub = { x: number; y: number; r: number; v: number; k: '💖' | '💛' | '💔'; w: number }
const heart: GameDef<{ bubs: Bub[]; next: number; combo: number; lastPop: number }> = {
  slug: 'mochi-heart', name: 'Heart Pop', emoji: '💖', mode: 'time', seconds: 40, bg: ['#fbcfe8', '#f472b6'],
  desc: 'Pop the floating hearts for your friends.',
  how: 'Tap 💖 bubbles to pop them, 💛 is worth 3! Avoid 💔. Pop quickly in a row for combos.',
  init: () => ({ bubs: [], next: 0.2, combo: 0, lastPop: -9 }),
  update(s, a) {
    s.next -= a.dt
    if (s.next <= 0) { s.next = Math.max(0.18, 0.55 - a.t * 0.008); const r = Math.random(); s.bubs.push({ x: rnd(a.U * 10, a.W - a.U * 10), y: a.H + a.U * 10, r: a.U * rnd(7, 10), v: a.U * rnd(22, 34) * (1 + a.t * 0.015), k: r < 0.12 ? '💛' : r < 0.32 ? '💔' : '💖', w: rnd(0, 6) }) }
    for (const b of s.bubs) { b.y -= b.v * a.dt; b.x += Math.sin(a.t * 2 + b.w) * a.U * 6 * a.dt }
    s.bubs = s.bubs.filter(b => b.y > -b.r * 2)
  },
  tap(s, x, y, a) {
    let hit: Bub | undefined
    for (const b of s.bubs) if (Math.hypot(b.x - x, b.y - y) < b.r * 1.3) hit = b
    if (!hit) return
    s.bubs = s.bubs.filter(b => b !== hit)
    if (hit.k === '💔') { s.combo = 0; a.miss(hit.x, hit.y, '💔'); return }
    s.combo = a.t - s.lastPop < 0.7 ? s.combo + 1 : 1; s.lastPop = a.t
    const pts = (hit.k === '💛' ? 3 : 1) + (s.combo >= 3 ? 1 : 0)
    a.add(pts, hit.x, hit.y - hit.r, s.combo >= 3 ? `${s.combo}x COMBO` : undefined); a.burst(hit.x, hit.y, hit.k === '💛' ? '#facc15' : '#ec4899', 10); a.tone(600 + s.combo * 50, 0.06, 'sine')
  },
  draw(s, g, a) {
    mochi(g, a.sp.happy, a.W / 2, a.H - a.U * 14, a.U * 24, { alpha: 0.9 })
    for (const b of s.bubs) {
      g.fillStyle = 'rgba(255,255,255,.25)'; g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = a.U * 0.5
      g.beginPath(); g.arc(b.x, b.y, b.r * 1.25, 0, 7); g.fill(); g.stroke()
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(b.x - b.r * 0.5, b.y - b.r * 0.6, b.r * 0.25, 0, 7); g.fill()
      emo(g, b.k, b.x, b.y, b.r * 1.4)
    }
  },
}

/* 16 ─ Mochi Farm: harvest when ripe */
const CROPS = ['🥕', '🍅', '🌽', '🍓', '🥔', '🍆']
type Plot = { st: number; t: number; k: string; ripeFor: number }
const farm: GameDef<{ plots: Plot[] }> = {
  slug: 'mochi-farm', name: 'Harvest Time', emoji: '🥕', mode: 'time', seconds: 45, bg: ['#bef264', '#65a30d'],
  desc: 'Harvest the veggies exactly when they are ripe.',
  how: 'Plants grow 🌱 → 🌿 → ripe! Tap only ripe veggies. Too early or too late — it’s lost!',
  init: () => ({ plots: Array.from({ length: 9 }, () => ({ st: 0, t: rnd(-2, 0), k: pick(CROPS), ripeFor: 1.4 })) }),
  update(s, a) {
    for (let i = 0; i < 9; i++) {
      const p = s.plots[i]; p.t += a.dt * (1 + a.t * 0.02)
      if (p.st === 0 && p.t > 1.2) { p.st = 1; p.t = 0 }
      else if (p.st === 1 && p.t > 1.2) { p.st = 2; p.t = 0; p.ripeFor = Math.max(0.7, 1.5 - a.t * 0.015) }
      else if (p.st === 2 && p.t > p.ripeFor) { p.st = 3; p.t = 0; const c = cellC(a, i); a.miss(c.x, c.y - c.r * 0.5, a.tr('Too late!')) }
      else if (p.st === 3 && p.t > 0.8) { p.st = 0; p.t = rnd(-1.5, 0); p.k = pick(CROPS) }
    }
  },
  tap(s, x, y, a) {
    const i = cellAt(a, x, y); if (i < 0) return
    const p = s.plots[i], c = cellC(a, i)
    if (p.st === 2) { a.add(p.t < p.ripeFor * 0.4 ? 2 : 1, c.x, c.y - c.r * 0.5, p.k); a.burst(c.x, c.y, '#fef08a', 8); p.st = 0; p.t = rnd(-1, 0); p.k = pick(CROPS) }
    else if (p.st === 1) { a.miss(c.x, c.y - c.r * 0.5, a.tr('Too early!')); p.st = 0; p.t = -0.5 }
  },
  draw(s, g, a) {
    for (let i = 0; i < 9; i++) {
      const c = cellC(a, i), p = s.plots[i]
      blob(g, c.x - c.r * 0.9, c.y - c.r * 0.6, c.r * 1.8, c.r * 1.4, '#92400e', c.r * 0.3)
      g.fillStyle = 'rgba(0,0,0,.15)'; for (let k = -1; k <= 1; k++) g.fillRect(c.x - c.r * 0.75, c.y + k * c.r * 0.35, c.r * 1.5, c.r * 0.08)
      if (p.st === 1) emo(g, p.t < 0.6 ? '🌱' : '🌿', c.x, c.y, c.r * 0.9)
      if (p.st === 2) { const pulse = 1 + Math.sin(a.t * 12) * 0.06; g.save(); g.shadowColor = '#fde047'; g.shadowBlur = c.r * 0.5; emo(g, p.k, c.x, c.y, c.r * 1.1 * pulse); g.restore(); g.fillStyle = '#fde047'; g.fillRect(c.x - c.r * 0.7, c.y + c.r * 0.68, c.r * 1.4 * (1 - p.t / p.ripeFor), c.r * 0.1) }
      if (p.st === 3) emo(g, '🥀', c.x, c.y, c.r * 0.9)
    }
    mochi(g, a.sp.idle, a.U * 10, a.U * 9, a.U * 14)
    emo(g, '👒', a.U * 10, a.U * 2.5, a.U * 9)
  },
}

/* 17 ─ Mochi Fiesta: whack the swinging piñata */
const fiesta: GameDef<{ ang: number; av: number; len: number; hits: number; need: number; shake: number; candy: { x: number; y: number; vx: number; vy: number; k: string }[]; n: number }> = {
  slug: 'mochi-fiesta', name: 'Piñata Party', emoji: '🪅', mode: 'time', seconds: 35, bg: ['#fb923c', '#be123c'],
  desc: 'Fiesta time! Whack the swinging piñata.',
  how: 'Tap the piñata to whack it. Every broken piñata = +5 and a candy shower. They swing faster each time!',
  init: a => ({ ang: 0.8, av: 0, len: a.H * 0.45, hits: 0, need: 4, shake: 0, candy: [], n: 0 }),
  update(s, a) {
    const k = 9 + s.n * 3
    s.av += -k * Math.sin(s.ang) * a.dt; s.ang += s.av * a.dt
    if (Math.abs(s.ang) < 0.05 && Math.abs(s.av) < 1.2) s.av += (Math.random() < 0.5 ? -1 : 1) * 1.5
    s.av = clamp(s.av, -4.5, 4.5)
    s.shake = Math.max(0, s.shake - a.dt * 4)
    for (const c of s.candy) { c.vy += a.U * 200 * a.dt; c.x += c.vx * a.dt; c.y += c.vy * a.dt }
    s.candy = s.candy.filter(c => c.y < a.H + 40)
  },
  tap(s, x, y, a) {
    const px = a.W / 2 + Math.sin(s.ang) * s.len, py = a.U * 2 + Math.cos(s.ang) * s.len, r = a.U * Math.max(9, 14 - s.n * 0.6)
    if (Math.hypot(x - px, y - py) > r * 1.4) { a.tone(200, 0.04); return }
    s.hits++; s.shake = 1; s.av += (x < px ? 1 : -1) * 1.4; a.add(1, px, py - r, 'WHACK!'); a.tone(250, 0.07, 'square')
    if (s.hits >= s.need) {
      a.add(5, px, py, '¡FIESTA! +5'); a.sfx('big'); s.n++; s.hits = 0; s.need = Math.min(8, 4 + Math.floor(s.n / 2))
      for (let i = 0; i < 16; i++) s.candy.push({ x: px, y: py, vx: a.U * rnd(-50, 50), vy: -a.U * rnd(30, 90), k: pick(['🍬', '🍭', '🍫', '⭐', '🎉']) })
      s.ang = rnd(-1, 1); s.av = 0
    }
  },
  draw(s, g, a) {
    // bunting
    for (let i = 0; i < 9; i++) { g.fillStyle = ['#facc15', '#22c55e', '#3b82f6', '#ec4899'][i % 4]; g.beginPath(); g.moveTo(i * a.W / 9, 0); g.lineTo((i + 1) * a.W / 9, 0); g.lineTo((i + 0.5) * a.W / 9, a.U * 7); g.fill() }
    const px = a.W / 2 + Math.sin(s.ang) * s.len, py = a.U * 2 + Math.cos(s.ang) * s.len, r = a.U * Math.max(9, 14 - s.n * 0.6)
    g.strokeStyle = '#fff'; g.lineWidth = a.U * 0.6; g.beginPath(); g.moveTo(a.W / 2, a.U * 2); g.lineTo(px, py - r); g.stroke()
    emo(g, '🪅', px + Math.sin(a.t * 50) * s.shake * a.U * 2, py, r * 2.2, -s.ang * 0.6)
    for (let i = 0; i < s.need; i++) { g.fillStyle = i < s.hits ? '#fde047' : 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(a.W / 2 + (i - (s.need - 1) / 2) * a.U * 5, a.U * 12, a.U * 1.6, 0, 7); g.fill() }
    for (const c of s.candy) emo(g, c.k, c.x, c.y, a.U * 7)
    mochi(g, s.shake > 0.4 ? a.sp.jump : a.sp.happy, a.W / 2, a.H - a.U * 13, a.U * 22)
    emo(g, '🎉', a.W / 2 - a.U * 15, a.H - a.U * 20, a.U * 8); emo(g, '🪇', a.W / 2 + a.U * 15, a.H - a.U * 14, a.U * 8, Math.sin(a.t * 14) * 0.4)
  },
}

export const GAMES_B = [nom, drum, bounce, mode, obby, heart, farm, fiesta]
