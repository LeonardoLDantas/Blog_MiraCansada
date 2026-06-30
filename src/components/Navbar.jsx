import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Home, Menu, X } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-discord-surface border-b border-discord-card sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Blog_MiraCansada/logo.png"
              alt="Mira Cansada"
              className="h-12 w-12 object-contain shrink-0"
            />
            <div>
              <span className="text-xl font-bold text-white tracking-tight">
                Mira<span className="text-discord-accent">Cansada</span>
              </span>
              <p className="text-xs text-discord-muted -mt-0.5">o blog do discord</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-discord-accent'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              <Home size={15} /> Feed
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-discord-muted hover:text-white p-2"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-discord-muted hover:text-white py-2"
            >
              <Home size={15} /> Feed
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
