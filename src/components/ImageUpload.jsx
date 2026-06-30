import { useState, useRef, useCallback } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import { UploadCloud, X, ImageIcon, Link2 } from 'lucide-react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_MB = 10

export default function ImageUpload({ value, onChange, onUploadingChange }) {
  const [mode, setMode] = useState('upload')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const setUploadState = (state) => {
    setUploading(state)
    onUploadingChange?.(state)
  }

  const uploadFile = useCallback(async (file) => {
    setError('')
    if (!ACCEPTED.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG, GIF ou WebP.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${MAX_MB}MB.`)
      return
    }

    setUploadState(true)
    setProgress(0)
    onChange('')

    const ext = file.name.split('.').pop()
    const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    try {
      const storageRef = ref(storage, path)
      const task = uploadBytesResumable(storageRef, file)

      task.on(
        'state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          setProgress(pct)
        },
        (err) => {
          console.error('Storage error:', err)
          if (err.code === 'storage/unauthorized') {
            setError('Permissão negada. Ative o Firebase Storage no console e configure as regras.')
          } else {
            setError('Erro no upload: ' + err.message)
          }
          setUploadState(false)
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          onChange(url)
          setUploadState(false)
          setProgress(100)
        }
      )
    } catch (err) {
      setError('Erro ao iniciar upload: ' + err.message)
      setUploadState(false)
    }
  }, [onChange, onUploadingChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleFileInput = (e) => { const f = e.target.files?.[0]; if (f) uploadFile(f) }

  return (
    <div className="flex flex-col gap-2">
      {/* Tabs */}
      <div className="flex gap-1 bg-discord-bg rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => { setMode('upload'); setError('') }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mode === 'upload' ? 'bg-discord-accent text-white' : 'text-discord-muted hover:text-white'
          }`}
        >
          <UploadCloud size={13} /> Upload
        </button>
        <button
          type="button"
          onClick={() => { setMode('url'); setError('') }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mode === 'url' ? 'bg-discord-accent text-white' : 'text-discord-muted hover:text-white'
          }`}
        >
          <Link2 size={13} /> URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && !value && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragging
              ? 'border-discord-accent bg-discord-accent/10'
              : 'border-discord-card hover:border-discord-accent/60 bg-discord-bg'
          } ${uploading ? 'cursor-not-allowed opacity-70' : value ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={handleFileInput}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <UploadCloud size={28} className="text-discord-accent animate-bounce" />
              <p className="text-white text-sm font-medium">enviando... {progress}%</p>
              <div className="w-full bg-discord-card rounded-full h-1.5">
                <div
                  className="bg-discord-accent h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : value ? (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon size={20} className="text-green-400" />
              <p className="text-green-400 text-sm font-medium">imagem enviada!</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(''); setProgress(0) }}
                className="text-xs text-discord-muted hover:text-red-400 underline transition"
              >
                trocar imagem
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon size={28} className="text-discord-muted" />
              <p className="text-white text-sm font-medium">
                {dragging ? 'Solte aqui!' : 'Arraste a imagem ou clique para selecionar'}
              </p>
              <p className="text-discord-muted text-xs">JPG, PNG, GIF, WebP · máx {MAX_MB}MB</p>
            </div>
          )}
        </div>
      ) : (
        <input
          type="url"
          placeholder="URL da imagem (Discord CDN, Imgur, etc)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-discord-bg border border-discord-card text-white placeholder-discord-muted
                     rounded-lg px-4 py-2.5 outline-none focus:border-discord-accent transition-colors"
        />
      )}

      {error && (
        <p className="text-red-400 text-xs bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Preview URL mode */}
      {mode === 'url' && value && (
        <div className="relative rounded-lg overflow-hidden border border-discord-card bg-discord-bg">
          <img
            src={value}
            alt="preview"
            className="w-full max-h-48 object-contain"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
