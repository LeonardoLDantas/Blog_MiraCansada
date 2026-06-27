import { useState } from 'react'
import { usePosts } from '../hooks/usePosts'
import Comments from '../components/Comments'

// Usuários admin
const ADMIN_USERS = {
  admin:   'miracansada@2024',
  cripitu: 'miracansada2026',
  careca:  'Laker2045@',
}

const TYPE_OPTIONS = [
  { value: 'meme', label: '😂 Meme' },
  { value: 'foto', label: '📸 Foto' },
  { value: 'gif',  label: '🎬 GIF'  },
  { value: 'outro',label: '📌 Outro' },
]

export default function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('mc_admin_user'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const loggedUser = sessionStorage.getItem('mc_admin_user') || ''

  const { posts, loading, addPost, deletePost } = usePosts()

  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', type: 'meme', tags: '' })
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [formError, setFormError] = useState('')
  const [expandedPost, setExpandedPost] = useState(null)

  // — Login —
  const handleLogin = (e) => {
    e.preventDefault()
    const user = username.trim().toLowerCase()
    if (ADMIN_USERS[user] && ADMIN_USERS[user] === password) {
      sessionStorage.setItem('mc_admin', '1')
      sessionStorage.setItem('mc_admin_user', user)
      setAuthed(true)
    } else {
      setLoginError('usuário ou senha incorretos 🎯')
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
      setPreview('')
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
          <h1 className="text-2xl font-bold text-white">⚙️ Painel Admin</h1>
          <p className="text-discord-muted text-sm">{loggedUser} · {posts.length} posts publicados</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-discord-muted hover:text-discord-accent transition px-3 py-2 rounded-lg border border-discord-card hover:border-discord-accent"
        >
          sair
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-900/40 border border-green-500/40 text-green-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* — Formulário — */}
        <div className="bg-discord-surface border border-discord-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">✏️ Novo Post</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Tipo */}
            <div className="flex gap-2 flex-wrap">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    form.type === opt.value
                      ? 'bg-discord-accent text-white'
                      : 'bg-discord-bg text-discord-muted hover:text-white border border-discord-card'
                  }`}
                >
                  {opt.label}
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

            <div className="flex flex-col gap-2">
              <input
                type="url"
                placeholder="URL da imagem * (Discord CDN, Imgur, etc)"
                value={form.imageUrl}
                onChange={(e) => {
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  setPreview(e.target.value)
                }}
                className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                           rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors"
              />
              {preview && (
                <div className="rounded-lg overflow-hidden border border-discord-card bg-discord-bg">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full max-h-48 object-contain"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              )}
            </div>

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
              {saving ? 'publicando...' : '🚀 Publicar para todos'}
            </button>
          </form>
        </div>

        {/* — Lista de posts — */}
        <div className="bg-discord-surface border border-discord-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            📋 Posts publicados ({posts.length})
          </h2>
          {loading ? (
            <p className="text-discord-muted text-sm text-center py-8">carregando...</p>
          ) : posts.length === 0 ? (
            <p className="text-discord-muted text-sm text-center py-8">nenhum post ainda</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
              {posts.map((post) => (
                <div key={post.id} className="border border-discord-card rounded-xl overflow-hidden">
                  {/* Info row */}
                  <div className="flex items-center gap-3 p-3 bg-discord-bg">
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0 bg-discord-card"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{post.title}</p>
                      <p className="text-discord-muted text-xs mt-0.5">
                        {post.type} · {post.createdAt?.toDate
                          ? post.createdAt.toDate().toLocaleDateString('pt-BR')
                          : '...'}
                      </p>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex border-t border-discord-card">
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className={`flex-1 py-2 text-xs font-medium transition border-r border-discord-card ${
                        expandedPost === post.id
                          ? 'bg-discord-accent/20 text-discord-accent'
                          : 'text-discord-muted hover:text-white hover:bg-discord-card'
                      }`}
                    >
                      💬 Comentários
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deletar "${post.title}"?`)) deletePost(post.id)
                      }}
                      className="flex-1 py-2 text-xs font-medium text-red-400 hover:bg-red-900/30 transition"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                  {/* Comentários expandidos */}
                  {expandedPost === post.id && (
                    <div className="p-3 border-t border-discord-card bg-discord-bg">
                      <Comments postId={post.id} isAdmin={true} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
