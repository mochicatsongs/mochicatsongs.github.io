import { ReactNode } from 'react'
export const Page = ({ children }: { children: ReactNode }) => (
  <div className="bg-party min-h-screen"><main className="relative z-10 mx-auto min-h-screen max-w-5xl px-5 pb-40 pt-28 sm:px-8">{children}</main></div>)
export const H1 = ({ children, color = '' }: { children: ReactNode; color?: string }) => (
  <h1 className={`t3d anim-popin mb-10 text-[clamp(44px,8vw,88px)] ${color}`}>{children}</h1>)
export const H2 = ({ children, color = '' }: { children: ReactNode; color?: string }) => (
  <h2 className={`t3d-sm mb-6 text-[clamp(28px,4.5vw,44px)] leading-none ${color}`}>{children}</h2>)
const PILL_COLORS = ['btn-pink', 'btn-cyan', 'btn-yellow', 'btn-lime', 'btn-purple', 'btn-orange']
export const Pill = ({ href, children, i = 0 }: { href: string; children: ReactNode; i?: number }) => (
  <a href={href} target="_blank" rel="noopener" className={`btn3d ${PILL_COLORS[i % PILL_COLORS.length]} text-[16px]`}>{children}</a>)
