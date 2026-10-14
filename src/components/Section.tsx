import { ReactNode } from 'react'
export const Page = ({ children }: { children: ReactNode }) => (
  <main className="relative z-10 mx-auto min-h-screen max-w-5xl px-5 pb-40 pt-28 sm:px-8">{children}</main>)
export const H1 = ({ children }: { children: ReactNode }) => (
  <h1 className="mb-8 text-[clamp(34px,6vw,64px)] font-medium leading-none tracking-tight">{children}</h1>)
export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-5 text-[clamp(24px,3.5vw,36px)] font-medium tracking-tight">{children}</h2>)
export const Pill = ({ href, children, solid }: { href: string; children: ReactNode; solid?: boolean }) => (
  <a href={href} target="_blank" rel="noopener"
    className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[15px] transition-colors ${solid ? 'border-white bg-white text-black hover:bg-transparent hover:text-white' : 'border-white/35 hover:bg-white hover:text-black'}`}>{children}</a>)
