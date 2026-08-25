import { NavLink, Route, Routes } from 'react-router-dom'
import Discover from './pages/Discover'
import Watchlist from './pages/Watchlist'
import FreeMovies from './pages/FreeMovies'
import { useWatchlist } from './store/watchlist'
import { cn } from './utils/format'

function NavItem({ to, children, badge }: { to: string; children: React.ReactNode; badge?: number }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'relative text-sm font-semibold px-1 py-1 transition-colors',
          isActive ? 'text-brand-teal' : 'text-white/80 hover:text-white',
        )
      }
    >
      {children}
      {badge ? (
        <span className="ml-1.5 text-[10px] font-bold bg-brand-teal text-brand-navy rounded-full px-1.5 py-0.5">
          {badge}
        </span>
      ) : null}
    </NavLink>
  )
}

export default function App() {
  const count = useWatchlist((s) => s.entries.length)

  return (
    <div className="min-h-screen bg-brand-navy text-white">
      <header className="sticky top-0 z-50 bg-brand-dark/95 backdrop-blur border-b border-white/5">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 mr-2">
            <span className="text-xl">🎬</span>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-brand-lime to-brand-teal
                             bg-clip-text text-transparent">
              Reelist
            </span>
          </NavLink>
          <NavItem to="/">Discover</NavItem>
          <NavItem to="/watchlist" badge={count}>Watchlist</NavItem>
          <NavItem to="/free">Free to Watch</NavItem>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/free" element={<FreeMovies />} />
          <Route path="*" element={
            <p className="max-w-6xl mx-auto px-6 py-24 text-center text-slate-400">Page not found.</p>
          } />
        </Routes>
      </main>

      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-xs text-slate-500">
          Movie data from TMDB. Streaming availability by JustWatch. Free films from the Internet Archive.
          <br />This product uses the TMDB API but is not endorsed or certified by TMDB.
        </div>
      </footer>
    </div>
  )
}