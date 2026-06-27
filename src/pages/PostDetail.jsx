import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import Comments from '../components/Comments'

const TYPE_EMOJI = { meme: '😂', foto: '📸', gif: '🎬', outro: '📌' }

export default function PostDetail() {
  const { id } = useParams()
  const { posts } = usePosts()
  const navigate = useNavigate()

  const post = posts.find((p) => p.id === id)

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🔍</p>
        <p className="text-xl text-white mb-4">Post não encontrado</p>
        <Link to="/" className="text-discord-accent hover:underline">
          ← voltar ao feed
        </Link>
      </div>
    )
  }

  const { title, description, imageUrl, type = 'outro', tags = [], createdAt, author } = post

  const dateObj = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
  const date = dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="max-w-3xl mx-auto fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-discord-muted hover:text-white transition-colors mb-6 flex items-center gap-2"
      >
        ← voltar
      </button>

      {/* Card */}
      <div className="bg-discord-surface border border-discord-card rounded-2xl overflow-hidden">
        {/* Image */}
        {imageUrl && (
          <div className="bg-discord-bg">
            <img
              src={imageUrl}
              alt={title}
              className="w-full max-h-[70vh] object-contain mx-auto"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
            <span className="text-2xl shrink-0">{TYPE_EMOJI[type]}</span>
          </div>

          {description && (
            <p className="text-discord-muted text-base mb-4 leading-relaxed">{description}</p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm bg-discord-bg text-discord-accent px-3 py-1 rounded-full border border-discord-accent/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-discord-muted pt-4 border-t border-discord-card">
            <span>👤 {author || 'admin'}</span>
            <span>•</span>
            <span>📅 {date}</span>
          </div>
        </div>
      </div>

      {/* Share URL */}
      <div className="mt-4 p-3 bg-discord-surface border border-discord-card rounded-lg flex items-center gap-3">
        <span className="text-discord-muted text-sm flex-1 truncate">{window.location.href}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copiado!')
          }}
          className="text-xs bg-discord-accent text-white px-3 py-1.5 rounded-lg hover:opacity-80 transition shrink-0"
        >
          copiar link
        </button>
      </div>

      {/* Comentários */}
      <Comments postId={post.id} />
    </div>
  )
}
