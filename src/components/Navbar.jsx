import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Home, Menu, X, Ghost } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/',      label: 'Feed',             Icon: Home  },
    { to: '/mural', label: 'Mural da Saudade', Icon: Ghost },
  ]

  return (
    <nav className="bg-discord-surface border-b border-discord-card sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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

          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'text-discord-accent'
                    : 'text-discord-muted hover:text-white'
                }`}
              >
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-discord-muted hover:text-white p-2"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="sm:hidden pb-4 flex flex-col gap-3">
            {navLinks.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 py-2 text-sm ${
                  location.pathname === to ? 'text-discord-accent' : 'text-discord-muted hover:text-white'
                }`}
              >
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
