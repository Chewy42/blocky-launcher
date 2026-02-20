// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState, useCallback, useEffect, useRef } from 'react'
import { App, EventsOn, Events } from '../lib/wails'

export interface TerminalLine {
  text: string
  type: string
  timestamp: string
}

export function useTerminal(maxLines = 5000) {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const linesRef = useRef<TerminalLine[]>([])

  const addLine = useCallback((line: TerminalLine) => {
    linesRef.current = [...linesRef.current, line].slice(-maxLines)
    setLines([...linesRef.current])
  }, [maxLines])

  useEffect(() => {
    App.GetTerminalHistory().then((history) => {
      if (history) {
        linesRef.current = history
        setLines(history)
      }
    })

    const unsub1 = EventsOn(Events.TERMINAL_LINE, (line: TerminalLine) => {
      addLine(line)
    })
    const unsub2 = EventsOn(Events.TERMINAL_CLEAR, () => {
      linesRef.current = []
      setLines([])
    })

    return () => {
      unsub1?.()
      unsub2?.()
    }
  }, [addLine])

  const clear = useCallback(async () => {
    await App.ClearTerminal()
    linesRef.current = []
    setLines([])
  }, [])

  const pushHistory = useCallback((cmd: string) => {
    setCommandHistory((prev) => {
      const next = [cmd, ...prev.filter((c) => c !== cmd)].slice(0, 100)
      return next
    })
    setHistoryIndex(-1)
  }, [])

  return {
    lines,
    clear,
    commandHistory,
    historyIndex,
    setHistoryIndex,
    pushHistory,
  }
}
