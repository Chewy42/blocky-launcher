// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState } from 'react'
import { PluginList } from '../components/plugins/PluginList'
import { AccountPlugins } from '../components/plugins/AccountPlugins'
import { useAuthStore } from '../store/authStore'

type Tab = 'installed' | 'account'

export function PluginsPage() {
  const [tab, setTab] = useState<Tab>('installed')
  const marketplace = useAuthStore((s) => s.marketplace)

  return (
    <div className="h-full flex flex-col p-5 gap-4">
      <div className="flex items-center gap-1 glass-card p-1 self-start">
        {(['installed', 'account'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white/12 text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {t === 'installed' ? 'Installed' : 'My Account'}
          </button>
        ))}
      </div>

      <div className="flex-1 glass-card p-5 overflow-y-auto min-h-0">
        {tab === 'installed' && <PluginList />}
        {tab === 'account' && (
          marketplace
            ? <AccountPlugins />
            : (
              <div className="text-center py-12">
                <p className="text-white/50 text-sm mb-2">Sign in to view your purchased plugins</p>
                <p className="text-white/30 text-xs">Go to Account to sign in to BlockyMarketplace</p>
              </div>
            )
        )}
      </div>
    </div>
  )
}
