// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { ServerState } from '../../store/serverStore'
import { cn } from '../../lib/utils'

interface StatusIndicatorProps {
  state: ServerState
  showLabel?: boolean
}

const labels: Record<ServerState, string> = {
  STOPPED: 'Stopped',
  STARTING: 'Starting…',
  RUNNING: 'Running',
  STOPPING: 'Stopping…',
  CRASHED: 'Crashed',
}

const dotClass: Record<ServerState, string> = {
  STOPPED: 'status-dot-stopped',
  STARTING: 'status-dot-starting',
  RUNNING: 'status-dot-running',
  STOPPING: 'status-dot-stopping',
  CRASHED: 'status-dot-crashed',
}

const labelColor: Record<ServerState, string> = {
  STOPPED: 'text-white/40',
  STARTING: 'text-yellow-400',
  RUNNING: 'text-emerald-400',
  STOPPING: 'text-yellow-400',
  CRASHED: 'text-red-400',
}

export function StatusIndicator({ state, showLabel = true }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn('status-dot', dotClass[state])} />
      {showLabel && (
        <span className={cn('text-sm font-medium', labelColor[state])}>
          {labels[state]}
        </span>
      )}
    </div>
  )
}
