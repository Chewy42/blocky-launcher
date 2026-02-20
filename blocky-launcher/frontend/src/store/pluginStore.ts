// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { create } from 'zustand'

export interface Plugin {
  filename: string
  path: string
  name: string
  version: string
  description: string
  author: string
  enabled: boolean
  fileSize: number
  source: string
  sourceId: string
  installedAt: string
}

interface PluginStore {
  plugins: Plugin[]
  loading: boolean
  setPlugins: (plugins: Plugin[]) => void
  setLoading: (loading: boolean) => void
  removePlugin: (filename: string) => void
  togglePlugin: (filename: string, enabled: boolean) => void
}

export const usePluginStore = create<PluginStore>((set) => ({
  plugins: [],
  loading: false,
  setPlugins: (plugins) => set({ plugins }),
  setLoading: (loading) => set({ loading }),
  removePlugin: (filename) =>
    set((s) => ({ plugins: s.plugins.filter((p) => p.filename !== filename) })),
  togglePlugin: (filename, enabled) =>
    set((s) => ({
      plugins: s.plugins.map((p) =>
        p.filename === filename ? { ...p, enabled } : p
      ),
    })),
}))
