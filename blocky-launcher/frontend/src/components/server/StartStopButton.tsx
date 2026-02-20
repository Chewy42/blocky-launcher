// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { motion } from 'framer-motion'
import { ServerState } from '../../store/serverStore'

interface StartStopButtonProps {
  state: ServerState
  onStart: () => void
  onStop: () => void
}

export function StartStopButton({ state, onStart, onStop }: StartStopButtonProps) {
  const isRunning = state === 'RUNNING'
  const isTransitioning = state === 'STARTING' || state === 'STOPPING'
  const isCrashed = state === 'CRASHED'

  const handleClick = () => {
    if (isTransitioning) return
    if (isRunning) onStop()
    else onStart()
  }

  const label = {
    STOPPED: 'Start Server',
    STARTING: 'Starting…',
    RUNNING: 'Stop Server',
    STOPPING: 'Stopping…',
    CRASHED: 'Restart Server',
  }[state]

  return (
    <motion.button
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
        transition-all duration-150 select-none
        ${isRunning || isCrashed
          ? 'glass-button-danger'
          : isTransitioning
          ? 'opacity-60 cursor-not-allowed glass-button-ghost'
          : 'glass-button-primary'
        }
      `}
      onClick={handleClick}
      disabled={isTransitioning}
      whileTap={!isTransitioning ? { scale: 0.96 } : undefined}
    >
      {isTransitioning ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3l4-4-4-4v3a8 8 0 00-8 8h4z" />
        </svg>
      ) : isRunning || isCrashed ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      {label}
    </motion.button>
  )
}
