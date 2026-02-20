// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { motion, AnimatePresence } from 'framer-motion'
import { PluginCard } from './PluginCard'
import { DropZone } from './DropZone'
import { usePlugins } from '../../hooks/usePlugins'
import { App } from '../../lib/wails'
import { useToastStore } from '../../store/toastStore'

export function PluginList() {
  const { plugins, loading, remove, enable, disable, installFromPath } = usePlugins()
  const push = useToastStore((s) => s.push)

  const handleBrowse = async () => {
    const path = await App.OpenFileDialog()
    if (path) installFromPath(path)
  }

  const handleDrop = (paths: string[]) => {
    paths.forEach((p) => installFromPath(p))
    push(`Installing ${paths.length} plugin${paths.length > 1 ? 's' : ''}…`, 'info')
  }

  const handleToggle = (filename: string, enabled: boolean) => {
    if (enabled) enable(filename)
    else disable(filename)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Plugins</h3>
          {plugins.length > 0 && (
            <span className="badge badge-gray">{plugins.length}</span>
          )}
        </div>
        <button
          onClick={handleBrowse}
          className="flex items-center gap-1.5 text-xs font-medium text-blocky-green hover:text-blocky-green/80 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Plugin
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-white/30 text-sm">
          <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3l4-4-4-4v3a8 8 0 00-8 8h4z" />
          </svg>
          Scanning plugins…
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
          <AnimatePresence mode="popLayout">
            {plugins.map((plugin, i) => (
              <motion.div
                key={plugin.filename}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <PluginCard
                  plugin={plugin}
                  onRemove={remove}
                  onToggle={handleToggle}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {plugins.length === 0 && (
            <p className="text-center text-sm text-white/30 py-8">
              No plugins installed yet
            </p>
          )}
        </div>
      )}

      <DropZone onDrop={handleDrop} onBrowse={handleBrowse} />
    </div>
  )
}
