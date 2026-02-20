// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useRef, useEffect, useState, useCallback } from 'react'
import { useTerminal } from '../../hooks/useTerminal'
import { useServer } from '../../hooks/useServer'
import { stripAnsi } from '../../lib/utils'

const lineColor: Record<string, string> = {
  INFO: 'text-white/75',
  WARN: 'text-yellow-400',
  ERROR: 'text-red-400',
  DONE: 'text-emerald-400',
  DEFAULT: 'text-white/60',
}

export function Terminal() {
  const { lines, clear, commandHistory, historyIndex, setHistoryIndex, pushHistory } = useTerminal()
  const { sendCommand, state } = useServer()
  const [input, setInput] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [fontSize, setFontSize] = useState(13)
  const [searchQuery, setSearchQuery] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [lines, autoScroll])

  const handleSubmit = useCallback(async () => {
    const cmd = input.trim()
    if (!cmd) return
    pushHistory(cmd)
    setInput('')
    await sendCommand(cmd)
  }, [input, sendCommand, pushHistory])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(next)
      setInput(commandHistory[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(historyIndex - 1, -1)
      setHistoryIndex(next)
      setInput(next === -1 ? '' : commandHistory[next] ?? '')
    }
  }

  const filteredLines = searchQuery
    ? lines.filter((l) => l.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : lines

  return (
    <div className="glass-terminal flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/6">
        <div className="flex items-center gap-1.5 flex-1">
          <input
            className="glass-input text-xs px-2.5 py-1 w-40 font-mono"
            placeholder="Search output…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white/60 text-xs">✕</button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize((s) => Math.max(10, s - 1))}
            className="w-6 h-6 text-white/40 hover:text-white/70 transition-colors text-xs font-mono"
          >A-</button>
          <button
            onClick={() => setFontSize((s) => Math.min(18, s + 1))}
            className="w-6 h-6 text-white/40 hover:text-white/70 transition-colors text-xs font-mono"
          >A+</button>
          <button
            onClick={() => setAutoScroll((s) => !s)}
            className={`w-6 h-6 transition-colors text-xs ${autoScroll ? 'text-blocky-green' : 'text-white/30 hover:text-white/60'}`}
            title="Auto-scroll"
          >↓</button>
          <button
            onClick={() => {
              const text = lines.map((l) => `[${l.timestamp}] ${l.text}`).join('\n')
              navigator.clipboard.writeText(text)
            }}
            className="w-6 h-6 text-white/30 hover:text-white/60 transition-colors"
            title="Copy all"
          >
            <svg className="w-3.5 h-3.5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          <button
            onClick={clear}
            className="w-6 h-6 text-white/30 hover:text-red-400 transition-colors"
            title="Clear"
          >
            <svg className="w-3.5 h-3.5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Output */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2 selectable"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: `${fontSize}px`, lineHeight: 1.6 }}
        onClick={() => inputRef.current?.focus()}
      >
        {filteredLines.map((line, i) => (
          <div
            key={i}
            className={`${lineColor[line.type] ?? 'text-white/60'} leading-6`}
            style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}
          >
            {stripAnsi(line.text)}
          </div>
        ))}
        {filteredLines.length === 0 && !searchQuery && (
          <div className="text-white/20 text-sm mt-4 text-center">
            Server output will appear here
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-white/6 flex items-center gap-2">
        <span className="text-blocky-green text-sm font-mono shrink-0">{'>'}</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-white/85 text-sm font-mono outline-none placeholder-white/25 selectable"
          style={{ fontSize: `${fontSize}px` }}
          placeholder={state === 'RUNNING' ? 'Send command…' : 'Server not running'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={state !== 'RUNNING'}
        />
      </div>
    </div>
  )
}
