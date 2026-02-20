// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { create } from 'zustand'

export type ServerState = 'STOPPED' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'CRASHED'

interface ServerStore {
  state: ServerState
  stateInfo: string
  setState: (state: ServerState, info?: string) => void
}

export const useServerStore = create<ServerStore>((set) => ({
  state: 'STOPPED',
  stateInfo: '',
  setState: (state, info = '') => set({ state, stateInfo: info }),
}))
