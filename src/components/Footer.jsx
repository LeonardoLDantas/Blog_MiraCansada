import { Github, Heart, Shield, Tag } from 'lucide-react'

const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.6.0'
const BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString().split('T')[0]
const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-discord-card bg-discord-surface">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/Blog_MiraCansada/logo.png"
              alt="Mira Cansada"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-white font-bold text-sm tracking-tight">
                Mira<span className="text-discord-accent">Cansada</span>
              </p>
              <p className="text-discord-muted text-xs">O blog oficial do servidor</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs text-discord-muted">
            <a
              href="https://github.com/LeonardoLDantas/Blog_MiraCansada"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github size={13} /> Repositório
            </a>
            <span className="text-discord-card">|</span>
            <span className="flex items-center gap-1.5">
              <Shield size={13} /> Privacidade
            </span>
            <span className="text-discord-card">|</span>
            <span className="flex items-center gap-1.5">
              <Tag size={13} /> v{VERSION}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-discord-card mb-5" />

        {/* Bottom row - 3 cols so center is truly centered */}
        <div className="grid grid-cols-3 items-center gap-2 text-xs text-discord-muted">
          <p>&copy; {YEAR} MiraCansada. Todos os direitos reservados.</p>
          <div className="flex flex-col items-center gap-1">
            <p className="flex items-center gap-1.5">
              Feito com <Heart size={11} className="text-discord-accent fill-discord-accent" /> pelo grupo
              <span className="text-discord-accent font-medium ml-1">Mira Cansada</span>
            </p>
            <span className="text-discord-accent/60 text-[10px] font-medium tracking-widest">#antifranceses</span>
          </div>
          <p className="text-discord-muted/50 text-[10px] text-right">
            build {BUILD_DATE} &middot; v{VERSION}
          </p>
        </div>
      </div>
    </footer>
  )
}
