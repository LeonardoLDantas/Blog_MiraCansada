import { Link } from 'react-router-dom'

const TYPE_EMOJI = { meme: '😂', foto: '📸', gif: '🎬', noticia: '📰', fofoca: '💬', cs: '🔫', games: '🎮', outro: '📌' }

export default function PostCard({ post, index }) {
  const { id, title, imageUrl, type = 'outro', tags = [], createdAt } = post

  const dateObj = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
  const date = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <Link
      to={`/post/${id}`}
      className="group relative bg-discord-surface border border-discord-card rounded-xl overflow-hidden fade-in hover:border-discord-accent/60 transition-all hover:-translate-y-0.5 duration-200"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Imagem */}
      <div className="aspect-square bg-discord-bg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {TYPE_EMOJI[type]}
          </div>
        )}
      </div>

      {/* Badge tipo */}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-xs rounded-full px-2 py-0.5 text-white font-medium">
        {TYPE_EMOJI[type]} {type}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white text-xs font-semibold leading-snug line-clamp-2 mb-1">{title}</p>
        {tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-1">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-discord-bg text-discord-muted px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <span className="text-xs text-discord-muted whitespace-nowrap">{date}</span>
      </div>
    </Link>
  )
}
