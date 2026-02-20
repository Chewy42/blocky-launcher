// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { StatusIndicator } from '../server/StatusIndicator'
import { StartStopButton } from '../server/StartStopButton'
import { useServerStore } from '../../store/serverStore'

interface TitleBarProps {
  serverName: string
  onStart: () => void
  onStop: () => void
}

export function TitleBar({ serverName, onStart, onStop }: TitleBarProps) {
  const { state } = useServerStore()

  return (
    <div className="titlebar-drag h-11 flex items-center px-4 gap-4 border-b border-white/8 bg-black/20 backdrop-blur-xl shrink-0">
      {/* Traffic lights spacer (macOS) */}
      <div className="w-16 shrink-0" />

      {/* App name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-5 h-5 rounded-md bg-blocky-green flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white/90">BlockyLauncher</span>
        {serverName && (
          <span className="text-sm text-white/35 truncate">— {serverName}</span>
        )}
      </div>

      {/* Right: status + quick actions */}
      <div className="titlebar-no-drag flex items-center gap-3 shrink-0">
        <StatusIndicator state={state} />
        <StartStopButton state={state} onStart={onStart} onStop={onStop} />
      </div>
    </div>
  )
}
