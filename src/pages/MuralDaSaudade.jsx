import { useMural } from '../hooks/useMural'
import { Ghost, HeartCrack, Loader2 } from 'lucide-react'

const REASON_CONFIG = {
  desaparecido: {
    label: 'Desaparecido',
    icon: Ghost,
    color: 'text-purple-400',
    bg: 'bg-purple-900/30 border-purple-500/30',
    badge: 'bg-purple-900/50 text-purple-300 border-purple-500/40',
  },
  mulher: {
    label: 'Mulher não deixa',
    icon: HeartCrack,
    color: 'text-pink-400',
    bg: 'bg-pink-900/20 border-pink-500/30',
    badge: 'bg-pink-900/50 text-pink-300 border-pink-500/40',
  },
}

function MuralCard({ entry }) {
  const reason = REASON_CONFIG[entry.reason] ?? REASON_CONFIG.desaparecido
  const Icon = reason.icon

  const date = entry.createdAt?.toDate
    ? entry.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col ${reason.bg} transition-transform hover:-translate-y-1 duration-200`}>
      {/* Foto */}
      <div className="relative aspect-[3/4] bg-discord-bg overflow-hidden">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.name}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={64} className={`${reason.color} opacity-30`} />
          </div>
        )}

        {/* Badge de motivo */}
        <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${reason.badge}`}>
          <Icon size={11} />
          {reason.label}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        <h3 className="text-white font-bold text-lg leading-tight">{entry.name}</h3>
        {entry.description && (
          <p className="text-discord-muted text-sm leading-relaxed">{entry.description}</p>
        )}
        {date && (
          <p className="text-discord-muted text-xs mt-1 opacity-60">desaparecido desde {date}</p>
        )}
      </div>
    </div>
  )
}

export default function MuralDaSaudade() {
  const { entries, loading } = useMural()

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <Ghost size={32} className="text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Mural da Saudade</h1>
          <Ghost size={32} className="text-purple-400 scale-x-[-1]" />
        </div>
        <p className="text-discord-muted max-w-md text-sm">
          Em memória dos guerreiros que partiram cedo demais — desaparecidos sem deixar rastros
          ou presos nas correntes do relacionamento.
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-1" />
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="text-discord-accent animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <Ghost size={48} className="text-discord-muted opacity-30" />
          <p className="text-discord-muted">Nenhum guerreiro perdido... por enquanto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {entries.map((entry) => (
            <MuralCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
