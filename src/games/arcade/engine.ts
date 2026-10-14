/** Tiny shared engine for the per-song mini games. Everything is drawn in CSS pixels on a canvas. */
export type Img = HTMLImageElement
export type Sprites = { idle: Img; happy: Img; sad: Img; jump: Img }

export interface Api {
  W: number; H: number
  /** 1% of the shorter side — use it for all sizes so games scale on any screen */
  U: number
  /** seconds since the round started */
  t: number
  dt: number
  ptr: { x: number; y: number; down: boolean; used: boolean }
  keys: Set<string>
  sp: Sprites
  score: number
  playing: boolean
  add(n: number, x?: number, y?: number, label?: string): void
  /** lose a life (lives mode) or 1 point (time mode) */
  miss(x?: number, y?: number, label?: string): void
  over(): void
  pop(x: number, y: number, text: string, color?: string): void
  burst(x: number, y: number, color: string, n?: number): void
  sfx(kind: 'hit' | 'miss' | 'big', freq?: number): void
  tone(freq: number, dur?: number, type?: OscillatorType): void
  tr(s: string): string
}

export interface GameDef<S = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  slug: string
  name: string
  emoji: string
  desc: string
  how: string
  mode: 'time' | 'lives'
  seconds?: number
  lives?: number
  bg: [string, string]
  init(a: Api): S
  update(s: S, a: Api): void
  draw(s: S, g: CanvasRenderingContext2D, a: Api): void
  tap?(s: S, x: number, y: number, a: Api): void
  key?(s: S, k: string, a: Api): void
}

export const rnd = (a: number, b: number) => a + Math.random() * (b - a)
export const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k

export function emo(g: CanvasRenderingContext2D, ch: string, x: number, y: number, size: number, rot = 0) {
  g.save(); g.translate(x, y); if (rot) g.rotate(rot)
  g.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, size * 0.05); g.restore()
}

/** Draw Mochi centred on (x, y) with height h. */
export function mochi(g: CanvasRenderingContext2D, img: Img, x: number, y: number, h: number, o: { flip?: boolean; rot?: number; alpha?: number; squash?: number } = {}) {
  if (!img?.complete || !img.naturalWidth) return
  const w = h * img.naturalWidth / img.naturalHeight
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.flip) g.scale(-1, 1)
  if (o.squash) g.scale(1 + o.squash, 1 - o.squash)
  if (o.alpha != null) g.globalAlpha = o.alpha
  g.drawImage(img, -w / 2, -h / 2, w, h); g.restore()
}

export function text(g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color = '#fff', align: CanvasTextAlign = 'center') {
  g.save(); g.font = `${size}px "Lilita One","Jua","Fredoka",sans-serif`; g.textAlign = align; g.textBaseline = 'middle'
  g.lineWidth = size * 0.18; g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineJoin = 'round'; g.strokeText(s, x, y)
  g.fillStyle = color; g.fillText(s, x, y); g.restore()
}

export function rrect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.roundRect(x, y, w, h, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))
}

/** Glossy "3D" blob, used for buttons, pads, platforms. */
export function blob(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, r = h / 2, glow = 0) {
  g.save()
  if (glow) { g.shadowColor = color; g.shadowBlur = glow }
  g.fillStyle = 'rgba(0,0,0,.35)'; rrect(g, x, y + h * 0.12, w, h, r); g.fill()
  g.shadowBlur = 0
  g.fillStyle = color; rrect(g, x, y, w, h, r); g.fill()
  const hl = g.createLinearGradient(0, y, 0, y + h)
  hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(0.45, 'rgba(255,255,255,.08)'); hl.addColorStop(1, 'rgba(0,0,0,.18)')
  g.fillStyle = hl; rrect(g, x, y, w, h, r); g.fill()
  g.restore()
}
