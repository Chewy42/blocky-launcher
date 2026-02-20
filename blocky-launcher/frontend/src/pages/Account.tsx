// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useAuthStore } from '../store/authStore'
import { useAuth } from '../hooks/useAuth'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { AccountPlugins } from '../components/plugins/AccountPlugins'
import { App } from '../lib/wails'
import { useToastStore } from '../store/toastStore'
import { useState } from 'react'

export function AccountPage() {
  const { marketplace, networks } = useAuthStore()
  const { openMarketplaceLogin, openNetworksLogin, signOut } = useAuth()
  const push = useToastStore((s) => s.push)
  const [installingCompanion, setInstallingCompanion] = useState(false)

  const handleInstallCompanion = async () => {
    setInstallingCompanion(true)
    try {
      await App.InstallNetworksCompanion()
      push('BlockyNetworks companion installed ✓', 'success')
    } catch (err: unknown) {
      push(String(err), 'error')
    } finally {
      setInstallingCompanion(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4">

      {/* BlockyMarketplace */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blocky-green/15 border border-blocky-green/20 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-blocky-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">BlockyMarketplace</h3>
              <p className="text-xs text-white/40">blockymarketplace.com</p>
            </div>
          </div>
          {marketplace ? (
            <GlassButton size="sm" variant="ghost" onClick={() => signOut('blockymarketplace')}>
              Sign out
            </GlassButton>
          ) : (
            <GlassButton size="sm" variant="primary" onClick={openMarketplaceLogin}>
              Sign in
            </GlassButton>
          )}
        </div>

        {marketplace ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8">
              {marketplace.avatarUrl ? (
                <img src={marketplace.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-white/15" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blocky-green/20 border border-blocky-green/30 flex items-center justify-center text-lg font-bold text-blocky-green">
                  {marketplace.displayName?.[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{marketplace.displayName}</p>
                <p className="text-xs text-white/50">@{marketplace.username}</p>
                {marketplace.tier && <span className="badge badge-green text-xs mt-1">{marketplace.tier}</span>}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white/60 mb-2">Owned Plugins</h4>
              <AccountPlugins />
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/40">Sign in to load your purchased plugins</p>
        )}
      </GlassCard>

      {/* BlockyNetworks */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">BlockyNetworks</h3>
              <p className="text-xs text-white/40">blockynetworks.com</p>
            </div>
          </div>
          {networks ? (
            <GlassButton size="sm" variant="ghost" onClick={() => signOut('blockynetworks')}>
              Sign out
            </GlassButton>
          ) : (
            <GlassButton size="sm" variant="ghost" onClick={openNetworksLogin}>
              Sign in
            </GlassButton>
          )}
        </div>

        {networks ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg font-bold text-blue-400">
                {networks.displayName?.[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{networks.displayName}</p>
                <p className="text-xs text-white/50">@{networks.username}</p>
              </div>
            </div>
            <GlassButton
              variant="ghost"
              size="sm"
              loading={installingCompanion}
              onClick={handleInstallCompanion}
            >
              Install BlockyNetworks Companion
            </GlassButton>
          </div>
        ) : (
          <p className="text-sm text-white/40">Sign in to manage your BlockyNetworks servers</p>
        )}
      </GlassCard>

      {/* Disclaimer */}
      <div className="glass-card p-4">
        <p className="text-xs text-white/25 leading-relaxed">
          BlockyLauncher is an independent third-party tool developed by Favela Tech LLC.
          It is not affiliated with, endorsed by, or officially connected to Hypixel Studios or the Hytale game.
          "Hytale" is a trademark of Hypixel Studios. All trademarks belong to their respective owners.
        </p>
      </div>
    </div>
  )
}
