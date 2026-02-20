// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useCallback } from 'react'
import { App } from '../lib/wails'
import { usePluginStore } from '../store/pluginStore'
import { useToastStore } from '../store/toastStore'

export function usePlugins() {
  const { plugins, loading, setPlugins, setLoading, removePlugin, togglePlugin } = usePluginStore()
  const push = useToastStore((s) => s.push)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await App.GetPlugins()
      setPlugins(list ?? [])
    } catch (err: unknown) {
      push(String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [setPlugins, setLoading, push])

  const installFromPath = useCallback(async (path: string) => {
    try {
      await App.InstallPluginFromPath(path)
      push('Plugin installed', 'success')
      await refresh()
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [push, refresh])

  const remove = useCallback(async (filename: string) => {
    try {
      await App.RemovePlugin(filename)
      removePlugin(filename)
      push('Plugin removed', 'success')
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [removePlugin, push])

  const enable = useCallback(async (filename: string) => {
    try {
      await App.EnablePlugin(filename)
      togglePlugin(filename, true)
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [togglePlugin, push])

  const disable = useCallback(async (filename: string) => {
    try {
      await App.DisablePlugin(filename)
      togglePlugin(filename, false)
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [togglePlugin, push])

  return { plugins, loading, refresh, installFromPath, remove, enable, disable }
}
