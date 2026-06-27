import { Link } from 'react-router-dom'
import { MessageCircle, CalendarDays, Laugh, Camera, Clapperboard, Pin, ArrowRight } from 'lucide-react'
import { useComments } from '../hooks/useComments'

const TYPE_ICON = {
  meme: <Laugh size={15} />,
  foto: <Camera size={15} />,
  gif:  <Clapperboard size={15} />,
  outro: <Pin size={15} />,
}

function CommentCount({ postId }) {
  const { comments } = useComments(postId)
  return (
    <span className="flex items-center gap-1.5 text-discord-muted text-xs">
      <MessageCircle size={13} />
      {comments.length} comentário{comments.length !== 1 ? 's' : ''}
    </span>
  )
}

export default function FeedPostCard({ post, index }) {
  const { id, title, description, imageUrl, type = 'outro', tags = [], createdAt } = post

  const dateObj = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
  const date = dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      className="bg-discord-surface border border-discord-card rounded-2xl overflow-hidden fade-in hover:border-discord-accent/50 transition-all"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-discord-card">
        <div className="flex items-center gap-1.5 text-discord-muted text-xs font-medium uppercase tracking-wide">
          {TYPE_ICON[type]}
          <span>{type}</span>
        </div>
        <span className="flex items-center gap-1.5 text-discord-muted text-xs">
          <CalendarDays size={13} />
          {date}
        </span>
      </div>

      {/* Image */}
      {imageUrl && (
        <Link to={`/post/${id}`}>
          <div className="bg-discord-bg">
            <img
              src={imageUrl}
              alt={title}
              className="w-full max-h-[500px] object-contain mx-auto hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <Link to={`/post/${id}`}>
          <h2 className="text-white font-semibold text-base hover:text-discord-accent transition-colors leading-snug mb-1">
            {title}
          </h2>
        </Link>

        {description && (
          <p className="text-discord-muted text-sm leading-relaxed mb-2">{description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-discord-accent/80 bg-discord-accent/10 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-discord-card">
        <CommentCount postId={id} />
        <Link
          to={`/post/${id}`}
          className="flex items-center gap-1 text-xs font-medium text-discord-accent hover:underline"
        >
          ver post <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
