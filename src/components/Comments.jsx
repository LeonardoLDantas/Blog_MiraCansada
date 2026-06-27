import { useState } from 'react'
import { useComments } from '../hooks/useComments'

export default function Comments({ postId, isAdmin = false }) {
  const { comments, loading, addComment, deleteComment } = useComments(postId)
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!text.trim()) return setError('escreve alguma coisa 👀')
    setSending(true)
    try {
      await addComment({ author, text })
      setText('')
      setAuthor('')
    } catch {
      setError('erro ao enviar, tenta de novo')
    } finally {
      setSending(false)
    }
  }

  const fmt = (ts) => {
    if (!ts) return '...'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-white mb-4">
        💬 Comentários
        {!loading && (
          <span className="ml-2 text-sm text-discord-muted font-normal">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* Lista */}
      {loading ? (
        <p className="text-discord-muted text-sm">carregando...</p>
      ) : comments.length === 0 ? (
        <p className="text-discord-muted text-sm mb-6">nenhum comentário ainda. seja o primeiro! 👇</p>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-discord-surface border border-discord-card rounded-xl px-4 py-3 group"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-discord-accent text-sm font-semibold">
                  {c.author}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-discord-muted text-xs">{fmt(c.createdAt)}</span>
                  {isAdmin && (
                    <button
                      onClick={() => confirm('Deletar comentário?') && deleteComment(c.id)}
                      className="text-discord-muted hover:text-discord-accent transition opacity-0 group-hover:opacity-100 text-sm"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <p className="text-discord-text text-sm leading-relaxed whitespace-pre-wrap break-words">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-discord-surface border border-discord-card rounded-xl p-4 flex flex-col gap-3"
      >
        <input
          type="text"
          placeholder="Apelido (opcional — deixe vazio para anônimo)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={32}
          className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                     rounded-lg px-3 py-2 text-sm outline-none focus:border-discord-accent transition-colors"
        />
        <textarea
          placeholder="Escreva seu comentário..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={500}
          className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                     rounded-lg px-3 py-2 text-sm outline-none focus:border-discord-accent transition-colors resize-none"
        />
        {error && <p className="text-discord-accent text-xs">{error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-discord-muted text-xs">{text.length}/500</span>
          <button
            type="submit"
            disabled={sending}
            className="bg-discord-accent text-white text-sm font-semibold px-5 py-2 rounded-lg
                       hover:opacity-90 transition disabled:opacity-50"
          >
            {sending ? 'enviando...' : '📨 Comentar'}
          </button>
        </div>
      </form>
    </div>
  )
}
