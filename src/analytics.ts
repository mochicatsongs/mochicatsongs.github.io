/** Tiny wrapper around GA4 — never throws if the tag is blocked. */
type Gtag = (...a: unknown[]) => void
export function track(event: string, params: Record<string, unknown> = {}) {
  try { (window as unknown as { gtag?: Gtag }).gtag?.('event', event, params) } catch { /* ignore */ }
}
