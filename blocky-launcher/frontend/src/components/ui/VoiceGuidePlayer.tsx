// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useVoiceGuide } from '../../hooks/useVoiceGuide'

interface VoiceGuidePlayerProps {
  /** Resolved URL/path of the audio file. Pass null to suppress the player. */
  src: string | null
  /** Human-readable label for the current step, used in aria-label. */
  label: string
  /** Auto-play when src mounts. Defaults to false. */
  autoPlay?: boolean
  /**
   * Fallback caption text shown when audio is unavailable or the user skips
   * the voice guide. If omitted, the player simply hides on unavailable/skip.
   */
  captions?: string
  className?: string
}

function formatTime(s: number): string {
  if (!isFinite(s) || s <= 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/** Compact accessible voice-guide player bar. */
export function VoiceGuidePlayer({ src, label, autoPlay = false, captions, className }: VoiceGuidePlayerProps) {
  const guide = useVoiceGuide(src)
  const [dismissed, setDismissed] = useState(false)

  // Reset dismissed state whenever the source changes (new onboarding step).
  useEffect(() => {
    setDismissed(false)
  }, [src])

  // Auto-play once audio becomes ready (unless already dismissed).
  useEffect(() => {
    if (!dismissed && autoPlay && guide.state === 'idle') {
      guide.play()
    }
  }, [autoPlay, guide.state, dismissed]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcut: Space bar toggles play/pause while player is focused.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        guide.toggle()
      }
    },
    [guide],
  )

  const handleSkip = useCallback(() => {
    guide.pause()
    setDismissed(true)
  }, [guide])

  // Show caption fallback when the user dismissed the audio or it is unavailable.
  if (dismissed || guide.state === 'unavailable') {
    if (!captions) return null
    return (
      <motion.div
        role="note"
        aria-label={`Voice guide caption: ${label}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'flex items-start gap-2.5 rounded-xl px-4 py-3',
          'bg-white/5 border border-white/10',
          className,
        )}
      >
        {/* Speech-bubble icon */}
        <svg
          className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20 2H4a2 2 0 00-2 2v12a2 2 0 002 2h14l4 4V4a2 2 0 00-2-2z" />
        </svg>
        <p className="text-xs text-white/50 leading-relaxed">{captions}</p>
      </motion.div>
    )
  }

  const isPlaying = guide.state === 'playing'
  const isLoading = guide.state === 'loading'
  const progress = guide.duration > 0 ? (guide.currentTime / guide.duration) * 100 : 0

  return (
    <AnimatePresence>
      <motion.div
        role="region"
        aria-label={`Voice guide: ${label}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'flex items-center gap-3 rounded-xl px-4 py-2.5',
          'bg-white/5 border border-white/10 backdrop-blur-sm',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blocky-green/60',
          className,
        )}
      >
        {/* Play / Pause button */}
        <button
          type="button"
          aria-label={isPlaying ? 'Pause voice guide' : 'Play voice guide'}
          onClick={guide.toggle}
          disabled={isLoading}
          className={cn(
            'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-colors',
            'bg-blocky-green/20 hover:bg-blocky-green/35 border border-blocky-green/30',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blocky-green/60',
          )}
        >
          {isLoading ? (
            <svg className="w-3.5 h-3.5 animate-spin text-blocky-green" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          ) : isPlaying ? (
            // Pause icon
            <svg className="w-3.5 h-3.5 text-blocky-green" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            // Play icon
            <svg className="w-3.5 h-3.5 text-blocky-green translate-x-px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>

        {/* Waveform / progress section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/40 font-medium truncate">Voice Guide</span>
            <span className="text-xs text-white/30 tabular-nums flex-shrink-0 ml-2">
              {formatTime(guide.currentTime)}
              {guide.duration > 0 && ` / ${formatTime(guide.duration)}`}
            </span>
          </div>

          {/* Seekable progress bar */}
          <div
            role="slider"
            aria-label="Voice guide playback position"
            aria-valuemin={0}
            aria-valuemax={guide.duration || 0}
            aria-valuenow={guide.currentTime}
            aria-valuetext={`${formatTime(guide.currentTime)} of ${formatTime(guide.duration)}`}
            tabIndex={0}
            className="relative h-1.5 rounded-full bg-white/10 cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              guide.seek(ratio * guide.duration)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') guide.seek(guide.currentTime + 5)
              if (e.key === 'ArrowLeft') guide.seek(guide.currentTime - 5)
            }}
          >
            <div
              className="h-full rounded-full bg-blocky-green transition-all"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blocky-green shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mute toggle */}
        <button
          type="button"
          aria-label={guide.muted ? 'Unmute voice guide' : 'Mute voice guide'}
          aria-pressed={guide.muted}
          onClick={guide.toggleMuted}
          className={cn(
            'w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors',
            'hover:bg-white/10 border border-transparent hover:border-white/10',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blocky-green/60',
            guide.muted ? 'text-white/30' : 'text-white/50',
          )}
        >
          {guide.muted ? (
            // Muted icon
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
          ) : (
            // Volume icon
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          )}
        </button>

        {/* Skip / dismiss button */}
        <button
          type="button"
          aria-label="Skip voice guide"
          onClick={handleSkip}
          className={cn(
            'w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors',
            'hover:bg-white/10 border border-transparent hover:border-white/10',
            'text-white/30 hover:text-white/50',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blocky-green/60',
          )}
        >
          {/* × close icon */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
