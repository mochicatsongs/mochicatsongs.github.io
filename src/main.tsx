import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import { PlayerProvider } from './player/PlayerContext'
import './index.css'
import { LangProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {import.meta.env.VITE_PREVIEW
      // Review copy (hosted as a single page): routes live after the #.
      ? <HashRouter><LangProvider><PlayerProvider><App /></PlayerProvider></LangProvider></HashRouter>
      : <BrowserRouter basename={import.meta.env.BASE_URL}><LangProvider><PlayerProvider><App /></PlayerProvider></LangProvider></BrowserRouter>}
  </StrictMode>,
)
