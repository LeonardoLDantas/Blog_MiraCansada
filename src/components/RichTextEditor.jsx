import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, Strikethrough, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

function ToolbarBtn({ onMouseDown, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      title={title}
      className="p-1.5 rounded transition text-sm text-discord-muted hover:text-white hover:bg-discord-card"
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder = 'Descricao (opcional)' }) {
  const ref = useRef(null)
  const lastHtml = useRef(null)
  const savedRange = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value || ''
      lastHtml.current = value || ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ref.current && value !== lastHtml.current && value === '') {
      ref.current.innerHTML = ''
      lastHtml.current = ''
    }
  }, [value])

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const restoreAndGetRange = () => {
    const sel = window.getSelection()
    if (savedRange.current && sel) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
      return savedRange.current
    }
    return sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null
  }

  const emit = () => {
    if (ref.current) {
      const html = ref.current.innerHTML
      lastHtml.current = html
      onChange(html)
    }
  }

  const exec = (cmd) => (e) => {
    e.preventDefault()
    const sel = window.getSelection()
    if (savedRange.current && sel) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
    document.execCommand(cmd, false, null)
    emit()
  }

  const handleToggleList = (e) => {
    e.preventDefault()
    const range = restoreAndGetRange()
    if (!range) return

    // Check if inside a list already
    const ancestor = range.commonAncestorContainer
    const li = (ancestor.nodeType === 1 ? ancestor : ancestor.parentElement)?.closest('li')

    if (li) {
      // Unwrap: replace the whole <ul> with its text content as a plain line
      const ul = li.closest('ul')
      if (ul) {
        const text = document.createTextNode(ul.innerText)
        ul.replaceWith(text)
      }
    } else {
      // Wrap selected text (or current line) in <ul><li>
      const selectedText = range.toString() || '...'
      const li = document.createElement('li')
      li.textContent = selectedText

      if (!range.collapsed) {
        range.deleteContents()
      }

      const ul = document.createElement('ul')
      ul.appendChild(li)
      range.insertNode(ul)

      // Place cursor inside the li
      const newRange = document.createRange()
      newRange.selectNodeContents(li)
      newRange.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(newRange)
    }
    emit()
  }

  const handleRemoveFormat = (e) => {
    e.preventDefault()
    const range = restoreAndGetRange()
    if (!range || range.collapsed) return

    // Extract content, strip all tags, reinsert plain text
    const fragment = range.cloneContents()
    const plain = document.createTextNode(fragment.textContent || '')
    range.deleteContents()
    range.insertNode(plain)

    // Reselect the plain text
    const newRange = document.createRange()
    newRange.selectNodeContents(plain)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(newRange)

    emit()
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
        <ToolbarBtn onMouseDown={exec('bold')} title="Negrito">
          <Bold size={13} />
        </ToolbarBtn>
        <ToolbarBtn onMouseDown={exec('italic')} title="Italico">
          <Italic size={13} />
        </ToolbarBtn>
        <ToolbarBtn onMouseDown={exec('underline')} title="Sublinhado">
          <Underline size={13} />
        </ToolbarBtn>
        <ToolbarBtn onMouseDown={exec('strikeThrough')} title="Tachado">
          <Strikethrough size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-discord-card mx-1" />
        <ToolbarBtn onMouseDown={handleToggleList} title="Lista">
          <List size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-discord-card mx-1" />
        <ToolbarBtn onMouseDown={exec('justifyLeft')} title="Alinhar à esquerda">
          <AlignLeft size={13} />
        </ToolbarBtn>
        <ToolbarBtn onMouseDown={exec('justifyCenter')} title="Centralizar">
          <AlignCenter size={13} />
        </ToolbarBtn>
        <ToolbarBtn onMouseDown={exec('justifyRight')} title="Alinhar à direita">
          <AlignRight size={13} />
        </ToolbarBtn>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onSelect={saveSelection}
        data-placeholder={placeholder}
        className="min-h-[100px] px-3 py-2 text-sm text-white outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-discord-muted"
      />
    </div>
  )
}
