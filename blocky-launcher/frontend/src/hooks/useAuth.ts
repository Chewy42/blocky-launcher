// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useCallback } from 'react'
import { App } from '../lib/wails'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export function useAuth() {
  const { marketplace, networks, setMarketplace, setNetworks } = useAuthStore()
  const push = useToastStore((s) => s.push)

  const openMarketplaceLogin = useCallback(async () => {
    try {
      const url = await App.GetMarketplaceAuthURL()
      await App.OpenURL(url)
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [push])

  const openNetworksLogin = useCallback(async () => {
    try {
      const url = await App.GetNetworksAuthURL()
      await App.OpenURL(url)
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [push])

  const signOut = useCallback(async (service: string) => {
    try {
      await App.SignOut(service)
      if (service === 'blockymarketplace') setMarketplace(null)
      if (service === 'blockynetworks') setNetworks(null)
      push('Signed out', 'success')
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }, [setMarketplace, setNetworks, push])

  return {
    marketplace,
    networks,
    openMarketplaceLogin,
    openNetworksLogin,
    signOut,
  }
}
