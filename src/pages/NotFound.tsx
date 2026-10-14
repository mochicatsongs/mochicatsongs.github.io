import { Link } from 'react-router-dom'
import { Page } from '../components/Section'
export default function NotFound() {
  return <Page><h1 className="text-5xl font-medium">Meow? 404</h1><p className="mt-4 text-white/70">Mochi couldn’t find this page.</p><Link to="/" className="mt-6 inline-block underline">Back home</Link></Page>
}
