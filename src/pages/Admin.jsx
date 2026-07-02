import { useState, useEffect } from 'react'
import { Trash2, MessageCircle, ChevronDown, ChevronUp, Settings, PenLine, ClipboardList, LogOut, Send, Pencil, Check, X, Ghost, HeartCrack, Loader2 } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useMural } from '../hooks/useMural'
import Comments from '../components/Comments'
import RichTextEditor from '../components/RichTextEditor'

const ADMIN_HASHES = {
  admin:   import.meta.env.VITE_H_ADMIN,
  cripitu: import.meta.env.VITE_H_CRIPITU,
  careca:  import.meta.env.VITE_H_CARECA,
  matheus: import.meta.env.VITE_H_MATHEUS,
  titoe:   import.meta.env.VITE_H_TITOE,
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password) {
  return sha256(password)
}

// Token = hash(username + passwordHash) — impossivel de forjar sem conhecer o hash
async function generateToken(username, passwordHash) {
  return sha256(username + '|' + passwordHash)
}

const TYPE_OPTIONS = [
  { value: 'meme',    label: 'Meme',    emoji: '😂' },
  { value: 'foto',    label: 'Foto',    emoji: '📸' },
  { value: 'gif',     label: 'GIF',     emoji: '🎬' },
  { value: 'noticia', label: 'Noticia', emoji: '📰' },
  { value: 'fofoca',  label: 'Fofoca',  emoji: '💬' },
  { value: 'cs',      label: 'CS',      emoji: '🔫' },
  { value: 'games',   label: 'Games',   emoji: '🎮' },
  { value: 'outro',   label: 'Outro',   emoji: '📌' },
]

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const loggedUser = sessionStorage.getItem('mc_admin_user') || ''

  const { posts, loading, addPost, deletePost, updatePost } = usePosts()
  const { entries: muralEntries, loading: muralLoading, addEntry, deleteEntry } = useMural()

  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', type: 'meme', tags: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [formError, setFormError] = useState('')
  const [expandedPost, setExpandedPost] = useState(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  const [muralForm, setMuralForm] = useState({ name: '', description: '', imageUrl: '', reason: 'desaparecido' })
  const [muralSaving, setMuralSaving] = useState(false)
  const [muralSuccess, setMuralSuccess] = useState('')
  const [muralError, setMuralError] = useState('')
  const [muralConfirm, setMuralConfirm] = useState(null)

  // Verificacao criptrografica na carga da pagina
  // Mesmo que alguem force sessionStorage via console, o token nao vai bater
  useEffect(() => {
    const verify = async () => {
      const user = sessionStorage.getItem('mc_admin_user')
      const storedToken = sessionStorage.getItem('mc_admin_token')
      if (user && storedToken && ADMIN_HASHES[user]) {
        const expectedToken = await generateToken(user, ADMIN_HASHES[user])
        if (expectedToken === storedToken) {
          setAuthed(true)
        } else {
          clearSession()
        }
      }
      setVerifying(false)
    }
    verify()
  }, [])

  const clearSession = () => {
    sessionStorage.removeItem('mc_admin')
    sessionStorage.removeItem('mc_admin_user')
    sessionStorage.removeItem('mc_admin_token')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const user = username.trim().toLowerCase()
    const hash = await hashPassword(password)
    if (ADMIN_HASHES[user] && ADMIN_HASHES[user] === hash) {
      const token = await generateToken(user, hash)
      sessionStorage.setItem('mc_admin', '1')
      sessionStorage.setItem('mc_admin_user', user)
      sessionStorage.setItem('mc_admin_token', token)
      setAuthed(true)
    } else {
      setLoginError('usuario ou senha incorretos')
    }
  }

  const handleLogout = () => {
    clearSession()
    setAuthed(false)
  }

  const handleMuralSubmit = async (e) => {
    e.preventDefault()
    setMuralError('')
    if (!muralForm.name.trim()) return setMuralError('nome e obrigatorio')
    setMuralSaving(true)
    try {
      await addEntry({
        name:        muralForm.name.trim(),
        description: muralForm.description.trim(),
        imageUrl:    muralForm.imageUrl.trim(),
        reason:      muralForm.reason,
      })
      setMuralForm({ name: '', description: '', imageUrl: '', reason: 'desaparecido' })
      setMuralSuccess('Guerreiro adicionado ao mural!')
      setTimeout(() => setMuralSuccess(''), 3000)
    } catch (err) {
      setMuralError('Erro: ' + err.message)
    } finally {
      setMuralSaving(false)
    }
  }

  const handleMuralDelete = async (id) => {
    if (muralConfirm !== id) { setMuralConfirm(id); return }
    await deleteEntry(id)
    setMuralConfirm(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.title.trim())    return setFormError('titulo e obrigatorio')
    if (!form.imageUrl.trim()) return setFormError('URL da imagem e obrigatoria')
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
      setSuccess('Post publicado!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setFormError('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Enquanto verifica o token, mostra loading
  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="text-discord-accent animate-spin" />
      </div>
    )
  }

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
              placeholder="usuario"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setLoginError('') }}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-3 outline-none focus:border-discord-accent transition-colors"
              autoFocus
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginError('') }}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-3 outline-none focus:border-discord-accent transition-colors"
              autoComplete="current-password"
            />
            {loginError && <p className="text-discord-accent text-sm">{loginError}</p>}
            <button type="submit" className="bg-discord-accent text-white font-semibold py-3 rounded-lg hover:opacity-90 transition glow">
              entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto fade-in">
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
        {/* Novo Post */}
        <div className="bg-discord-surface border border-discord-card rounded-2xl p-6 w-full">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><PenLine size={17} /> Novo Post</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="Titulo *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors"
            />
            <RichTextEditor
              value={form.description}
              onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              placeholder="Descricao (opcional) — use a barra de formatacao acima"
            />
            <input
              type="url"
              placeholder="URL da imagem *"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors"
            />
            {form.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-discord-card bg-discord-bg">
                <img src={form.imageUrl} alt="preview" className="w-full max-h-48 object-contain" onError={(e) => (e.target.style.display = 'none')} />
              </div>
            )}
            <input
              type="text"
              placeholder="Tags: funny, gaming (separadas por virgula)"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors"
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

        {/* Mural da Saudade */}
        <div className="bg-discord-surface border border-purple-500/20 rounded-2xl p-6 w-full">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Ghost size={17} className="text-purple-400" /> Mural da Saudade
          </h2>

          {muralSuccess && (
            <div className="mb-4 p-3 bg-green-900/40 border border-green-500/40 text-green-400 rounded-lg text-sm">
              {muralSuccess}
            </div>
          )}

          <form onSubmit={handleMuralSubmit} className="flex flex-col gap-3 mb-6">
            <div className="flex gap-2">
              {[
                { value: 'desaparecido', label: 'Desaparecido', Icon: Ghost },
                { value: 'mulher', label: 'Mulher nao deixa', Icon: HeartCrack },
              ].map(({ value, label, Icon }) => (
                <button key={value} type="button"
                  onClick={() => setMuralForm(f => ({ ...f, reason: value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition border ${
                    muralForm.reason === value
                      ? 'bg-purple-700 text-white border-purple-500'
                      : 'bg-discord-bg text-discord-muted border-discord-card hover:text-white'
                  }`}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Nome do guerreiro *" value={muralForm.name}
              onChange={e => setMuralForm(f => ({ ...f, name: e.target.value }))}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-2.5 outline-none focus:border-purple-500 transition-colors" />
            <textarea placeholder="Ultimo aviso (opcional)" value={muralForm.description} rows={2}
              onChange={e => setMuralForm(f => ({ ...f, description: e.target.value }))}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-2.5 outline-none focus:border-purple-500 transition-colors resize-none" />
            <input type="url" placeholder="URL da foto (opcional)" value={muralForm.imageUrl}
              onChange={e => setMuralForm(f => ({ ...f, imageUrl: e.target.value }))}
              className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-2.5 outline-none focus:border-purple-500 transition-colors" />
            {muralForm.imageUrl && (
              <img src={muralForm.imageUrl} alt="preview"
                className="w-full max-h-36 object-contain rounded-lg border border-discord-card bg-discord-bg"
                onError={e => e.target.style.display = 'none'} />
            )}
            {muralError && <p className="text-red-400 text-sm">{muralError}</p>}
            <button type="submit" disabled={muralSaving}
              className="flex items-center gap-2 justify-center bg-purple-700 text-white font-semibold py-2.5 rounded-lg hover:bg-purple-600 transition disabled:opacity-50">
              <Ghost size={14} /> {muralSaving ? 'adicionando...' : 'Adicionar ao mural'}
            </button>
          </form>

          {muralLoading ? (
            <p className="text-discord-muted text-sm text-center py-4">carregando...</p>
          ) : muralEntries.length === 0 ? (
            <p className="text-discord-muted text-sm text-center py-4">nenhum guerreiro perdido ainda</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {muralEntries.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 bg-discord-bg border border-discord-card rounded-xl p-3">
                  {entry.imageUrl && (
                    <img src={entry.imageUrl} alt={entry.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 grayscale"
                      onError={e => e.target.style.display = 'none'} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{entry.name}</p>
                    <p className="text-discord-muted text-xs">{entry.reason === 'mulher' ? 'mulher nao deixa' : 'desaparecido'}</p>
                  </div>
                  {muralConfirm === entry.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleMuralDelete(entry.id)}
                        className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-500 transition">confirmar</button>
                      <button onClick={() => setMuralConfirm(null)}
                        className="px-2 py-1 rounded text-xs text-discord-muted border border-discord-card hover:text-white transition">cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => handleMuralDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-900/20 transition">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posts publicados */}
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
                      onUpdate={updatePost}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-discord-card">
                    <button
                      onClick={() => { setPage(p => p - 1); setExpandedPost(null) }}
                      disabled={page === 0}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-discord-card text-discord-muted hover:text-white hover:border-discord-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      anterior
                    </button>
                    <span className="text-discord-muted text-sm">pagina {page + 1} de {totalPages}</span>
                    <button
                      onClick={() => { setPage(p => p + 1); setExpandedPost(null) }}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-discord-card text-discord-muted hover:text-white hover:border-discord-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      proximo
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

function PostAdminCard({ post, expanded, onToggle, onDelete, onUpdate }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    title: post.title,
    description: post.description || '',
    imageUrl: post.imageUrl,
    type: post.type || 'meme',
    tags: (post.tags || []).join(', '),
  })

  const date = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '...'

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try { await onDelete(post.id) }
    catch (e) { console.error(e); setDeleting(false); setConfirming(false) }
  }

  const handleSave = async () => {
    if (!editForm.title.trim() || !editForm.imageUrl.trim()) return
    setSaving(true)
    try {
      await onUpdate(post.id, {
        title:       editForm.title.trim(),
        description: editForm.description.trim(),
        imageUrl:    editForm.imageUrl.trim(),
        type:        editForm.type,
        tags:        editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      setEditing(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="rounded-xl bg-discord-bg border border-discord-card">
      <div className="flex items-center gap-3 p-3">
        <img
          src={post.imageUrl}
          alt=""
          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-discord-card"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{post.title}</p>
          <p className="text-discord-muted text-xs mt-0.5">{post.type} · {post.author || 'admin'} · {date}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setEditing(e => !e); setConfirming(false) }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
              editing
                ? 'bg-discord-accent/20 text-discord-accent border-discord-accent/30'
                : 'text-discord-muted border-discord-card hover:text-white'
            }`}
          >
            <Pencil size={12} /> editar
          </button>
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
              <button onClick={handleDelete} disabled={deleting}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-500 transition disabled:opacity-50">
                {deleting ? '...' : 'confirmar'}
              </button>
              <button onClick={() => setConfirming(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs text-discord-muted border border-discord-card hover:text-white transition">
                cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-discord-card hover:bg-red-900/30 hover:border-red-500/40 transition">
              <Trash2 size={12} /> excluir
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="border-t border-discord-card p-4 bg-discord-surface flex flex-col gap-3">
          <p className="text-xs font-semibold text-discord-accent uppercase tracking-wide">Editando post</p>
          <div className="flex gap-2 flex-wrap">
            {TYPE_OPTIONS.map(({ value, emoji }) => (
              <button key={value} type="button"
                onClick={() => setEditForm(f => ({ ...f, type: value }))}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition border ${
                  editForm.type === value
                    ? 'bg-discord-accent text-white border-discord-accent'
                    : 'text-discord-muted border-discord-card hover:text-white'
                }`}>
                {emoji} {value}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Titulo *" value={editForm.title}
            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
            className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-3 py-2 text-sm outline-none focus:border-discord-accent transition-colors" />
          <RichTextEditor
            value={editForm.description}
            onChange={(html) => setEditForm(f => ({ ...f, description: html }))}
            placeholder="Descricao (opcional)"
          />
          <input type="url" placeholder="URL da imagem *" value={editForm.imageUrl}
            onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))}
            className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-3 py-2 text-sm outline-none focus:border-discord-accent transition-colors" />
          {editForm.imageUrl && (
            <img src={editForm.imageUrl} alt="preview"
              className="w-full max-h-36 object-contain rounded-lg border border-discord-card bg-discord-bg"
              onError={e => e.target.style.display = 'none'} />
          )}
          <input type="text" placeholder="Tags (separadas por virgula)" value={editForm.tags}
            onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
            className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted rounded-lg px-3 py-2 text-sm outline-none focus:border-discord-accent transition-colors" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-discord-muted border border-discord-card hover:text-white transition">
              <X size={12} /> cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium bg-discord-accent text-white hover:opacity-90 transition disabled:opacity-50">
              <Check size={12} /> {saving ? 'salvando...' : 'salvar'}
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-discord-card p-4 bg-discord-surface rounded-b-xl">
          <Comments postId={post.id} isAdmin={true} />
        </div>
      )}
    </div>
  )
}
