// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { App } from '../../lib/wails'
import { useToastStore } from '../../store/toastStore'
import { GlassButton } from '../ui/GlassButton'

interface OwnedPlugin {
  id: string
  name: string
  version: string
  description: string
  thumbnailUrl: string
  purchasedAt: string
  isInstalled: boolean
  updateAvailable: boolean
}

export function AccountPlugins() {
  const push = useToastStore((s) => s.push)
  const [plugins, setPlugins] = useState<OwnedPlugin[]>([])
  const [loading, setLoading] = useState(false)
  const [installing, setInstalling] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    App.GetOwnedPlugins()
      .then((list) => setPlugins(list ?? []))
      .catch(() => push('Failed to load owned plugins', 'error'))
      .finally(() => setLoading(false))
  }, [push])

  const handleInstall = async (plugin: OwnedPlugin) => {
    setInstalling(plugin.id)
    try {
      await App.InstallOwnedPlugin(plugin.id)
      setPlugins((prev) => prev.map((p) => p.id === plugin.id ? { ...p, isInstalled: true } : p))
      push(`${plugin.name} installed ✓`, 'success')
    } catch (err: unknown) {
      push(String(err), 'error')
    } finally {
      setInstalling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-white/30 text-sm gap-2">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3l4-4-4-4v3a8 8 0 00-8 8h4z" />
        </svg>
        Loading owned plugins…
      </div>
    )
  }

  if (plugins.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-white/40">No owned plugins found</p>
        <p className="text-xs text-white/25 mt-1">Visit BlockyMarketplace to discover plugins</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {plugins.map((plugin, i) => (
        <motion.div
          key={plugin.id}
          className="glass-card p-3 flex items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white truncate">{plugin.name}</span>
              <span className="text-xs text-white/40 font-mono">v{plugin.version}</span>
              {plugin.updateAvailable && (
                <span className="badge badge-yellow text-xs">Update</span>
              )}
            </div>
            {plugin.description && (
              <p className="text-xs text-white/40 mt-0.5 truncate">{plugin.description}</p>
            )}
          </div>
          {plugin.isInstalled ? (
            <span className="badge badge-green shrink-0">Installed</span>
          ) : (
            <GlassButton
              variant="primary"
              size="sm"
              loading={installing === plugin.id}
              onClick={() => handleInstall(plugin)}
            >
              Install
            </GlassButton>
          )}
        </motion.div>
      ))}
    </div>
  )
}
