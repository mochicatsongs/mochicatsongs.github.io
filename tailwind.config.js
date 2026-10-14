/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#0b0718', mochired: '#e63946' },
      fontFamily: { heading: 'var(--font-heading)', body: 'var(--font-body)' },
      keyframes: { blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } } },
      animation: { blink: 'blink 1s step-end infinite' },
    },
  },
  plugins: [],
}
