// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useEffect, useRef, useState, useCallback } from 'react'

export type VoiceGuideState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'unavailable'

export interface VoiceGuideControls {
  state: VoiceGuideState
  currentTime: number
  duration: number
  muted: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (seconds: number) => void
  setMuted: (muted: boolean) => void
  toggleMuted: () => void
}

/**
 * Manages audio playback for a single voice guide track.
 * Gracefully degrades to 'unavailable' state if the audio file is missing or
 * the browser cannot decode it.
 */
export function useVoiceGuide(src: string | null): VoiceGuideControls {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<VoiceGuideState>('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMutedState] = useState(false)

  // Rebuild the audio element whenever the source changes.
  useEffect(() => {
    if (!src) {
      setState('unavailable')
      return
    }

    const audio = new Audio()
    audioRef.current = audio

    setState('loading')
    setCurrentTime(0)
    setDuration(0)

    const onCanPlay = () => setState((s) => (s === 'loading' ? 'idle' : s))
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => setState('ended')
    const onError = () => setState('unavailable')
    const onPlay = () => setState('playing')
    const onPause = () => setState((s) => (s !== 'ended' ? 'paused' : s))

    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    audio.src = src
    audio.load()

    return () => {
      audio.pause()
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.src = ''
      audioRef.current = null
    }
  }, [src])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (state === 'ended') {
      audio.currentTime = 0
    }
    audio.play().catch(() => setState('unavailable'))
  }, [state])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    if (state === 'playing') {
      pause()
    } else {
      play()
    }
  }, [state, play, pause])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0))
  }, [])

  const setMuted = useCallback((value: boolean) => {
    if (audioRef.current) audioRef.current.muted = value
    setMutedState(value)
  }, [])

  const toggleMuted = useCallback(() => setMuted(!muted), [muted, setMuted])

  return { state, currentTime, duration, muted, play, pause, toggle, seek, setMuted, toggleMuted }
}
