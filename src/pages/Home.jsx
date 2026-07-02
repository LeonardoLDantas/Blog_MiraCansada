import { useState, useEffect, useRef, useCallback } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import PostCard from '../components/PostCard'
import FeedPostCard from '../components/FeedPostCard'
import { usePosts } from '../hooks/usePosts'

const TYPES = ['todos', 'meme', 'foto', 'gif', 'noticia', 'fofoca', 'cs', 'games', 'outro']
const PAGE_SIZE = 5

export default function Home() {
  const { posts, loading } = usePosts()
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('mc_view') || 'grid')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef(null)
  const topRef = useRef(null)

  const setView = (mode) => {
    setViewMode(mode)
    localStorage.setItem('mc_view', mode)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filtered = posts.filter((p) => {
    const matchType = filter === 'todos' || p.type === filter
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
    return matchType && matchSearch
  })

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filter, search])

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE)
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore()
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <div>
      <div ref={topRef} />
      {/* Hero */}
      <div className="text-center mb-10 fade-in">
        <div className="flex items-center justify-center gap-4 mb-2">
          <img src="/Blog_MiraCansada/logo.png" alt="logo" className="h-40 w-40 object-contain" />
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="text-white">Mira</span>
            <span className="text-discord-accent">Cansada</span>
          </h1>
        </div>
        <p className="text-discord-muted text-lg">memes, fotos e caos organizado do discord</p>
      </div>

      {/* Search + Toggle */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="🔍 buscar posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-discord-surface border border-discord-card text-white placeholder-discord-muted rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors"
          />
          <div className="flex items-center gap-1 bg-discord-surface border border-discord-card rounded-xl p-1 shrink-0">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-discord-accent text-white shadow'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              <LayoutGrid size={14} /> Grade
            </button>
            <button
              onClick={() => setView('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'feed'
                  ? 'bg-discord-accent text-white shadow'
                  : 'text-discord-muted hover:text-white'
              }`}
            >
              <List size={14} /> Feed
            </button>
          </div>
        </div>

        {/* Filtros por tipo */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === type
                  ? 'bg-discord-accent text-white'
                  : 'bg-discord-surface border border-discord-card text-discord-muted hover:border-discord-accent hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-20 text-discord-muted">
          <img src="/Blog_MiraCansada/logo.png" alt="carregando" className="h-20 w-20 object-contain animate-spin mb-4 mx-auto" />
          <p>carregando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-discord-muted">
          <div className="text-6xl mb-4">😴</div>
          <p className="text-xl font-semibold text-white mb-2">nada aqui ainda</p>
          <p>
            {search || filter !== 'todos'
              ? 'tente outros filtros'
              : 'o admin ainda não postou nada'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-discord-muted text-sm mb-4">
            {filtered.length} post{filtered.length !== 1 ? 's' : ''}
            {hasMore && <span> · mostrando {visible.length}</span>}
          </p>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="max-w-xl mx-auto flex flex-col gap-5">
              {visible.map((post, i) => (
                <FeedPostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}

          {/* Sentinel */}
          <div ref={sentinelRef} className="h-10 mt-6 flex items-center justify-center">
            {hasMore && (
              <span className="text-discord-muted text-sm animate-pulse">carregando mais...</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
