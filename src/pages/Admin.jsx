import { useState } from 'react'
import { Trash2, MessageCircle, ChevronDown, ChevronUp, User, Calendar, Settings, PenLine, ClipboardList, LogOut, Send } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import Comments from '../components/Comments'
import ImageUpload from '../components/ImageUpload'

// Hashes SHA-256 — um secret por usuário no GitHub
const ADMIN_HASHES = {
  admin:   import.meta.env.VITE_H_ADMIN,
  cripitu: import.meta.env.VITE_H_CRIPITU,
  careca:  import.meta.env.VITE_H_CARECA,
  matheus: import.meta.env.VITE_H_MATHEUS,
  titoe:   import.meta.env.VITE_H_TITOE,
}

async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const TYPE_OPTIONS = [
  { value: 'meme',  label: 'Meme',  emoji: '😂' },
  { value: 'foto',  label: 'Foto',  emoji: '📸' },
  { value: 'gif',   label: 'GIF',   emoji: '🎬' },
  { value: 'outro', label: 'Outro', emoji: '📌' },
]

export default function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('mc_admin_user'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const loggedUser = sessionStorage.getItem('mc_admin_user') || ''

  const { posts, loading, addPost, deletePost } = usePosts()

  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', type: 'meme', tags: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [formError, setFormError] = useState('')
  const [expandedPost, setExpandedPost] = useState(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  // — Login —
  const handleLogin = async (e) => {
    e.preventDefault()
    const user = username.trim().toLowerCase()
    const hash = await hashPassword(password)
    if (ADMIN_HASHES[user] && ADMIN_HASHES[user] === hash) {
      sessionStorage.setItem('mc_admin', '1')
      sessionStorage.setItem('mc_admin_user', user)
      setAuthed(true)
    } else {
      setLoginError('usuário ou senha incorretos')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('mc_admin')
    sessionStorage.removeItem('mc_admin_user')
    setAuthed(false)
  }

  // — Criar post —
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.title.trim())    return setFormError('título é obrigatório')
    if (!form.imageUrl.trim()) return setFormError('URL da imagem é obrigatória')

    setSaving(true)
    try {
      await addPost({
        title:       form.title.trim(),
        description: form.description.trim(),
        imageUrl:    form.imageUrl.trim(),
        type:        form.type,
        tags:        form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        author:      loggedUser || 'admin',
      })
      setForm({ title: '', description: '', imageUrl: '', type: 'meme', tags: '' })
      setSuccess('Post publicado para todos! 🎉')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setFormError('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // — Tela de login —
  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm bg-discord-surface border border-discord-card rounded-2xl p-8 fade-in">
          <div className="flex flex-col items-center gap-3 mb-8">
            <img src="/Blog_MiraCansada/logo.png" alt="logo" className="h-40 w-40 object-contain" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white leading-tight">Painel Admin</h1>
              <p className="text-discord-muted text-sm">Mira Cansada</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="usuário"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setLoginError('') }}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                         rounded-lg px-4 py-3 outline-none focus:border-discord-accent transition-colors"
              autoFocus
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginError('') }}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                         rounded-lg px-4 py-3 outline-none focus:border-discord-accent transition-colors"
              autoComplete="current-password"
            />
            {loginError && <p className="text-discord-accent text-sm">{loginError}</p>}
            <button
              type="submit"
              className="bg-discord-accent text-white font-semibold py-3 rounded-lg hover:opacity-90 transition glow"
            >
              entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  // — Dashboard —
  return (
    <div className="max-w-4xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings size={20} /> Painel Admin</h1>
          <p className="text-discord-muted text-sm">{loggedUser} · {posts.length} posts publicados</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-discord-muted hover:text-discord-accent transition px-3 py-2 rounded-lg border border-discord-card hover:border-discord-accent"
        >
          <LogOut size={14} /> sair
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-900/40 border border-green-500/40 text-green-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* — Formulário — */}
        <div className="bg-discord-surface border border-discord-card rounded-2xl p-6 w-full">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><PenLine size={17} /> Novo Post</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Tipo */}
            <div className="flex gap-2 flex-wrap">
              {TYPE_OPTIONS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                    form.type === value
                      ? 'bg-discord-accent text-white'
                      : 'bg-discord-bg text-discord-muted hover:text-white border border-discord-card'
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Título *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                         rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors"
            />

            <textarea
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                         rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors resize-none"
            />

            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            />

            <input
              type="text"
              placeholder="Tags: funny, gaming (separadas por vírgula)"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                         rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors"
            />

            {formError && <p className="text-discord-accent text-sm">{formError}</p>}

            <button
              type="submit"
              disabled={saving}
              className="bg-discord-accent text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'publicando...' : <span className="flex items-center gap-2 justify-center"><Send size={14} /> Publicar para todos</span>}
            </button>
          </form>
        </div>

        {/* — Lista de posts — */}
        <div className="bg-discord-surface border border-discord-card rounded-2xl p-6 w-full">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList size={17} /> Posts publicados ({posts.length})
          </h2>
          {loading ? (
            <p className="text-discord-muted text-sm text-center py-8">carregando...</p>
          ) : posts.length === 0 ? (
            <p className="text-discord-muted text-sm text-center py-8">nenhum post ainda</p>
          ) : (() => {
            const totalPages = Math.ceil(posts.length / PAGE_SIZE)
            const pagePosts = posts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            return (
              <>
                <div className="flex flex-col gap-3 max-h-[640px] overflow-y-auto pr-1">
                  {pagePosts.map((post) => (
                    <PostAdminCard
                      key={post.id}
                      post={post}
                      expanded={expandedPost === post.id}
                      onToggle={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      onDelete={deletePost}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-discord-card">
                    <button
                      onClick={() => { setPage(p => p - 1); setExpandedPost(null) }}
                      disabled={page === 0}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-discord-card text-discord-muted hover:text-white hover:border-discord-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← anterior
                    </button>
                    <span className="text-discord-muted text-sm">
                      página {page + 1} de {totalPages}
                    </span>
                    <button
                      onClick={() => { setPage(p => p + 1); setExpandedPost(null) }}
                      disabled={page >= totalPages - 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-discord-card text-discord-muted hover:text-white hover:border-discord-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      próximo →
                    </button>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

function PostAdminCard({ post, expanded, onToggle, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const date = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '...'

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try {
      await onDelete(post.id)
    } catch (e) {
      console.error(e)
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="rounded-xl bg-discord-bg border border-discord-card">
      {/* Linha principal */}
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail */}
        <img
          src={post.imageUrl}
          alt=""
          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-discord-card"
          onError={(e) => { e.target.style.display = 'none' }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{post.title}</p>
          <p className="text-discord-muted text-xs mt-0.5">
            {post.type} · {post.author || 'admin'} · {date}
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggle}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
              expanded
                ? 'bg-discord-accent/20 text-discord-accent border-discord-accent/30'
                : 'text-discord-muted border-discord-card hover:text-white'
            }`}
          >
            <MessageCircle size={12} />
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-500 transition disabled:opacity-50"
              >
                {deleting ? '...' : 'confirmar'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs text-discord-muted border border-discord-card hover:text-white transition"
              >
                cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-discord-card hover:bg-red-900/30 hover:border-red-500/40 transition"
            >
              <Trash2 size={12} />
              excluir
            </button>
          )}
        </div>
      </div>

      {/* Comentários expandidos */}
      {expanded && (
        <div className="border-t border-discord-card p-4 bg-discord-surface rounded-b-xl">
          <Comments postId={post.id} isAdmin={true} />
        </div>
      )}
    </div>
  )
}
