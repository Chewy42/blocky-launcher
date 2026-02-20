// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useCallback } from 'react'
import { App } from '../lib/wails'
import { useServerStore } from '../store/serverStore'
import { useToastStore } from '../store/toastStore'

export function useServer() {
  const { state, setState } = useServerStore()
  const push = useToastStore((s) => s.push)

  const startServer = useCallback(async () => {
    try {
      setState('STARTING')
      await App.StartServer()
    } catch (err: unknown) {
      setState('STOPPED')
      push(String(err), 'error')
    }
  }, [setState, push])

  const stopServer = useCallback(async () => {
    try {
      setState('STOPPING')
      await App.StopServer()
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [setState, push])

  const sendCommand = useCallback(async (cmd: string) => {
    try {
      await App.SendCommand(cmd)
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [push])

  return { state, startServer, stopServer, sendCommand }
}
