import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, Strikethrough, List, AlignLeft } from 'lucide-react'

function ToolbarBtn({ onClick, title, children, active }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded transition text-sm ${
        active ? 'bg-discord-accent text-white' : 'text-discord-muted hover:text-white hover:bg-discord-card'
      }`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder = 'Descricao (opcional)' }) {
  const ref = useRef(null)
  const lastHtml = useRef(null)

  // Popula o DOM na montagem com o valor inicial
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value || ''
      lastHtml.current = value || ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sincroniza se value mudar externamente (ex: reset do form)
  useEffect(() => {
    if (ref.current && value !== lastHtml.current && value === '') {
      ref.current.innerHTML = ''
      lastHtml.current = ''
    }
  }, [value])

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    if (ref.current) {
      const html = ref.current.innerHTML
      lastHtml.current = html
      onChange(html)
    }
  }

  const handleInput = () => {
    if (ref.current) {
      const html = ref.current.innerHTML
      lastHtml.current = html
      onChange(html)
    }
  }

  return (
    <div className="border border-discord-card rounded-lg overflow-hidden focus-within:border-discord-accent transition-colors bg-discord-bg">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-discord-surface border-b border-discord-card flex-wrap">
        <ToolbarBtn onClick={() => exec('bold')} title="Negrito (Ctrl+B)">
          <Bold size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('italic')} title="Italico (Ctrl+I)">
          <Italic size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('underline')} title="Sublinhado (Ctrl+U)">
          <Underline size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('strikeThrough')} title="Tachado">
          <Strikethrough size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-discord-card mx-1" />
        <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="Lista">
          <List size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-discord-card mx-1" />
        <ToolbarBtn onClick={() => exec('removeFormat')} title="Remover formatacao">
          <AlignLeft size={13} />
        </ToolbarBtn>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[90px] max-h-48 overflow-y-auto px-4 py-2.5 text-white text-sm outline-none leading-relaxed
                   empty:before:content-[attr(data-placeholder)] empty:before:text-discord-muted empty:before:pointer-events-none"
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  )
}
