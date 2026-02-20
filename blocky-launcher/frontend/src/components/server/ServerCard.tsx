// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { StatusIndicator } from './StatusIndicator'
import { StartStopButton } from './StartStopButton'
import { ServerConfigModal } from './ServerConfigModal'
import { useServerStore } from '../../store/serverStore'

interface ServerCardProps {
  serverName: string
  serverFolder: string
  onStart: () => void
  onStop: () => void
}

export function ServerCard({ serverName, serverFolder, onStart, onStop }: ServerCardProps) {
  const { state } = useServerStore()
  const [configOpen, setConfigOpen] = useState(false)

  return (
    <>
      <GlassCard className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blocky-green/15 border border-blocky-green/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blocky-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{serverName || 'Hytale Server'}</h2>
            <p className="text-xs text-white/40 font-mono truncate mt-0.5">
              {serverFolder || 'No folder selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <StatusIndicator state={state} />
          <button
            onClick={() => setConfigOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors"
            title="Configure server"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
          <StartStopButton state={state} onStart={onStart} onStop={onStop} />
        </div>
      </GlassCard>

      <ServerConfigModal open={configOpen} onClose={() => setConfigOpen(false)} />
    </>
  )
}
