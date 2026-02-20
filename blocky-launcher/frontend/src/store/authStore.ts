// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { create } from 'zustand'

export interface AccountInfo {
  username: string
  displayName: string
  avatarUrl: string
  tier?: string
}

interface AuthStore {
  marketplace: AccountInfo | null
  networks: AccountInfo | null
  setMarketplace: (account: AccountInfo | null) => void
  setNetworks: (account: AccountInfo | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  marketplace: null,
  networks: null,
  setMarketplace: (account) => set({ marketplace: account }),
  setNetworks: (account) => set({ networks: account }),
}))
