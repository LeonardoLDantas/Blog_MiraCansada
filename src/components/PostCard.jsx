import { Link } from 'react-router-dom'
const TYPE_EMOJI = { meme: '😂', foto: '📸', gif: '🎬', outro: '📌' }

export default function PostCard({ post, index = 0 }) {
  const { id, title, description, imageUrl, type = 'outro', tags = [], createdAt } = post

  const dateObj = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
  const date = dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      to={`/post/${id}`}
      className="fade-in group block bg-discord-surface border border-discord-card rounded-xl overflow-hidden
                 hover:border-discord-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-discord-card aspect-square">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        {/* Fallback */}
        <div
          className="absolute inset-0 hidden items-center justify-center bg-discord-card text-5xl"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          {TYPE_EMOJI[type]}
        </div>

        {/* Type badge */}
        <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {TYPE_EMOJI[type]} {type}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-discord-accent transition-colors line-clamp-2 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-discord-muted text-sm line-clamp-2 mb-3">{description}</p>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-discord-bg text-discord-muted px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-discord-muted whitespace-nowrap">{date}</span>
        </div>
      </div>
    </Link>
  )
}
